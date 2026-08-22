# 🌍 GlobeTrotter - Personalized Travel Planning Platform
> **Odoo Hackathon Project** | Built with React, Vite, Node.js, Express, SQLite, Chart.js & Leaflet

GlobeTrotter is an intelligent, user-centric, and interactive travel planning platform that simplifies multi-city trip creation, provides automatic budget calculations with rich charts, features an interactive route map, community sharing, and administrator analytics.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Install & Run in 2 Commands

```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm install
npm run seed     # Populates rich demo destinations, activities & trips
npm start

# Terminal 2: Frontend Client (Port 3000)
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

*(Note: The backend also serves the built frontend production bundle directly on [http://localhost:5000](http://localhost:5000))*

---

## 🔑 Demo Accounts (1-Click Login Available in UI)

| Account | Email | Password | Role | Features |
|---|---|---|---|---|
| **Traveler Demo** | `alex@globetrotter.io` | `password123` | `user` | Preloaded trips (Europe, Japan, India), Wishlist & Itinerary builder |
| **Admin Demo** | `admin@globetrotter.io` | `admin123` | `admin` | Full Platform Analytics, User Directory & Trip Moderation |

---

## 📋 Comprehensive Feature Implementation Mapping (13 / 13 Completed)

| # | Hackathon Requirement | Status | Implementation Details |
|---|---|---|---|
| **1** | **Login / Signup Screen** | ✅ Done | Email/password auth, JWT tokens, 1-click Instant Demo logins (Traveler & Admin), and Forgot Password modal. |
| **2** | **Dashboard / Home Screen** | ✅ Done | Central hub with welcome banner, user lifetime travel stats, upcoming trip countdowns, popular destinations with weather/cost indicators, community feeds, and "+ Plan Trip" CTA. |
| **3** | **Create Trip Screen** | ✅ Done | Form with duration calculator, Unsplash travel cover picker, travel style tags (Solo, Couple, Family, Luxury, Backpacker), budget targets, and confetti celebration. |
| **4** | **My Trips Screen** | ✅ Done | Grid and List view switcher, status filtering (Upcoming, Ongoing, Completed), search & sorting, duplicate/clone trip, and delete confirmation modal. |
| **5** | **Itinerary Builder Screen** | ✅ Done | Multi-city destination stops management, Up/Down reordering, curated city activity catalog with 1-click assignment, custom activity scheduler, and live budget updates. |
| **6** | **Itinerary View Screen** | ✅ Done | Structured presentation with 4 toggleable modes: **Day-by-Day Timeline**, **City Groups**, **Interactive Route Map**, and **Print / PDF View**. |
| **7** | **City Search & Discovery** | ✅ Done | Search 50+ world destinations with continent filters, cost indices (`$` to `$$$$`), average daily cost, attraction preview modal, and "+ Add to Existing Trip". |
| **8** | **Activity Search & Catalog** | ✅ Done | Filter by category (Sightseeing, Food, Culture, Adventure, Transit), max cost slider, duration, and direct "Add to Stop" scheduling. |
| **9** | **Trip Budget & Cost Breakdown** | ✅ Done | Financial dashboard with **Chart.js Doughnut** (Lodging, Activities, Transport, Food, Other) & **Daily Spending Bar Chart**, budget gauge, overbudget alerts, and custom expense logging. |
| **10** | **Trip Calendar / Timeline** | ✅ Done | Chronological calendar strip, daily schedule cards, time slots, and transit route progression. |
| **11** | **Shared / Public Itinerary View** | ✅ Done | Public link (`#share-:shareCode`), read-only view with interactive Leaflet map route, day-by-day plan, social sharing (WhatsApp, Twitter/X, QR Code), and **"Clone Trip to My Account"** button. |
| **12** | **User Profile / Settings** | ✅ Done | Editable profile (name, avatar presets, bio), currency preferences (USD, EUR, GBP, INR, JPY), saved wishlist destinations, and **JSON Data Export**. |
| **13** | **Admin / Analytics Dashboard** | ✅ Done | Platform-wide KPIs (total travelers, trips, stops, volume), destination ranking bar chart, continent doughnut chart, user directory table, and trip moderation tools. |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Chart.js & React-Chartjs-2, Leaflet & React-Leaflet, Canvas-Confetti, Tailwind CSS Design System
- **Backend**: Node.js, Express, Better-SQLite3, JSON Web Tokens (JWT), Bcryptjs, Morgan, CORS
- **Database**: Relational SQLite database with foreign keys, cascaded deletes, indexes, and full relational integrity (`users`, `trips`, `stops`, `activities`, `expenses`, `cities`, `activity_catalog`, `saved_destinations`, `trip_clones`).

---

## 🗄️ Relational Database Architecture

```
users (1) ───────────< trips (N) ───────────< stops (N) ───────────< activities (N)
  │                     │                         │
  │                     └──────────< expenses (N) ┘
  │
  └──────────< saved_destinations (N) >────────── cities (1) ───────< activity_catalog (N)
```

---

## 👨‍💻 Author
- **Vatsal Pithadia** - Built for the **Odoo Hackathon**
