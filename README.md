# Invento 2026 - Mock Press Voting System 🎥🕵️‍♂️

**Code Name**: *Project Spyglass*  
**Event**: Invento 2026 Mock Press  
**Status**: ![Production Ready](https://img.shields.io/badge/Status-Deployed-success) ![Security Level](https://img.shields.io/badge/Security-High-red)

A sophisticated, cyberpunk-themed real-time voting and display system engineered for the high-stakes **Invento 2026 Mock Press** event. This system transforms the venue into a digital surveillance hub, handling live audience voting, dynamic projector displays, and comprehensive administrative control with a robust role-based security model.

---

## 🌟 Key Features

### 🗳️ Secure Voting Interface
*   **Agent Identity Protocol**: Voters must authenticate with a **Codename** and **Phone Number** to access the voting terminal.
*   **One-Vote Policy**: Strict IP, Device, and Identity tracking ensures one vote per person per participant.
*   **Smart Bypass**: Automatically allows multiple votes from `localhost` for testing, while enforcing strict rules for external IPs.
*   **Real-time Feedback**: Instant visual confirmation with spy-themed animations upon successful vote transmission.
*   **Score Locking**: Prevents accidental double-voting or changing scores after submission.

### 🎮 Mission Control (Admin Dashboard)
*   **Live Monitor**: A real-time surveillance dashboard showing:
    *   **Active Uplinks**: Total connected users in real-time.
    *   **Live Feed**: Scrolling log of incoming votes with voter identity.
    *   **Voter Dossiers**: Click on any voter to view their entire voting history across all participants.
    *   **Queue Management**: See upcoming participants and current target status.
*   **Participant Management**: Add, edit, and reorder participants on the fly.
*   **Image Intelligence**: **Upload high-res photos (up to 10MB)** for each participant directly from the dashboard.
*   **Emergency Protocols**:
    *   **Panic Button**: Instantly freezes all voting operations.
    *   **Force Reset**: Pushes the display to a secure "Waiting" screen.
*   **Audit Logs**: detailed tracking of every admin action (who did what, when).

### 🖥️ Display Control Center
*   **Director Mode**: A dedicated interface for the stage manager/technician.
*   **Drag-and-Drop Queue**: Reorder participants instantly by dragging them in the list.
*   **Live Preview**: See exactly what is on the main projector screen before going live.
*   **Quick Actions**: Toggle voting, lock/unlock scores, and switch participants with a single click.
*   **Edit on the Fly**: Update participant names and photos directly from the control booth.

### 🎥 Main Display System
*   **Projector Mode**: A dedicated, clean view `(/display)` for the main stage screen.
*   **Dynamic State**: Automatically switches between:
    *   **Standby**: "Waiting for Target"
    *   **Active**: Participant Photo + Name + Live Voting Status
    *   **Results**: Final Score Reveal
*   **Cinematic Animations**: Smooth, high-tech transitions powered by Framer Motion.

### 🏆 Leaderboard
*   **Live Rankings**: Automatic sorting based on average score.
*   **Top 3 Highlight**: Special visual distinction for the podium finishers (Gold, Silver, Bronze).

---

## 🔐 Security & Roles

The system implements a strict Role-Based Access Control (RBAC) system:

| Role | Access Level | Description |
|---|---|---|
| **SUPER ADMIN** | `Full Access` | Can manage users, edit participants, view sensitive logs, and control the event. |
| **CONTROLLER** | `Event Access` | Can navigate participants (Next/Prev), upload photos, and toggle voting. Cannot delete critical data. |
| **DISPLAY** | `Read Only` | Restricted account for the projector PC. Can only view the Display page. |
| **VOTER** | `Public` | Can only access the voting page (`/`) and leaderboard (`/leaderboard`). |

---

## 🛠️ Tech Stack

*   **Frontend**: React, Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
*   **Backend**: Node.js, Express.
*   **Database**: MongoDB (Persists Votes, Participants, Logs).
*   **Real-time**: Socket.io (Instant updates for Votes, State, and User Counts).
*   **Security**: JWT Authentication, IP Tracking, Device Fingerprinting.

---

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Cartlal/invento_26_mockpress.git
cd invento_26_mockpress
```

### 2. Backend Setup
Navigate to the server folder:
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/invento26_voting
JWT_SECRET=your_secure_jwt_secret
MASTER_KEY=invento2026_super_secret_key  # For creating new admin accounts
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the client folder:
```bash
cd client
npm install
```

Start the client:
```bash
npm run dev
```

The app will launch at `http://localhost:5173`.

---

## 🕵️‍♂️ Hidden Onboarding (Protocol Alpha)

To create new staff accounts without accessing the database directly:
1.  Go to `http://localhost:5173/protocol-alpha`
2.  Enter the **Master Key** (defined in `.env`).
3.  Create your Admin, Controller, or Display users.

---

## 📂 Project Structure

```
invento_26_mockpress/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components (LiveMonitor, AnalyticsPanel)
│   │   ├── pages/          # Routes (Admin, Voting, Display, DisplayControl)
│   │   └── context/        # Socket & Auth Context
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose Schemas (Vote, Participant, EventState)
│   ├── routes/             # API Endpoints (Auth, Admin, Vote)
│   └── index.js            # Entry Point (Socket.io setup)
└── README.md               # Documentation
```

---

## 📜 API Reference

### Auth
*   `POST /api/auth/login` - Staff login
*   `POST /api/auth/onboard-user` - Create new staff (Master Key required)

### Admin
*   `GET /api/admin/participants` - List all participants
*   `POST /api/admin/participant` - Create participant (supports photo)
*   `PUT /api/admin/participant/:id` - Update participant
*   `POST /api/admin/state` - Update event state (Open/Close voting)
*   `GET /api/admin/stats` - Get live dashboard stats
*   `GET /api/admin/voters` - Get list of recent voters
*   `GET /api/admin/logs` - System audit logs

### Voting
*   `POST /api/vote` - Cast a vote (requires Name + Phone)
*   `GET /api/vote/leaderboard` - Get rankings

---

**Authorized Personnel Only • Invento 2026**
