import { useState, useMemo } from "react";
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
import { EmailConfirmationStep } from "./booking/EmailConfirmationStep";
import { PaymentMethodStep } from "./booking/PaymentMethodStep";
import { toast } from "sonner";

type BookingStep = "seats" | "email" | "payment";

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

// Generate seat layout based on bus type
function generateSeats(totalSeats: number, occupiedSeats: number): Seat[] {
  const seats: Seat[] = [];
  const bookedSeatNumbers = new Set<number>();
  
  // Randomly select booked seats
  while (bookedSeatNumbers.size < occupiedSeats) {
    bookedSeatNumbers.add(Math.floor(Math.random() * totalSeats) + 1);
  }

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
  const [seats, setSeats] = useState<Seat[]>(() => 
    generateSeats(bus.totalSeats, bus.occupiedSeats)
  );
  const [currentStep, setCurrentStep] = useState<BookingStep>("seats");
  const [userEmail, setUserEmail] = useState("");

  const travelDate = journeyDate
    ? journeyDate.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  
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
  
  const handleProceedToEmail = () => {
    if (selectedSeats.length > 0) {
      setCurrentStep("email");
    }
  };

  const handleEmailConfirm = (email: string) => {
    setUserEmail(email);
    setCurrentStep("payment");
  };

  const handlePaymentConfirm = (method: string) => {
    toast.success(`Booking confirmed! Payment via ${method}`, {
      description: `Confirmation sent to ${userEmail}`,
    });
    onOpenChange(false);
    // Reset state for next booking
    setCurrentStep("seats");
    setUserEmail("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCurrentStep("seats");
      setUserEmail("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {currentStep === "seats" && "Select Your Seats – BusOnGo"}
            {currentStep === "email" && "Confirm Email – BusOnGo"}
            {currentStep === "payment" && "Payment – BusOnGo"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {bus.from} → {bus.to} | {bus.departureTime} - {bus.arrivalTime}
          </p>
        </DialogHeader>

        {/* Email Confirmation Step */}
        {currentStep === "email" && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <EmailConfirmationStep
              onConfirm={handleEmailConfirm}
              onBack={() => setCurrentStep("seats")}
              totalFare={totalFare}
              selectedSeatsCount={selectedSeats.length}
              route={`${bus.from} → ${bus.to}`}
              seatNumbers={selectedSeats.map((s) => s.number)}
              travelDate={travelDate}
            />
          </div>
        )}

        {/* Payment Method Step */}
        {currentStep === "payment" && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <PaymentMethodStep
              onConfirm={handlePaymentConfirm}
              onBack={() => setCurrentStep("email")}
              totalFare={totalFare}
              email={userEmail}
            />
          </div>
        )}

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
                onClick={handleProceedToEmail}
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
