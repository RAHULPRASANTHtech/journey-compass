import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

const BOOKING_WEBHOOK_URL = "https://sharvan.app.n8n.cloud/webhook/booking-completed";

interface EmailConfirmationStepProps {
  onConfirm: (email: string) => void;
  onBack: () => void;
  totalFare: number;
  selectedSeatsCount: number;
  route: string;
  seatNumbers: string[];
  travelDate: string;
}

export function EmailConfirmationStep({
  onConfirm,
  onBack,
  totalFare,
  selectedSeatsCount,
  route,
  seatNumbers,
  travelDate,
}: EmailConfirmationStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const payload = {
      route,
      seats: seatNumbers,
      travelDate,
      amount: totalFare,
      email: email.trim(),
    };

    try {
      const response = await fetch(BOOKING_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed with status ${response.status}`);
      }

      await response.json().catch(() => ({}));
      onConfirm(email);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Booking could not be completed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 text-center space-y-2 pb-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Confirm Your Email</h3>
        <p className="text-sm text-muted-foreground">
          We'll send your booking confirmation and e-ticket to this email
        </p>
      </div>

      {/* Order Summary */}
      <div className="flex-shrink-0 bg-muted/50 rounded-lg p-4 space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Selected Seats</span>
          <span className="font-medium">{selectedSeatsCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-lg font-bold text-primary">
            ₹{totalFare.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Email Input */}
      <div className="flex-shrink-0 space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          className={error ? "border-destructive" : ""}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-3 mt-auto pt-6">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Confirming…
            </>
          ) : (
            <>
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
