# Product Requirement Document (PRD)

**Project Name:** Mini Bullion Trade & Client CRM Module

## 1. Project Overview & Objective
The Mini Bullion Trade & Client CRM Module is a lightweight, secure web application designed to simulate a physical bullion trading desk (modeled on Aurify Technologies' domain). It integrates Customer Relationship Management (CRM), Know Your Customer (KYC) workflows, trade recording, and live management analytics.

The primary objective is to deliver a fully functional, role-segregated (RBAC) platform that handles secure client management, real-time trade valuation, and customized dashboard summaries.

## 2. Architecture & Tech Stack

**Backend**
*   **Runtime:** Node.js (v18+ recommended)
*   **Framework:** Express.js
*   **Database:** MongoDB (via Mongoose ODM)
*   **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing

**Frontend**
*   **Framework:** React.js (Vite configuration is recommended for fast builds)
*   **State Management:** React Context API or Local State (`useState`, `useEffect`)
*   **Styling:** Tailwind CSS (preferred for rapid, clean badge UI rendering)
*   **HTTP Client:** Axios or native Fetch API

## 3. System Architecture & Role-Based Access Control (RBAC)
The application enforces a strict two-tier permission system executed via server-side middleware:

| Role | Client Visibility | Trade Visibility | Allowed Operations |
| :--- | :--- | :--- | :--- |
| **Admin** | Global (All Clients) | Global (All Trades) | View Dashboard, View All Clients/Trades, Delete Clients |
| **Trader** | Scoped (Assigned Only) | Scoped (Assigned Only) | View Dashboard, Create/Update own Clients, Record Trades |

## 4. Backend Specifications (API & Database)

### 4.1 Database Models (Mongoose Schemas)

**User Schema (User)**
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Trader'], required: true },
  createdAt: { type: Date, default: Date.now }
}
```

**Client Schema (Client)**
```javascript
{
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  kycStatus: { type: String, enum: ['Verified', 'Pending', 'Rejected'], default: 'Pending' },
  metalPreference: { type: String, enum: ['Gold', 'Silver', 'Platinum'], required: true },
  assignedTrader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}
```

**Trade Schema (Trade)**
```javascript
{
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  tradeType: { type: String, enum: ['Buy', 'Sell'], required: true },
  metal: { type: String, enum: ['Gold', 'Silver', 'Platinum'], required: true },
  weightInGrams: { type: Number, required: true },
  pricePerGram: { type: Number, required: true },
  totalValue: { type: Number, required: true }, // Auto-calculated (weight * price)
  trader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### 4.2 API Endpoint Specs

**Authentication**
*   `POST /api/auth/register` — Creates user account (Hash password using bcrypt, returns confirmation).
*   `POST /api/auth/login` — Verifies credentials. Returns JWT token signed with userId and role.

**Client Management (Protected by JWT Auth Middleware)**
*   `POST /api/clients` — Creates client. Automatically assigns `req.user.id` as Trader.
*   `GET /api/clients` — Lists clients.
    *   *Admin Context:* Returns all records.
    *   *Trader Context:* Filters where `assignedTrader == req.user.id`.
*   `GET /api/clients/:id` — Fetches individual profile.
*   `PUT /api/clients/:id` — Edits profile fields.
*   `DELETE /api/clients/:id` — Deletes client record. (Enforce Admin role middleware here).

**Trade Desk (Protected by JWT Auth Middleware)**
*   `POST /api/trades` — Saves trade record. Pre-calculates `totalValue = weightInGrams * pricePerGram`.
*   `GET /api/trades` — Lists trades.
    *   *Admin:* All trades.
    *   *Trader:* Only trades where `trader == req.user.id`.
*   `GET /api/trades/:id` — Specific trade entry view.

**Analytics Dashboard**
*   `GET /api/dashboard/summary` — Compiles core metrics.
    *   *Logic Rule:* Dates must filter starting from 00:00:00 of the current server day.
    *   *Payload Output:*
        ```json
        {
          "todayTradeCount": 12,
          "todayTotalValue": 45000.50,
          "topClientName": "Al-Rayan Jewellery",
          "totalClients": 140
        }
        ```
    *   *Note:* If user is a Trader, calculations must only include trades/clients belonging to that specific Trader.

## 5. Frontend Specifications (React UI)

### 5.1 Login Interface (`/login`)
*   **Components:** Email (Input), Password (Input), Submit (Button).
*   **Validation:** Prevent submit if fields are empty. Format-check email strings.
*   **State Hook:** On success, store the JWT token string in `localStorage.setItem('token', token)` or an App-wide Auth Context. Instantly route users to the Dashboard.

### 5.2 Interactive Client List (`/clients`)
*   **Structure:** Tabular view mapping out all accessible client entities.
*   **KYC UI Badge Design Pattern:**
    *   Verified: Green Badge (`bg-green-100 text-green-800`)
    *   Pending: Yellow/Amber Badge (`bg-yellow-100 text-yellow-800`)
    *   Rejected: Red Badge (`bg-red-100 text-red-800`)
*   **Search Feature:** Client-side live filter matching input values against `fullName` or `phone` strings dynamically.
*   **Actionable Elements:** An "Add Client" button directing to a profile configuration workspace/modal.

### 5.3 Bullion Trade Ticket (`/trades/new`)
*   **Fields:**
    *   Client Selection (Populated via `GET /api/clients` response).
    *   Trade Type (`Buy` / `Sell` HTML Select dropdown).
    *   Metal Selection (`Gold`, `Silver`, `Platinum` HTML Select dropdown).
    *   Weight input field & Price per gram input field.
*   **Dynamic UX Component:** Total value indicator. It must listen to changes on weight/price state variables and compute dynamically:
    **Total Value = Weight in Grams × Price per Gram**
    This component field must contain the HTML attribute `readOnly` to block manual overriding.

### 5.4 Analytics Dashboard (`/`)
Four primary metric layout containers:
1.  **Today's Volume:** Count of trades processed today.
2.  **Today's Revenue/Value:** Absolute trade monetary valuation sum for today.
3.  **VIP Client:** Top Client Name by accumulation.
4.  **Portfolio Size:** Total Clients count.
*   **UX Edge-case Handling:** Maintain an explicit loading state logic switch (`true`/`false`). Show a spinner/skeleton placeholder loader until data arrives from the API endpoint.

## 6. Project Checklist for Submission
To ensure the machine task gets an excellent review, make sure the final codebase has:
- [ ] **Clean Folder Structure:** Separated backend (controllers, models, routes, middleware) and frontend (components, pages, context).
- [ ] **Secure Middleware:** JWT authorization works correctly, and Traders cannot access Admin routes or other traders' data.
- [ ] **No Hardcoded Values:** All database connection strings and JWT secrets are kept in a `.env` file.
- [ ] **Data Validation:** Form inputs are validated on both the client side (React) and server side (Mongoose/Express).
- [ ] **Comprehensive README.md:** Clear setup steps explaining how to run both backend and frontend applications.
