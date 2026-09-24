<p align="center">
  <img src="./frontend/public/logo.png" width="380" alt="IceUsers Platform Architecture" />
</p>

<h1 align="center">IceUsers — Enterprise Multi-Tenant Credential Provisioning & Financial Ledger System</h1>

<p align="center">
  <strong>A full-stack, multi-tenant administrative portal engineered to automate credential management, wallet ledger transactions, and external platform provisioning with isolated sub-admin tenancy and a 13-point granular permission engine.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-13.4-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Cloudinary-Asset_Pipeline-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

---

> [!NOTE]
> **Engineering Portfolio Disclosure:**
> This repository contains a production-grade full-stack platform architected and developed by me as a **commissioned client engagement**. This document outlines the project strictly from an **engineering, systems architecture, and technical implementation perspective** to showcase full-stack problem-solving, multi-tenant state isolation, security workflows, and responsive UI engineering.

---

## 📌 Executive Summary & System Scope

The client required a unified, high-availability web platform capable of automating credential lifecycle operations (ID requests, password updates, account closures) and financial transactions (deposits and withdrawals) across 16+ third-party exchange platforms. 

The primary architectural challenges solved during development include:
1. **Multi-Tenant Sub-Admin Scoping:** Allowing independent master agents ("Sub-Admins") to operate within fully isolated tenant silos—managing their own user rosters, exchange catalogs, banking gateways, and support routes without cross-tenant data leakage.
2. **13-Point Granular Permission Matrix:** An administrative authorization system giving the Superadmin fine-grained control over Sub-Admin capabilities (user creation, balance adjustments, credential edits, transaction audits, and catalog management).
3. **Two-Way Financial Ledger & Verification Pipeline:** Automated coin-to-currency conversions (`1 INR = X Coins`), receipt upload handling via Cloudinary/Multer, and dual-state approval workflows.
4. **Adaptive Dual-View UI Architecture:** Designing complex administrative tables that automatically transform into high-density touch-optimized cards on mobile devices ($\le 880\text{px}$ down to 320px) with zero layout overflow.

---

## 🎨 User Interface & Design System

The application features a modern dark-glassmorphic aesthetic engineered with a custom tokenized palette (`#090d16` canvas, `#130e24` card surface, and vibrant `#DB2777` magenta neon accents), backdrop blur filters, and micro-interactions.

### Desktop & Dashboard Preview

![IceUsers UI Architecture](./readme_homepage.png)

### Integrated Partner Exchange Matrix

The platform integrates dynamic rate calculation and credential provisioning across 16+ external platforms:

| | | | |
|:---:|:---:|:---:|:---:|
| <img src="./frontend/src/assets/websites/Radheexch.jpg" width="150" alt="Radhe Exchange" /><br/>`Radhe Exchange` | <img src="./frontend/src/assets/websites/Kingexch9.jpg" width="150" alt="King Exchange" /><br/>`King Exchange` | <img src="./frontend/src/assets/websites/Diamondexch99.jpg" width="150" alt="Diamond Exchange" /><br/>`Diamond Exchange` | <img src="./frontend/src/assets/websites/Goexch9.jpg" width="150" alt="Go Exchange`" /><br/>`Go Exchange` |
| <img src="./frontend/src/assets/websites/world777.jpg" width="150" alt="World777" /><br/>`World777` | <img src="./frontend/src/assets/websites/taj777.jpg" width="150" alt="Taj777" /><br/>`Taj777` | <img src="./frontend/src/assets/websites/mylaser247.jpg" width="150" alt="Laser247" /><br/>`Laser247` | <img src="./frontend/src/assets/websites/baazi888.jpg" width="150" alt="Baazi888" /><br/>`Baazi888` |
| <img src="./frontend/src/assets/websites/the100exch.jpg" width="150" alt="The100 Exchange" /><br/>`The100 Exchange` | <img src="./frontend/src/assets/websites/allpanelexch.jpg" width="150" alt="All Panel Exch" /><br/>`All Panel Exch` | <img src="./frontend/src/assets/websites/Bikajiexch.jpg" width="150" alt="Bikaji Exchange" /><br/>`Bikaji Exchange` | <img src="./frontend/src/assets/websites/betonly777.jpg" width="150" alt="BetOnly777" /><br/>`BetOnly777` |
| <img src="./frontend/src/assets/websites/jsk1.jpg" width="150" alt="JSK1" /><br/>`JSK1` | <img src="./frontend/src/assets/websites/ps777.jpg" width="150" alt="PS777" /><br/>`PS777` | <img src="./frontend/src/assets/websites/t10exchange.jpg" width="150" alt="T10 Exchange" /><br/>`T10 Exchange` | <img src="./frontend/src/assets/websites/Allowexch999.jpg" width="150" alt="Allow Exchange" /><br/>`Allow Exchange` |

---

## 🛠️ Complete Technical Stack

### Client-Side (Frontend SPA)
| Technology | Role / Purpose |
| :--- | :--- |
| **React 18.3** | Component-driven UI runtime utilizing concurrent rendering and transition flags |
| **Vite 6.0** | Ultra-fast ESM module bundler with optimized Hot Module Replacement (HMR) |
| **React Router v6** | Declarative client-side routing with role-gated `ProtectedRoute` guards and future v7 transitions |
| **TailwindCSS 3.4** | Utility-first responsive design framework configured with custom glassmorphism utilities |
| **CSS Modules** | Scoped, non-colliding style encapsulation for complex components (`HomeHeading`, `Navbar`, `Modals`) |
| **Framer Motion 13.4** | Physics-based spring animations for drawer transitions, modals, and list entry states |
| **Material UI (MUI)** | High-fidelity SVG icon library (`@mui/icons-material`), typography, and chip components |
| **PrimeReact & Flowbite** | Data table widgets, toast notifications, status badges, and interactive popovers |
| **React-Slick & Slick-Carousel** | Smooth multi-breakpoint banner carousels for promotional and announcement graphics |
| **React Portals** | Modal and drawer rendering directly into the document root to bypass z-index clipping contexts |

### Server-Side (Backend REST API)
| Technology | Role / Purpose |
| :--- | :--- |
| **Node.js** | Non-blocking, asynchronous event-driven server runtime |
| **Express 4.21** | Enterprise RESTful API routing, error middleware, and static asset delivery |
| **MongoDB & Mongoose 8.18** | Schema validation, compound indexing, population, and multi-tenant document queries |
| **Bcrypt.js** | Cryptographic password hashing (salt rounds = 10) for tamper-proof credential storage |
| **Multer & Cloudinary** | Multipart form handling and automated cloud image optimization for transaction receipts |
| **CORS Dynamic Origin Handler** | Dynamic regex origin validation supporting multi-domain production, staging, and localhost clients |
| **UUID (v11)** | Unique, collision-resistant transaction reference key generator |

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend Client (React 18 + Vite)"]
        UI[Glassmorphic UI / Dashboard]
        AuthCtx[UserContext & Role Guard]
        BalCtx[BalanceProvider State Engine]
        Portals[React Portals / Modals]
    end

    subgraph APILayer["⚙️ Backend REST API (Node.js + Express)"]
        Router[Express Router]
        AuthMW[RBAC & Origin Validation Middleware]
        TenantScoper[SubAdmin Tenant Scoping Engine]
        
        subgraph Controllers["Modular Controllers"]
            AdminCtrl[adminController.js]
            UserCtrl[userController.js]
            SupportCtrl[supportController.js]
            ImgCtrl[imageController.js]
        end
    end

    subgraph StorageLayer["🗄️ Persistence & Storage Layer"]
        MongoDB[(MongoDB Atlas / Document Store)]
        Cloudinary[(Cloudinary CDN / Proof Receipts)]
    end

    UI -->|Authenticated API Requests| Router
    Router --> AuthMW
    AuthMW --> TenantScoper
    TenantScoper --> Controllers
    Controllers -->|Mongoose Queries| MongoDB
    ImgCtrl -->|Multipart Upload Stream| Cloudinary
    BalCtx <-->|Live Polling & Event Reconciliation| UserCtrl
```

---

## 🛡️ Multi-Tenant Architecture & RBAC

The system implements a tiered role hierarchy designed to strictly isolate operations between distinct admin tenants:

```mermaid
graph TD
    Super[👑 Superadmin] -->|Provisions & Audits| SubAdmin[🛡️ Admin Master / Sub-Admin]
    Super -->|Configures 13-Point Permissions| SubAdmin
    Super -->|Global View| GlobalData[All Users, Transactions & Catalogs]
    
    SubAdmin -->|Tenant Silo A| UserA1[User A1]
    SubAdmin -->|Tenant Silo A| UserA2[User A2]
    SubAdmin -->|Manages Isolated| GatewayA[Dedicated Banking Gateways]
    SubAdmin -->|Manages Isolated| CatalogA[Custom Exchange Catalog & Coin Rates]
    
    SubAdminB[🛡️ Admin Master B] -->|Tenant Silo B| UserB1[User B1]
    SubAdminB -->|Manages Isolated| GatewayB[Bank Gateways B]
    
    UserA1 -.x|Strictly Blocked Access| SubAdminB
```

### The 13-Point Granular Permission Matrix

Sub-Admins are provisioned with schema-enforced boolean permissions stored on the `Admin` document:

```javascript
// models/Admin.js
permissions: {
    canCreateUsers:        { type: Boolean, default: true  }, // Provision new user credentials
    canUpdateUserBalance:  { type: Boolean, default: true  }, // Direct wallet credit/debit adjustments
    canChangeUserPassword: { type: Boolean, default: true  }, // Reset assigned user credentials
    canDeleteUsers:        { type: Boolean, default: false }, // Destructive removal of user accounts
    canAddWebsites:        { type: Boolean, default: true  }, // Register new exchange targets
    canEditWebsites:       { type: Boolean, default: true  }, // Alter coin exchange rates & min coins
    canDeleteWebsites:     { type: Boolean, default: false }, // Remove websites from catalog
    canManageCategories:   { type: Boolean, default: true  }, // Categorize platform offerings
    canManageIdRequests:   { type: Boolean, default: true  }, // Accept/reject user ID provisioning
    canManageTransactions: { type: Boolean, default: true  }, // Approve/reject deposit & withdrawal proofs
    canEditIdCredentials:  { type: Boolean, default: true  }, // Update target website login/passwords
    canManageBanners:      { type: Boolean, default: false }, // Superadmin-restricted landing banners
    canManageSupportLinks: { type: Boolean, default: false }, // Edit WhatsApp, Telegram, Social channels
}
```

Every administrative mutation route checks both the requesting admin's role and the specific capability flag via the tenant resolver before allowing database mutations.

---

## 🔄 Core Workflows & State Machines

### 1. ID Provisioning & Credential Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Client
    participant Server as Express API
    participant DB as MongoDB
    actor Admin as Assigned Sub-Admin

    User->>Frontend: Selects Exchange & specifies coin quantity
    Frontend->>Frontend: Validates minCoins & calculates INR cost
    Frontend->>Server: POST /api/user/request-id (Wallet deduction)
    Server->>DB: Atomically deduct coins & create IdRequest (Pending)
    Server-->>Frontend: 201 Created (Request queued)
    
    Admin->>Frontend: Inspects ID Requests (Filtered by Tenant ID)
    Admin->>Server: PATCH /api/admin/id-requests/:id/accept (Supplies username & password)
    Server->>DB: Updates status='Accepted', records processedBy & credentials
    
    User->>Frontend: Opens "My IDs" Portal
    Frontend->>Server: GET /api/user/my-ids
    Server-->>Frontend: Returns decrypted URL, username & credentials
    Frontend->>User: Displays interactive credential card with copy-to-clipboard
```

### 2. Proof-of-Payment Verification Pipeline

```mermaid
stateDiagram-v2
    [*] --> DepositInitiated: User selects Admin Bank/UPI Account
    DepositInitiated --> ReceiptUploaded: User attaches payment screenshot
    ReceiptUploaded --> CloudinaryStored: Multer streams to Cloudinary CDN
    CloudinaryStored --> PendingVerification: Transaction logged with unique TXN ID
    
    state AdminModeration {
        PendingVerification --> Accepted: Admin verifies funds in banking app
        PendingVerification --> Rejected: Invalid transaction ID or falsified receipt
    }
    
    Accepted --> BalanceCredited: Atomic increment on User.balance
    Rejected --> LedgerLogged: Reason recorded; balance untouched
    BalanceCredited --> [*]
    LedgerLogged --> [*]
```

---

## 💡 Key Engineering Challenges & Technical Solutions

### 1. Dual-View Mobile Responsiveness ($\le 880\text{px}$)
* **Challenge:** Administrative panels demand data-dense tabular information (7+ columns including Transaction IDs, status badges, timestamps, receipt preview triggers, and action buttons). On screens below 880px down to 320px, horizontal scrolling degrades operator efficiency.
* **Solution:** Engineered a dual-render layout paradigm using CSS media queries and conditional markup:
  - **Desktop ($> 880\text{px}$):** Renders high-density data tables with fixed column ratios.
  - **Mobile ($\le 880\text{px}$):** Automatically swaps into stacked glassmorphic cards with copyable IDs, compact status chips, and accordion action panels.
  - **Layout Overflow Fix:** Eliminated horizontal page jitter by replacing root `100vw` rules with strict `100%` bounds and zero-margin wrappers.

### 2. React Portal Modals & Stacking Context Isolation
* **Challenge:** Heavy CSS transforms, sticky navigation headers, and backdrop filters created stacking context issues where modals and dropdowns were clipped or rendered behind sibling cards.
* **Solution:** Migrated all popups (`ChangePasswordModal`, `WebsiteDepositPopup`, `WalletWithdrawalPopup`) and dynamic drawers to React Portals (`ReactDOM.createPortal`), mounting them directly into dedicated DOM root containers (`#modal-root`). This guarantees flawless z-index layering regardless of DOM nesting depth.

### 3. Real-Time Balance Synchronization
* **Challenge:** Balance discrepancies between cached client states and backend ledger operations when users trigger multiple transactions or when admins adjust balances concurrently.
* **Solution:** Created a unified `BalanceProvider` React Context utilizing an event-driven polling and optimistic update model. Balance modifications trigger immediate UI reconciliation and background re-fetching to maintain absolute data integrity without requiring full-page reloads.

### 4. Dynamic Multi-Origin CORS Enforcement
* **Challenge:** The application is deployed across multiple staging, production, and custom domain names (`iceusers.info`, `the247panel.shop`, Vercel previews, local development ports).
* **Solution:** Implemented a dynamic origin validator using normalized string pattern matching and regex verification in `server.js`, securely authorizing legitimate cross-domain requests while rejecting unauthorized origins with explicit policy errors.

---

## 📁 Repository Directory Structure

```text
iceUsers/
├── backend/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection handler
│   │   └── seedSuperAdmin.js         # Idempotent superadmin seeding script
│   ├── controller/
│   │   ├── adminController.js        # Multi-tenant admin business logic & audits (100KB+)
│   │   ├── authController.js         # Authentication, hashing, and token dispatch
│   │   ├── imageController.js        # Multer / Cloudinary asset upload processor
│   │   ├── subAdminHelper.js         # Tenant scoping & admin identifier resolvers
│   │   ├── supportController.js      # Dynamic multi-channel social links manager
│   │   └── userController.js         # User wallet, ID requests, and balance engine (35KB+)
│   ├── models/                       # 15 Mongoose schemas
│   │   ├── Admin.js                  # Superadmin & SubAdmin with 13-point permissions
│   │   ├── AdminAccount.js           # Multi-tenant banking & UPI configurations
│   │   ├── IdRequest.js              # ID creation lifecycle records
│   │   ├── Transaction.js            # Financial ledger entries (deposit/withdrawal)
│   │   ├── User.js                   # User accounts scoped to assignedAdmin
│   │   ├── WebsiteId.js              # Target exchange credentials
│   │   └── SupportLink.js            # Social links mapped per admin tenant
│   ├── routes/                       # Express route definitions
│   │   ├── adminRoutes.js            # Gated administrative endpoints
│   │   ├── authRoutes.js             # Public authentication routes
│   │   ├── imageRoutes.js            # Asset upload routes
│   │   ├── supportRoutes.js          # Support links API
│   │   └── userRoutes.js             # End-user profile and transaction routes
│   ├── server.js                     # Server entrypoint & dynamic CORS configuration
│   └── package.json
│
├── frontend/
│   ├── public/                       # Static public assets, icons, and logos
│   ├── src/
│   │   ├── assets/                   # SVG vectors, certifications, and exchange logos
│   │   │   └── websites/             # 16+ partner platform graphical assets
│   │   ├── components/
│   │   │   ├── admin/                # Administrative dashboard modules
│   │   │   │   ├── AdminAccountsDetails/ # Sub-admin banking manager
│   │   │   │   ├── AllIds/           # Global credential inspection table
│   │   │   │   ├── IdRequests/       # Responsive ID approval queue (Desktop/Mobile)
│   │   │   │   ├── SubAdmins/        # Superadmin sub-admin provisioner & permission toggles
│   │   │   │   ├── Users/            # Multi-tenant user audit & balance adjustment
│   │   │   │   └── Websites/         # Exchange catalog & coin rate configuration
│   │   │   ├── BalanceProvider/      # Global balance synchronization provider
│   │   │   ├── FloatingSocialWidget/ # Dynamic role-routed social support widget
│   │   │   ├── Home/                 # Landing dashboard, carousels, and headings
│   │   │   ├── Id/                   # User ID management & modal dialogs
│   │   │   ├── Login/ & Signup/      # Auth forms with inline validation
│   │   │   ├── Navbar/ & Sidebar/    # Responsive navigation with persistent collapse state
│   │   │   └── Transactions/         # Financial transaction history with proof view
│   │   ├── context/
│   │   │   └── UserContext.jsx       # Global session & authentication state
│   │   ├── utils/
│   │   │   ├── roles.js              # Role constants (`SUPERADMIN`, `ADMIN`, `USER`)
│   │   │   └── routes.js             # Centralized route dictionary
│   │   ├── App.jsx                   # Master routing table & layout assembly
│   │   ├── index.css                 # Design tokens, Tailwind directives, & glassmorphism
│   │   └── main.jsx                  # React DOM client entrypoint
│   ├── tailwind.config.cjs           # Custom color palette and media query definitions
│   └── package.json
│
├── readme_homepage.png               # High-resolution dashboard UI preview
└── README.md                         # Technical engineering documentation
```

---

## 🚀 Local Development & Setup Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm** or **yarn**
* **MongoDB**: A running local instance or MongoDB Atlas URI
* **Cloudinary Account**: (Optional, for production image hosting)

---

### 1. Backend Service Configuration

1. Clone the repository and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` configuration file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/iceusers
   JWT_SECRET=your_secure_development_jwt_secret_key
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   
   # Optional Cloudinary Storage Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the backend in development mode with auto-reload:
   ```bash
   npm run dev
   ```
   *The server will initialize on `http://localhost:5000`. On first run, the database auto-seeder provisions the default Superadmin credentials.*

---

### 2. Frontend Client Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Launch your browser at `http://localhost:5173`.

---

## 📈 Recent Technical Updates & Engineering Changelog

* **Multi-Tenant Sub-Admin Architecture (`00d94b4`):**
  - Built dedicated `adminController.js` logic and route handlers to isolate sub-admin user pools and exchange catalogs.
  - Implemented the 13-point permission matrix with frontend switch toggles for dynamic capability control.
* **Layout Width & Viewport Overflow Fix (`74cdd4e`):**
  - Solved horizontal viewport jitter on mobile and desktop by replacing root `100vw` rules with `100%` and encapsulating drawer components.
  - Migrated sidebar navigation into a persistent collapse state backed by `localStorage` and portal rendering.
* **CORS Dynamic Origin Expansion (`7c86eb4`):**
  - Extended backend CORS configuration with regex pattern verification to support multiple staging, preview, and production domains seamlessly.
* **Dual-View ID Request & Transaction Redesign (`b683e2f`, `a889eb8`):**
  - Refactored administrative table views into auto-collapsing cards on viewports $\le 880\text{px}$ to guarantee touch optimization and zero horizontal clipping.
* **Coin Rate & Financial Math Refactor (`b53320b`, `6a5b776`):**
  - Enhanced currency-to-coin calculation logic with dynamic minimum requirements and validation safeguards against negative or zero values.
* **Scoped CSS Modules Migration (`6217c5c`):**
  - Adopted CSS Modules for `HomeHeading` and `TopNavbar` components to isolate complex glassmorphic keyframes and prevent style bleeding.

---

## 👨‍💻 Developer Summary

* **Role:** Full-Stack Software Engineer
* **Scope of Work:** End-to-end architecture, database schema design, REST API implementation, multi-tenant RBAC engine, frontend UI/UX engineering, and responsive optimization.
* **Key Focus Areas:** Scalable system design, component reusability, secure authentication patterns, and responsive performance.

---

<p align="center">
  <sub>Developed as a high-performance, client-commissioned web application. All technical designs and implementations presented here are for technical portfolio and engineering demonstration purposes.</sub>
</p>
