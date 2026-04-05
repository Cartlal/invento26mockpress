# INVENTO 2026 - MOCK PRESS PROTOCOL (Into the Spyverse) 🕵️‍♂️🎥

**Codename**: Project Spyglass 2.0  
**Status**: ![Production Ready](https://img.shields.io/badge/Status-Deployed-success) ![Redis](https://img.shields.io/badge/Caching-Full-blue) ![Aesthetics](https://img.shields.io/badge/Aesthetics-Premium-red)

A premium, high-stakes real-time voting and cinematic display system engineered for the **Invento 2026 Mock Press** event. This system handles live audience evaluation and ultra-responsive projector displays with a heavy "Cyber-Spy" aesthetic.

---

## 🌟 Key Features

### 🗳️ Secure Voting Interface
*   **Agent Identity Protocol**: Voters authenticate via **Codename** and **Phone Number**.
*   **Anti-Fraud Tracking**: Triple-layer verification (IP, Device Hash, and Identify) to ensure 100% fair play.
*   **Live Average Score**: Real-time score aggregation shown on the main display upon result reveal.

### 🖥️ Display Control Center (The HUD)
*   **Director Mode**: Central hub for toggling Voting, Results, or Standby modes.
*   **Live Preview**: Real-time "Monitor" view of exactly what the audience is seeing.
*   **Hard Reset Protocol**: One-click emergency flush button to clear memory/cache if the system hangs.

### ⚡ Performance Architecture
*   **Redis Caching**: Extreme performance with data caching for participants, leaderboard, and event state.
*   **Real-time Sockets**: Zero-latency synchronization between the controller, voters, and the projector.
*   **Preloaded Assets**: All character photos are pre-cached and bundled for zero-lag reveal.

---

## 🛠️ Tech Stack

*   **Frontend**: React + Vite, Tailwind CSS (Vanilla Logic), Lucide Icons.
*   **Backend**: Node.js + Express.
*   **Database**: MongoDB Atlas (Cloud Database).
*   **Caching/Memory**: Redis Labs (Ultra-fast data layer).
*   **Protocol**: Socket.io (Bi-directional real-time communication).

---

## 🚀 Setup & Installation

### 1. Environment Config
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
REDIS_URL=your_redis_labs_uri
JWT_SECRET=protocol_spy_secret
MASTER_KEY=your_onboarding_key
NODE_ENV=production
```

### 2. Local Development
```bash
# Install everything
npm install

# Run Backend & Frontend concurrently
npm run dev
```

### 3. Production Deployment (Render)
This repository is optimized for **Render.com**.
*   **Automated Connect**: Render will detect `render.yaml` and configure everything.
*   **Build Command**: `npm install && npm run build` (Root)
*   **Start Command**: `npm start` (Root)
*   **Static Assets**: Character images must be placed in `server/images_char/`.

---

## 📂 Project Intelligence (Directory Map)

```bash
invento26mockpress/
├── archive/           # Deprecated/Temporary scripts
├── client/            # React Frontend (Vite)
├── docs/              # System Architecture & Implementation Plans
├── server/            # Node.js API & Socket Server
│   ├── images_char/   # Character & Gallery Image Assets (Bundled)
│   ├── config/        # Database & Redis connectors
│   ├── routes/        # Mission logic (Admin, Vote, Auth)
│   ├── uploads/       # Dynamic participant photo directory
│   └── index.js       # Core Surveillance Hub
├── render.yaml        # Automated Deployment Blueprint
└── package.json       # Master Scripts
```

---

## 🕵️‍♂️ Staff Protocol (Access)

1.  **Projector Display**: Access via `/display` (Auto-refresh & Fullscreen ready).
2.  **Mission Control**: Access via `/control` (Requires Superintendent/Admin credentials).
3.  **Onboarding**: New staff can be added via the hidden `/protocol-alpha` endpoint using the `MASTER_KEY`.

---

**AUTHORIZED PERSONNEL ONLY • UNIVERSITY CLEARANCE REQUIRED**  
*Invento 2026 • KLE Technological University • Into the Spyverse*
