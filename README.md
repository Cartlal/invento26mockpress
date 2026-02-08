# Invento 2026 - Mock Press Voting System 🎥

A professional, real-time voting and display system engineered for the **Invento 2026 Mock Press** event. This system handles live audience voting, dynamic projector displays, and comprehensive administrative control with a robust role-based security model.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Realtime](https://img.shields.io/badge/Realtime-Socket.io-orange)

## 🌟 Key Features

### 🗳️ Voting Interface
- **Simple UI**: Clean, responsive mobile-first design for judges/audience.
- **Score Locking**: Prevents accidental double-voting or changing scores after submission.
- **Real-time Feedback**: Instant confirmation of cast votes.

### 🎮 Admin & Control
- **Mission Control**: A cyberpunk-themed dashboard for system administrators.
- **Live Analytics**: Real-time bar charts showing vote distribution (1-10).
- **Audit Logs**: Full tracking of every admin action (who did what, when).
- **Emergency Protocols**:
  - **Panic Button**: Instantly ceases all voting operations.
  - **Force Reset**: Pushes the display to a generic "Waiting" screen.

### � Display System
- **Projector Mode**: A dedicated, clean view for the main stage screen.
- **Dynamic State**: Automatically switches between "Waiting", "Active Participant", and "Results".
- **Animations**: smooth transitions powered by Framer Motion.

### 🏆 Leaderboard
- **Live Rankings**: Automatic sorting based on average score.
- **Top 3 Highlight**: Special visual distinction for the podium finishers.

---

## � Security & Roles

The system implements a strict Role-Based Access Control (RBAC) system:

| Role | Access Level | Description |
|---|---|---|
| **SUPER ADMIN** | `Full Access` | Can manage users, edit participants, view logs, and control the event. |
| **CONTROLLER** | `Event Access` | Can navigate participants (Next/Prev) and toggle voting. Cannot delete data. |
| **DISPLAY** | `Read Only` | Restricted account for the projector PC. Can only view the Display page. |
| **VOTER** | `Public` | Can only access the voting page and leaderboard. |

---

## �️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Cartlal/invento_26_mockpress.git
cd invento_26_mockpress
```

### 2. Backend Setup
Navigate to the server folder and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/invento_mock_press
JWT_SECRET=your_secure_jwt_secret
MASTER_KEY=invento2026_super_secret_key  # For hidden onboarding
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the client folder and install dependencies:
```bash
cd client
npm install
```

Start the frontend:
```bash
npm run dev
```

The app will launch at `http://localhost:5173`.

---

## 🕵️‍♂️ Hidden Onboarding (Protocol Alpha)

To create new staff accounts without accessing the database:
1. Go to `http://localhost:5173/protocol-alpha`
2. Enter the **Master Key** (defined in `.env`).
3. Create your Admin, Controller, or Display users.

---

## � Project Structure

```
invento_26_mockpress/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Charts, Buttons)
│   │   ├── pages/          # Routes (Admin, Voting, Display)
│   │   └── context/        # Socket & Auth Context
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose Schemas (Vote, Admin, AuditLog)
│   ├── routes/             # API Endpoints (Auth, Admin, Vote)
│   └── scripts/            # Database Seeding Scripts
└── README.md               # Documentation
```

## 📜 API Reference

### Auth
- `POST /api/auth/login` - Staff login
- `POST /api/auth/onboard-user` - Create new staff (Master Key required)

### Admin
- `GET /api/admin/participants` - List all participants
- `POST /api/admin/state` - Update event state (Open/Close voting)
- `GET /api/admin/analytics/distribution` - Vote stats
- `GET /api/admin/logs` - System audit logs

### Voting
- `POST /api/vote` - Cast a vote
- `GET /api/vote/leaderboard` - Get rankings

---

**Built with ❤️ for INVENTO 2026**
