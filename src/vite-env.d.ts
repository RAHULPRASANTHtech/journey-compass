/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OTP_SEND_URL?: string;
  readonly VITE_OTP_VERIFY_URL?: string;
  readonly VITE_BOOKING_WEBHOOK_URL?: string;
  readonly VITE_CANCEL_BOOKING_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
