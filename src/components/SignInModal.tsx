import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { sendOTP, verifyOTP } from "@/lib/otp-api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional: reason to show (e.g. "Sign in to complete your booking") */
  reason?: string;
  /** Optional: callback when user successfully signs in */
  onSuccess?: () => void;
}

export function SignInModal({ open, onOpenChange, reason, onSuccess }: SignInModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await sendOTP(email);
      setOtpSent(true);
      setOtp("");
      toast.success("OTP sent to your email");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    console.log("[SignIn] handleVerifyOTP clicked");
    if (!otp || otp.length < 6) {
      console.log("[SignIn] Invalid OTP length:", otp.length);
      setError("Please enter the 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);
    console.log("[SignIn] Calling verifyOTP with email:", email);
    try {
      const result = await verifyOTP(email, otp);
      console.log("[SignIn] verifyOTP result:", result);
      if (result.success) {
        login(email);
        toast.success("Signed in successfully");
        onOpenChange(false);
        resetState();
        onSuccess?.();
      } else {
        const msg = result.error || "Invalid OTP";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
  };

  const resetState = () => {
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setLoading(false);
    setError("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetState();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md focus:outline-none">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl font-semibold">
            Sign in to complete your booking
          </DialogTitle>
          {reason && (
            <p className="text-sm text-muted-foreground mt-1">{reason}</p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Email input - always visible */}
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="signin-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className={cn(
                  "pl-9 h-11 transition-colors",
                  error && "border-destructive focus-visible:ring-destructive",
                  otpSent && "bg-muted cursor-not-allowed"
                )}
                disabled={otpSent || loading}
                autoComplete="email"
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
              />
            </div>
            {error && !otpSent && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Step 2: OTP input - only after OTP is sent */}
          {otpSent && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Label htmlFor="signin-otp">Enter 6-digit OTP</Label>
              <p className="text-sm text-muted-foreground">
                We sent a code to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <Input
                id="signin-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                  if (error) setError("");
                }}
                className={cn(
                  "h-12 text-center text-lg font-mono tracking-[0.5em] transition-colors",
                  error && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={loading}
                aria-invalid={!!error}
                aria-describedby={error ? "otp-error" : undefined}
              />
              {error && (
                <p id="otp-error" className="text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {otpSent ? (
              <>
                <Button
                  variant="outline"
                  className="gap-2 shrink-0"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </>
            ) : (
              <Button
                className="w-full gap-2"
                onClick={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending OTP…
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
