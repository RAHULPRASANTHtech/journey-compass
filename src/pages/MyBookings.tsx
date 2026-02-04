import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBookings, cancelBooking } from "@/lib/database";
import { sendCancelBooking } from "@/lib/booking-api";
import { SignInModal } from "@/components/SignInModal";
import { useState, useMemo } from "react";
import { Bus, Ticket, ArrowLeft, Calendar, MapPin, CreditCard, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Booking } from "@/lib/database";

export default function MyBookings() {
  const { isLoggedIn, userEmail } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const bookings = useMemo(
    () => (isLoggedIn && userEmail ? getUserBookings(userEmail) : []),
    [isLoggedIn, userEmail, refreshKey]
  );

  const normalizedStatus = (s: string) =>
    s === "confirmed" || s === "cancelled" ? s.toUpperCase() : s;
  const isCancelled = (b: Booking) =>
    normalizedStatus(b.status) === "CANCELLED";

  const handleCancelClick = (booking: Booking) => {
    setCancelTarget(booking);
  };

const handleCancelConfirm = async () => {
  if (!cancelTarget || !userEmail) return;

  setIsCancelling(true);
  try {
    // Update DB
    cancelBooking(cancelTarget.id, userEmail);

    // 🔽 SEND FULL DATA TO WEBHOOK
    await sendCancelBooking({
      bookingId: cancelTarget.id,
      userEmail,

      from: cancelTarget.from,
      to: cancelTarget.to,
      date: cancelTarget.date,
      time: cancelTarget.time ?? "",
      seat: cancelTarget.seatNumbers.join(", "),
      busId: cancelTarget.busId,
    });

    toast.success("Booking cancelled");
    setRefreshKey((k) => k + 1);
    setCancelTarget(null);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to cancel");
  } finally {
    setIsCancelling(false);
  }
};


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                My Bookings
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isLoggedIn
                ? `Bookings for ${userEmail}`
                : "Sign in to view your booking history"}
            </p>
          </div>

          {!isLoggedIn && (
            <Button onClick={() => setSignInOpen(true)}>Sign In</Button>
          )}
        </div>

        {!isLoggedIn ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Bus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sign in to view bookings
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Your booking history is saved to your account. Sign in with your
                email to see all your past and upcoming trips.
              </p>
              <Button onClick={() => setSignInOpen(true)}>Sign In</Button>
            </CardContent>
          </Card>
        ) : bookings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No bookings yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You haven't made any bookings. Search for buses and book your
                next trip!
              </p>
              <Link to="/">
                <Button>Search Buses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-mono text-muted-foreground">
                      {booking.id}
                    </span>
                    <Badge
                      variant={
                        normalizedStatus(booking.status) === "CONFIRMED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {normalizedStatus(booking.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    {booking.from ?? "—"} → {booking.to ?? "—"}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {booking.date}
                      {booking.time && ` • ${booking.time}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bus className="h-4 w-4" />
                      Seats:{" "}
                      {booking.seatNumbersDisplay?.join(", ") ??
                        booking.seatNumbers.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      ₹{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Booked on {format(new Date(booking.createdAt), "PPp")}
                  </p>

                  {!isCancelled(booking) && (
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancelClick(booking)}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <SignInModal
        open={signInOpen}
        onOpenChange={setSignInOpen}
        reason="Sign in to view your booking history"
      />

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open && !isCancelling) setCancelTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelConfirm();
              }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelling…
                </>
              ) : (
                "Yes, cancel booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
