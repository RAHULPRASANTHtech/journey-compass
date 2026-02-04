/**
 * OTP API - Webhook calls for send/verify OTP
 * URLs are loaded from env to avoid hardcoding in UI
 */

import { OTP_WEBHOOK_URL } from "./webhooks";

export async function sendOTP(email: string): Promise<void> {
  try {
    const res = await fetch(OTP_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Failed to send OTP (${res.status})`);
    }

    // Optionally inspect response body for more details, but treat send as best-effort
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Network error, try again");
  }
}

export type VerifyOTPResult = { success: true } | { success: false; error: string };

export async function verifyOTP(email: string, otp: string): Promise<VerifyOTPResult> {
  try {
    console.log("[OTP Verify] Starting verification for:", email);
    console.log("[OTP Verify] Webhook URL:", OTP_WEBHOOK_URL);
    
    const payload = { action: "verify", email: email.trim().toLowerCase(), otp: otp.trim() };
    console.log("[OTP Verify] Sending payload:", payload);
    
    const res = await fetch(OTP_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("[OTP Verify] Response status:", res.status);
    const data = (await res.json().catch(() => ({}))) as { status?: string; error?: string };
    console.log("[OTP Verify] Response data:", data);

    if (!res.ok) {
      const err = data?.error || `Verification failed (${res.status})`;
      return { success: false, error: err };
    }

    // Only treat as success when backend explicitly returns status === "SUCCESS"
    if (data && data.status === "SUCCESS") {
      return { success: true };
    }

    // Map some common backend messages to user-friendly errors
    const lowerErr = (data?.error || "").toLowerCase();
    if (lowerErr.includes("expire")) {
      return { success: false, error: "OTP expired, please resend" };
    }

    return { success: false, error: data?.error || "Invalid OTP" };
  } catch (e) {
    if (e instanceof Error) return { success: false, error: e.message };
    return { success: false, error: "Network error, try again" };
  }
}
