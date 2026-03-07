# INVENTO 2026 - MOCK PRESS PROTOCOL (Into the Spyverse)
## Comprehensive Project Documentation

### 1. Introduction & Overview
Project INVENTO MOCKPRESS VOTING SYSTEM  is a comprehensive, high-stakes real-time voting and cinematic display system engineered for the **Invento 2026 Mock Press** event. This robust system handles live audience evaluation and ultra-responsive projector displays with a curated "Cyber-Spy" aesthetic.

It is split into two primary environments:
- **Client**: A React (Vite) frontend application serving the Voters, the Administrator Controllers, and the Live Projector Display.
- **Server**: A Node.js backend using Express, MongoDB Atlas, and Socket.io to manage event state, voting records, authentication, and ultra-fast real-time synchronization between clients.

---

### 2. Technical Stack
**Frontend Layer**:
- **Framework**: React.js bundled via Vite.
- **Styling**: Tailwind CSS configured for a bespoke dark-mode "spy" theme (Vanilla logic/classes).
- **Icons**: Lucide React.
- **Real-time Comms**: `socket.io-client` for seamless state transitions across devices.

**Backend Layer**:
- **Runtime**: Node.js with Express.js.
- **Database**: MongoDB Atlas via Mongoose ODM.
- **Caching & Sockets**: Socket.io handles bidirectional event pushing (voting counts, display mode swaps).
- **Hosting**: Pre-configured for Render.com (`render.yaml`).

---

### 3. Application Architecture & Data Models
The application relies strictly on MongoDB collections to manage its state and history.

#### 3.1 MongoDB Models (`server/models/`)
*   **`Participant.js`**: Contains information about the contestant/character being evaluated (Name, Code, Image).
*   **`Vote.js`**: Tracks individual votes. Records the Voter ID (phone number/codename), the target Participant ID, and the assigned Score (1-10) to prevent duplicate voting.
*   **`Admin.js`**: Defines the credentials and roles for staff/mission controllers.
*   **`EventState.js`**: The central state machine. Stores whether voting is currently open, which participant is currently on stage (`currentParticipantId`), and what the projector display mode is (e.g., 'standby', 'voting', 'result').
*   **`AuditLog.js`**: Keeps a chronological record of critical system events such as mode switches, participant additions, and application errors.

---

### 4. Backend Ecosystem (`server/`)

#### 4.1 Entry Point (`index.js`)
Configures the Express server, connects to MongoDB, and initializes Socket.io. It handles static file serving (`/uploads`, `/images_char`) and delegates REST APIs to specialized routers.

#### 4.2 Routes (`server/routes/`)
*   **`/api/auth`** (`auth.js`): Handles voter login/agent authentication and Admin/Director login, distributing JWTs for session security.
*   **`/api/admin`** (`admin.js`): Secures mission control. Features endpoints for updating the `EventState` (which in turn triggers `io.emit` to update all clients), adding new participants, retrieving system logs, and gathering analytical voting data for charts.
*   **`/api/vote`** (`vote.js`): Manages the voting logic. Checks if the event state allows voting, verifies voter eligibility (preventing double votes), and logs the vote, subsequently pushing a real-time `voteCount` socket push to the Admin dashboard.

#### 4.3 Sockets (Real-Time Comm)
Socket events are primarily driven from backend routes. For example, when an admin changes the event state via a REST call to `/api/admin/state`, the server emits a `stateUpdate` event to the `display` and `voter` rooms instantly.

---

### 5. Frontend Ecosystem (`client/src/`)

#### 5.1 Main Interfaces (`client/src/pages/`)
*   **`Voting.jsx` & `Login.jsx` (User-Facing)**
    *   Voters log in using a designated Codename and Phone Number.
    *   The Voting page connects to sockets. If `isVotingOpen` is false, it shows a standby/closed screen. When active, it displays a 1-10 rating scale for the active participant.
*   **`Display.jsx` (Projector HUD)**
    *   Lives on a massive screen. It passively listens to Socket events. It switches views between Standby (logo focus), Active Voting (showing the participant name), and Results Reveal (displaying aggregated average score via a dramatic cinematic reveal).
*   **`Admin.jsx` & `DisplayControl.jsx` (Command Center)**
    *   Restricted route requiring a JWT. 
    *   Admins can view incoming vote curves/distributions, switch who is currently on stage, and toggle the `EventState` between forms.
    *   Includes a hard reset and quick action buttons.
*   **Other Tools**:
    *   `AddParticipant.jsx`: Form to create new contestant profiles and upload photos.
    *   `Logs.jsx`: A UI to read from the `AuditLog` collection.
    *   `SecretOnboarding.jsx`: A hidden route protected by `MASTER_KEY` to register new Admin users.
    *   `QRCodePage.jsx`: For easy distribution of the Voting link via QR code.

---

### 6. Security Protocols
*   **JWT Authentication**: Ensures administrative routes and actions are sealed from standard voters.
*   **Duplicate Prevention**: Voters are identified by device hashes and phone numbers mapped deeply in the database against specific participants.
*   **Socket Room Isolation**: Admin stats are only emitted to the `admin` socket room. General broadcast is restricted to simple state refreshes to prevent data sniffing.

### 7. Deployment Instructions
The project contains a `render.yaml` for zero-configuration, infrastructure-as-code deployment on Render.com.
`package.json` at the root will trigger a concurrent install and build process for both the client and server. Static character assets must be retained in `server/images_char` to ensure rapid, unblocked asset delivery to the main projector.
