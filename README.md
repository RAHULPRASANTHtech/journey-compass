🚌 Bus On Go

Bus On Go is a full-stack bus booking web application with OTP-based authentication, booking management, and email confirmations powered by n8n workflows.

The project focuses on clean frontend–backend integration, real-world API contracts, and production-style automation.

✨ Features
🔐 Authentication

Email-based OTP login

OTP expiry (5 minutes)

Secure verification using n8n

Clear status handling:

SUCCESS

EXPIRED

FAILED

NO_OTP

🚌 Bus Booking

Search and book buses

Seat selection

Booking confirmation

Booking history per user

❌ Booking Cancellation

Cancel confirmed bookings

Automatic cancellation confirmation email

Refund amount shown in email

Safe cancellation flow

📧 Email Automation (n8n)

OTP email

Booking confirmation email

Cancellation confirmation email

All emails handled via n8n webhooks

🏗️ Tech Stack
Frontend

React + TypeScript

React Router

Tailwind CSS

Shadcn UI

Lucide Icons

Backend / Automation

n8n (Cloud / Self-hosted)

Webhook-based APIs

Data Tables for persistent storage

Gmail integration

Utilities

date-fns (date formatting)

sonner (toast notifications)

🔄 Architecture Overview
Frontend (React)
   |
   |  POST JSON (fetch)
   v
n8n Webhooks
   |
   |-- OTP workflow
   |-- Booking confirmation workflow
   |-- Cancel booking workflow
   |
   v
Gmail (Email Notifications)

🔐 OTP Authentication Flow

User enters email

Frontend calls OTP Send Webhook

n8n:

Generates OTP

Stores OTP in Data Table

Sends OTP via Gmail

User enters OTP

Frontend calls OTP Verify Webhook

n8n:

Checks OTP

Validates expiry

Responds with status

OTP Status Codes
SUCCESS | EXPIRED | FAILED | NO_OTP

📦 Booking Confirmation Flow

User completes booking

Booking is saved in database

Frontend sends booking details to Booking Webhook

n8n sends booking confirmation email

Booking Payload (Example)
{
  "bookingId": "bkg-123",
  "userEmail": "user@example.com",
  "from": "Chennai",
  "to": "Bangalore",
  "date": "2026-02-10",
  "time": "22:30",
  "seat": "A1, A2",
  "totalAmount": 450
}

❌ Cancel Booking Flow

User clicks Cancel Booking

Booking is marked cancelled in database

Frontend sends cancellation data to Cancel Webhook

n8n sends cancellation confirmation email

Refund amount is included in email

Cancel Payload (Example)
{
  "bookingId": "bkg-123",
  "userEmail": "user@example.com",
  "from": "Chennai",
  "to": "Bangalore",
  "date": "2026-02-10",
  "seat": "A1, A2",
  "totalAmount": 450
}

📁 Project Structure (Simplified)
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── SignInModal.tsx
├── pages/
│   ├── MyBookings.tsx
│   └── Home.tsx
├── lib/
│   ├── booking-api.ts
│   ├── database.ts
│   └── webhooks.ts
├── contexts/
│   └── AuthContext.tsx
└── App.tsx

⚙️ Environment Variables