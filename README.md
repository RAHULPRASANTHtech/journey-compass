```md
# 🚌 Bus On Go

Bus On Go is a full-stack bus booking web application with OTP-based authentication,
booking management, and email automation using n8n.

---

## ✨ Features

### 🔐 Authentication

- Email-based OTP login
- OTP expiry (5 minutes)
- Secure verification using n8n

### 🚌 Booking

- Search and book buses
- Seat selection
- Booking confirmation email

### ❌ Cancellation

- Cancel bookings
- Cancellation confirmation email
- Refund amount shown

---

## 🏗️ Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Shadcn UI

### Backend / Automation
- n8n (Webhooks)
- Gmail integration

---

## 🚀 Run Locally

```bash
npm install
npm run dev
