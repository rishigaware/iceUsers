<p align="center">
  <img src="./frontend/public/logo.png" width="380" alt="IceUsers Logo" />
</p>

# 🪩 IceUsers - Premium Self-Admin Panel Provision Platform 🚀

🌐 **Official Link:** [https://the247panel.shop/](https://the247panel.shop/) & [https://icepanels.info/](https://icepanels.info/)

Welcome to **Ice Users** (The247Panel), India's premier, fully automated, self-admin & master panel creation platform! Built on a modern full-stack architecture with a stunning dark-glassmorphic aesthetic, Ice Users allows users to easily manage, create, and top-up administrative credentials for premium exchange platforms securely—without any fraud, risk, or middleman interference.

---

## 🎨 Home Page UI Mockup

Below is a visual representation of the highly polished, magenta-accented, dark-glassmorphic user interface of the IceUsers landing page and dashboard. 

![IceUsers UI Mockup](./readme_homepage.png)

*Design language features deep navy-indigo canvas ambient gradients (`#090d16` to `#130e24`), flashy magenta neon accents (`#DB2777`), glassmorphic panels, and animated feedback.*

---

## 🌐 Supported Exchange Websites & Platforms

IceUsers provides automated, instant panel provisioning, rate conversion, and balance top-ups across 16+ top-tier exchange platforms:

| | | | |
|:---:|:---:|:---:|:---:|
| <img src="./frontend/src/assets/websites/Radheexch.jpg" width="160" alt="Radhe Exchange" /><br/>**Radhe Exchange** | <img src="./frontend/src/assets/websites/Kingexch9.jpg" width="160" alt="King Exchange" /><br/>**King Exchange** | <img src="./frontend/src/assets/websites/Diamondexch99.jpg" width="160" alt="Diamond Exchange" /><br/>**Diamond Exchange** | <img src="./frontend/src/assets/websites/Goexch9.jpg" width="160" alt="Go Exchange" /><br/>**Go Exchange** |
| <img src="./frontend/src/assets/websites/world777.jpg" width="160" alt="World777" /><br/>**World777** | <img src="./frontend/src/assets/websites/taj777.jpg" width="160" alt="Taj777" /><br/>**Taj777** | <img src="./frontend/src/assets/websites/mylaser247.jpg" width="160" alt="Laser247" /><br/>**Laser247** | <img src="./frontend/src/assets/websites/baazi888.jpg" width="160" alt="Baazi888" /><br/>**Baazi888** |
| <img src="./frontend/src/assets/websites/the100exch.jpg" width="160" alt="The100 Exchange" /><br/>**The100 Exchange** | <img src="./frontend/src/assets/websites/allpanelexch.jpg" width="160" alt="All Panel Exch" /><br/>**All Panel Exch** | <img src="./frontend/src/assets/websites/Bikajiexch.jpg" width="160" alt="Bikaji Exchange" /><br/>**Bikaji Exchange** | <img src="./frontend/src/assets/websites/betonly777.jpg" width="160" alt="BetOnly777" /><br/>**BetOnly777** |
| <img src="./frontend/src/assets/websites/jsk1.jpg" width="160" alt="JSK1" /><br/>**JSK1** | <img src="./frontend/src/assets/websites/ps777.jpg" width="160" alt="PS777" /><br/>**PS777** | <img src="./frontend/src/assets/websites/t10exchange.jpg" width="160" alt="T10 Exchange" /><br/>**T10 Exchange** | <img src="./frontend/src/assets/websites/Allowexch999.jpg" width="160" alt="Allow Exchange" /><br/>**Allow Exchange** |

---

## ⚡ Core Philosophy & Identity

- **Zero Intermediaries**: Eliminates risky middlemen. Users interact directly with automated systems to create their self-admin panels.
- **24/7 Availability**: Automated instant panel refills, secure deposits, and swift withdrawals available round-the-clock.
- **Next-Gen Aesthetics**: Clean glassmorphism overlays, fluid slide-in and hover transitions, responsive card designs, and vibrant status badges powered by a flashy Magenta (`#DB2777`) theme.
- **Multi-Tenant Isolation**: Complete isolation between Admin Masters (sub-admins) with private user assignments, custom exchange catalogs, and isolated banking gateways.

---

## 🛠️ Technology Stack

IceUsers utilizes a powerful and scalable full-stack ecosystem:

### 💻 Client Side (Frontend)
- **Framework**: `React 18` + `Vite` (for ultra-fast Hot Module Replacement)
- **Styling**: `TailwindCSS` + `Vanilla CSS Modules` (highly custom components with performance in mind)
- **UI Components**: `Flowbite React` (responsive widgets), `PrimeReact` (advanced UI inputs & toast notifications), `Material UI (MUI)` (sleek SVG icons, chips, and typography elements)
- **Slide Carousels**: `react-slick` + `slick-carousel` (for horizontal and square banner announcements)
- **State Management**: React Context (`UserProvider` & `BalanceProvider`) for global authentication, balance updates, and API synchronizations
- **Services**: Firebase Web SDK (Auth helper integration)

### ⚙️ Server Side (Backend)
- **Runtime**: `Node.js` + `Express`
- **Database**: `MongoDB` via `Mongoose ODM`
- **Authentication**: JWT & Local authentication strategies with password hashing (`bcryptjs`)
- **Middlewares**: custom CORS policy configurations, Express file uploads (`multer`), static file routing, and role-based request verification.

---

## ✨ Features Breakdown

### 👤 User Panel Features
- **💳 Interactive Glass Wallet**: Live-updating wallet balances with beautiful green-glowing balance badges.
- **📥 Instant Deposit/Withdrawal Request**: Interactive modals to place transactions, upload receipt screenshots, and verify payments to their designated Admin Master's accounts.
- **🚀 One-Click Self-Admin Creation**: Customized panels configuration where users specify coin amounts, custom transaction rates, and website of choice.
- **📱 Live ID Manager**: Interactive portal displaying website credentials (URL, username, passwords) once approved by the admin.
- **🔄 Account Actions**: Requests to close existing accounts or request quick password changes for security.
- **💬 Role-Based Dynamic Support**: Auth-gated floating widget automatically routing users to their assigned Admin Master's official WhatsApp, Telegram, Instagram, and Facebook support channels.

### 👑 Admin & Multi-Tenant Panel Features
- **👑 Superadmin Oversight**:
  - Global oversight across all users, transactions, ID requests, and exchange websites.
  - Provisions and manages isolated **Admin Masters** (`/admin/subadmins`) with a granular 13-point permission matrix.
  - Multi-tenant filtering to inspect or audit any Admin Master's users, transactions, and requests.
  - Configures global platform support links and manages any Admin Master's support links on the fly.
  - Auto-seeded on startup (`superadmin` / `Super@1234`).
- **🛡️ Admin Master (Sub-Admin) Management**:
  - **Isolated Tenancy**: Admin Masters only see and manage users directly assigned to them; public registration is restricted.
  - **Custom Exchange Catalogs**: Each Admin Master registers and prices their own list of exchange websites (`WebsiteId`), setting custom coin rates and minimum coin requirements.
  - **Dedicated Banking Gateways**: Each Admin Master manages their own bank accounts and UPI IDs (`AdminAccount`) for user deposits.
  - **13-Point Granular Permissions**: Features are permission-gated (user creation, balance updates, password resets, deletions, catalog control, transaction moderation, and support link editing).
  - **Modern Collapsible UI**: Default-collapsed accordion cards with user count and permission badges, styled to match the Users Management theme.
- **📝 ID Request Pipeline**:
  - Dual responsive view: 7-column table on desktop ($> 880\text{px}$) and ultra-compact cards on mobile ($\le 880\text{px}$) with zero horizontal overflow down to 320px.
  - Automated coin conversion (1 INR = X coins), admin notes, and one-click accept/reject controls.
- **💼 Transaction Moderation**: View submitted screenshots of bank transfers to quickly approve/reject wallet deposits and process payouts.
- **🖼️ Banner & Carousel Manager**: Upload and sequence horizontal and square banner slide graphics directly to the landing page.
- **👥 User Accounts Audits**: Access, inspect, and modify active user databases, balances, and registered exchange websites.

---

## 🔍 How It Works - The Step-by-Step Flow

The system operates in a highly-structured 7-step automated loop:

```mermaid
graph TD
    A[1. Search & Visit IcePanels.info] --> B[2. Register with Gmail & Phone]
    B --> C[3. Click Create Self-Admin Panel]
    C --> D[4. Select Exchange & Coins]
    D --> E[5. Specify Rates & Quantities]
    E --> F[6. Transfer Funds via Wallet Payment]
    F --> G[7. Upload Receipt & Receive Login Details]
```

1. **Open Google & Visit**: Access the platform through the secure portal at `IcePanels.info` or `The247Panel.shop`.
2. **Register/Login**: Securely register or log in using your credentials.
3. **Select Panel**: Navigate to `Panels` -> `Create Panel`.
4. **Choose Platform**: Choose one of the 16+ premium exchanges supported (e.g. Radhe Exchange, King Exchange, Go Exchange, world777, Diamond Exchange).
5. **Set Configuration**: Fill in panel details, desired coins, and rates.
6. **Wallet Payment**: Complete checkout using your pre-funded wallet balance.
7. **Submit Receipt**: Upload payment confirmation. Once the admin verifies, the administrative credentials (URL, Username, Password) appear directly on your home dashboard page.

---

## 📂 Project Structure

```text
iceUsers/
├── backend/
│   ├── config/            # DB connection & Superadmin auto-seeder
│   ├── controller/        # API Controller logics (Auth, Users, SubAdmins, Support, ID Requests)
│   ├── models/            # Mongoose Schemas (Admin, User, SupportLinks, WebsiteId, Transaction, IdRequest)
│   ├── routes/            # Express API Routes (User, Admin, Auth, Support, Images)
│   ├── uploads/           # User upload directories for transaction screenshots & banners
│   ├── server.js          # Node.js Server entrypoint
│   └── package.json
└── frontend/
    ├── public/            # Static assets
    ├── src/
    │   ├── assets/        # Core image assets, certifications, and logo badges
    │   │   └── websites/  # Supported exchange website graphics & logos
    │   ├── components/    # Reusable components (SubAdmins, Users, IdRequests, FloatingSocialWidget, Navbars)
    │   ├── context/       # UserContext & BalanceProvider React State
    │   ├── firebase/      # Client-side Firebase configs
    │   ├── hooks/         # Custom React hooks
    │   ├── utils/         # Utility functions
    │   ├── App.jsx        # App component router definition
    │   ├── index.css      # Core Design System, Tailwinds, and custom animations
    │   └── main.jsx       # Client bundle mount point
    ├── tailwind.config.cjs
    └── package.json
```

---

## 🚀 Setup & Installation

Follow these instructions to run the entire system locally.

### 📥 Prerequisites
- **Node.js** (v18.x or higher recommended)
- **npm** or **yarn**
- **MongoDB Database** (Local instance or MongoDB Atlas Cloud Cluster)

---

### 1. Backend Setup ⚙️

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_token
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The server will boot up and listen on `http://localhost:5000`.*
   > 💡 **Default Superadmin:** On first boot, `seedSuperAdmin.js` automatically creates the Superadmin account if not present (`superadmin` / `Super@1234`).

---

### 2. Frontend Setup 💻

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install client-side dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder (if needed to configure custom Firebase variables or API endpoints).
4. Run the local development server:
   ```bash
   npm run dev
   ```
   *Vite will compile and host the page. Click the terminal link (usually `http://localhost:5173`) to launch it in your browser.*

---

## 🏅 Certifications & Responsible Gaming

IceUsers is committed to providing a secure and authenticated environment for its partners and users. The platform integrates certified standards for security and player protection:

<p align="center">
  <img src="./frontend/src/assets/certification_rng_verified.png" width="90" alt="RNG Verified" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./frontend/src/assets/certification_ssl_secure.png" width="90" alt="SSL Secure" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./frontend/src/assets/responsible_gaming_play_safe.png" width="90" alt="Play Safe" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./frontend/src/assets/responsible_gaming_18_plus.png" width="90" alt="18+ Responsible Gaming" />
</p>

- **RNG Verified Engine**: Certified Random Number Generation for fair operations.
- **SSL Secure Protocols**: Industry-standard encryption for client-server communication.
- **Responsible Gaming Framework**: Enforces safe parameters, age verification checks (+18 restriction), and support hotlines.

---

*Designed and engineered with passion, premium style, and technical excellence.* 🌟
