import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bus } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentMethodStep } from "./booking/PaymentMethodStep";
import { SignInModal } from "./SignInModal";
import { getBookedSeats, createBooking } from "@/lib/database";
import { sendBookingConfirmation } from "@/lib/booking-api";
import { toast } from "sonner";

type BookingStep = "seats" | "payment";

interface SeatSelectionModalProps {
  bus: Bus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SeatStatus = "available" | "booked" | "selected";

interface Seat {
  id: string;
  number: string;
  status: SeatStatus;
  row: number;
  position: "window-left" | "aisle-left" | "aisle-right" | "window-right";
  deck: "lower" | "upper";
}

// Parse seat number (L1, U2, etc.) to numeric 1-based index
function parseSeatNumber(displayNum: string): number {
  const match = displayNum.match(/^[LU](\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

// Generate seat layout based on bus type (bookedSeatNumbers from database)
function generateSeats(totalSeats: number, bookedSeatNumbers: Set<number>): Seat[] {
  const seats: Seat[] = [];

  // For sleeper buses, we'll create a 2+1 layout (common in India)
  const seatsPerRow = 3;
  const totalRows = Math.ceil(totalSeats / seatsPerRow);
  
  let seatCount = 1;
  
  for (let row = 0; row < totalRows && seatCount <= totalSeats; row++) {
    // Left side - 2 berths
    if (seatCount <= totalSeats) {
      seats.push({
        id: `L${row}-1`,
        number: `L${seatCount}`,
        status: bookedSeatNumbers.has(seatCount) ? "booked" : "available",
        row,
        position: "window-left",
        deck: "lower",
      });
      seatCount++;
    }
    
    if (seatCount <= totalSeats) {
      seats.push({
        id: `L${row}-2`,
        number: `L${seatCount}`,
        status: bookedSeatNumbers.has(seatCount) ? "booked" : "available",
        row,
        position: "aisle-left",
        deck: "lower",
      });
      seatCount++;
    }
    
    // Right side - 1 berth
    if (seatCount <= totalSeats) {
      seats.push({
        id: `L${row}-3`,
        number: `U${seatCount}`,
        status: bookedSeatNumbers.has(seatCount) ? "booked" : "available",
        row,
        position: "window-right",
        deck: "lower",
      });
      seatCount++;
    }
  }
  
  return seats;
}

export function SeatSelectionModal({ bus, open, onOpenChange }: SeatSelectionModalProps) {
  const { journeyDate } = useApp();
  const travelDate = journeyDate
    ? journeyDate.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const bookedFromDb = useMemo(
    () => new Set(getBookedSeats(bus.id, travelDate)),
    [bus.id, travelDate]
  );
  const [seats, setSeats] = useState<Seat[]>(() =>
    generateSeats(bus.totalSeats, bookedFromDb)
  );

  useEffect(() => {
    if (open) {
      const booked = new Set(getBookedSeats(bus.id, travelDate));
      setSeats(generateSeats(bus.totalSeats, booked));
    }
  }, [open, bus.id, bus.totalSeats, travelDate]);
  const [currentStep, setCurrentStep] = useState<BookingStep>("seats");
  const [signInOpen, setSignInOpen] = useState(false);
  const { isLoggedIn, userEmail } = useAuth();

  const selectedSeats = useMemo(() => 
    seats.filter(seat => seat.status === "selected"),
    [seats]
  );
  
  const totalFare = selectedSeats.length * bus.price;
  
  const handleSeatClick = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.id === seatId && seat.status !== "booked") {
          return {
            ...seat,
            status: seat.status === "selected" ? "available" : "selected",
          };
        }
        return seat;
      })
    );
  };
  
  const getSeatStyle = (status: SeatStatus) => {
    switch (status) {
      case "available":
        return "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary cursor-pointer text-primary";
      case "booked":
        return "bg-muted border-muted-foreground/20 cursor-not-allowed text-muted-foreground opacity-60";
      case "selected":
        return "bg-primary border-primary text-primary-foreground cursor-pointer";
      default:
        return "";
    }
  };
  
  // Group seats by row
  const seatsByRow = useMemo(() => {
    const grouped: Record<number, Seat[]> = {};
    seats.forEach(seat => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    });
    return grouped;
  }, [seats]);
  
  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) return;
    if (!isLoggedIn || !userEmail) {
      setSignInOpen(true);
      return;
    }
    setCurrentStep("payment");
  };

  const handleSignInSuccess = () => {
    setSignInOpen(false);
    setCurrentStep("payment");
  };

  const handlePaymentConfirm = (method: string) => {
    if (!userEmail) {
      toast.error("Please sign in to complete booking");
      setSignInOpen(true);
      return;
    }
    const seatNumbers = selectedSeats
      .map((s) => parseSeatNumber(s.number))
      .filter((n) => n > 0);
    const seatNumbersDisplay = selectedSeats.map((s) => s.number);
    try {
      const booking = createBooking(
        bus.id,
        bus.from,
        bus.to,
        travelDate,
        bus.departureTime,
        seatNumbers,
        seatNumbersDisplay,
        userEmail,
        method,
        totalFare
      );
      sendBookingConfirmation({
        busId: bus.id,
        from: bus.from,
        to: bus.to,
        date: travelDate,
        time: bus.departureTime,
        seat: seatNumbersDisplay.join(", "),
        bookingId: booking.id,
        userEmail,
      });
      toast.success(`Booking confirmed! Payment via ${method}`, {
        description: `Confirmation sent to ${userEmail}. Booking ID: ${booking.id}`,
      });
      onOpenChange(false);
      setCurrentStep("seats");
    } catch (err) {
      toast.error("Booking failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCurrentStep("seats");
      setSignInOpen(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {currentStep === "seats" && "Select Your Seats – BusOnGo"}
            {currentStep === "payment" && "Payment – BusOnGo"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {bus.from} → {bus.to} | {bus.departureTime} - {bus.arrivalTime}
          </p>
        </DialogHeader>

        {/* Payment Method Step */}
        {currentStep === "payment" && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <PaymentMethodStep
              onConfirm={handlePaymentConfirm}
              onBack={() => setCurrentStep("seats")}
              totalFare={totalFare}
              email={userEmail ?? ""}
            />
          </div>
        )}

        <SignInModal
          open={signInOpen}
          onOpenChange={setSignInOpen}
          reason="Sign in to complete your booking"
          onSuccess={handleSignInSuccess}
        />

        {/* Seat Selection Step */}
        {currentStep === "seats" && (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 py-3 px-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 bg-primary/10 border-primary/30" />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 bg-primary border-primary" />
                <span className="text-sm text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border-2 bg-muted border-muted-foreground/20 opacity-60" />
                <span className="text-sm text-muted-foreground">Booked</span>
              </div>
            </div>
            
            {/* Bus Layout */}
            <div className="flex-1 overflow-auto py-4">
              <div className="bg-card border border-border rounded-xl p-4">
                {/* Driver section */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">🚌</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Driver</span>
                  </div>
                  <Badge variant="secondary">Lower Deck - Sleeper</Badge>
                </div>
                
                {/* Seat Grid */}
                <div className="space-y-3">
                  {Object.entries(seatsByRow).map(([rowNum, rowSeats]) => (
                    <div key={rowNum} className="flex items-center gap-2">
                      {/* Left side seats (2 berths) */}
                      <div className="flex gap-1">
                        {rowSeats
                          .filter(s => s.position === "window-left" || s.position === "aisle-left")
                          .map(seat => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat.id)}
                              disabled={seat.status === "booked"}
                              className={cn(
                                "w-14 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200",
                                getSeatStyle(seat.status)
                              )}
                              title={seat.status === "booked" ? "This seat is already booked" : `Seat ${seat.number}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                      </div>
                      
                      {/* Aisle */}
                      <div className="w-8 flex items-center justify-center">
                        <div className="w-full h-px bg-border" />
                      </div>
                      
                      {/* Right side seat (1 berth) */}
                      <div className="flex gap-1">
                        {rowSeats
                          .filter(s => s.position === "window-right")
                          .map(seat => (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat.id)}
                              disabled={seat.status === "booked"}
                              className={cn(
                                "w-14 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200",
                                getSeatStyle(seat.status)
                              )}
                              title={seat.status === "booked" ? "This seat is already booked" : `Seat ${seat.number}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Footer with selection summary */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Seats</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map(seat => (
                        <Badge key={seat.id} variant="secondary" className="text-xs">
                          {seat.number}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No seats selected</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Fare</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{totalFare.toLocaleString()}
                  </p>
                  {selectedSeats.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ({selectedSeats.length} × ₹{bus.price.toLocaleString()})
                    </p>
                  )}
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                disabled={selectedSeats.length === 0}
                onClick={handleProceedToPayment}
              >
                {selectedSeats.length > 0 
                  ? `Proceed to Pay ₹${totalFare.toLocaleString()}`
                  : "Select seats to continue"
                }
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
