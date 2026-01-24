import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodStepProps {
  onConfirm: (method: string) => void;
  onBack: () => void;
  totalFare: number;
  email: string;
}

const upiApps = [
  { id: "gpay", name: "Google Pay", color: "from-blue-500 to-green-500", letter: "G" },
  { id: "phonepe", name: "PhonePe", color: "from-purple-600 to-purple-400", letter: "P" },
  { id: "paytm", name: "Paytm", color: "from-blue-600 to-blue-400", letter: "₱" },
];

export function PaymentMethodStep({
  onConfirm,
  onBack,
  totalFare,
  email,
}: PaymentMethodStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [selectedUpi, setSelectedUpi] = useState<string>("");

  const handleProceed = () => {
    if (paymentMethod === "upi" && selectedUpi) {
      onConfirm(`UPI - ${selectedUpi}`);
    } else if (paymentMethod) {
      onConfirm(paymentMethod);
    }
  };

  const isValid = paymentMethod === "upi" ? !!selectedUpi : !!paymentMethod;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 text-center space-y-2 pb-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Select Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to pay for your booking
        </p>
      </div>

      {/* Order Summary */}
      <div className="flex-shrink-0 bg-muted/50 rounded-lg p-4 space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Confirmation Email</span>
          <span className="font-medium truncate max-w-[200px]">{email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount to Pay</span>
          <span className="text-xl font-bold text-primary">
            ₹{totalFare.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => {
          setPaymentMethod(value);
          if (value !== "upi") setSelectedUpi("");
        }}
        className="space-y-3 flex-shrink-0"
      >
        {/* Credit Card */}
        <Label
          htmlFor="credit"
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
            paymentMethod === "credit"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <RadioGroupItem value="credit" id="credit" />
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Credit Card</p>
            <p className="text-xs text-muted-foreground">Visa, Mastercard, Rupay</p>
          </div>
        </Label>

        {/* Debit Card */}
        <Label
          htmlFor="debit"
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
            paymentMethod === "debit"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <RadioGroupItem value="debit" id="debit" />
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Debit Card</p>
            <p className="text-xs text-muted-foreground">All major banks supported</p>
          </div>
        </Label>

        {/* UPI */}
        <div
          className={cn(
            "rounded-lg border-2 transition-all",
            paymentMethod === "upi"
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <Label
            htmlFor="upi"
            className="flex items-center gap-4 p-4 cursor-pointer"
          >
            <RadioGroupItem value="upi" id="upi" />
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium">UPI</p>
              <p className="text-xs text-muted-foreground">Pay using any UPI app</p>
            </div>
          </Label>

          {/* UPI Apps Grid */}
          {paymentMethod === "upi" && (
            <div className="px-4 pb-4 pt-2">
              <div className="grid grid-cols-3 gap-3">
                {upiApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedUpi(app.name)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      selectedUpi === app.name
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-background"
                    )}
                  >
                    {selectedUpi === app.name && (
                      <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-primary fill-background" />
                    )}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg",
                        app.color
                      )}
                    >
                      {app.letter}
                    </div>
                    <span className="text-xs font-medium">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </RadioGroup>

      {/* Security Badge */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
        <Shield className="w-4 h-4" />
        <span>100% Secure Payment with SSL Encryption</span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-3 mt-4 pt-4 border-t border-border">
        <Button variant="outline" className="gap-2" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!isValid}
          onClick={handleProceed}
        >
          Pay ₹{totalFare.toLocaleString()}
        </Button>
      </div>
    </div>
  );
}
