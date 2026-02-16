import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Voting from "./pages/Voting";
import Admin from "./pages/Admin";
import Display from "./pages/Display";
import Logs from "./pages/Logs";
import DisplayControl from "./pages/DisplayControl";

import Login from "./pages/Login";
import SecretOnboarding from "./pages/SecretOnboarding";
import ProtectedRoute from "./components/ProtectedRoute";
import QRCodePage from "./pages/QRCodePage";
import AddParticipant from "./pages/AddParticipant";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans antialiased">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Voting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/protocol-alpha" element={<SecretOnboarding />} />
          <Route path="/logs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Logs />
            </ProtectedRoute>
          } />
          <Route
            path="/display"
            element={
              <ProtectedRoute allowedRoles={['admin', 'controller', 'display']}>
                <Display />
              </ProtectedRoute>
            }
          />

          <Route path="/qr-code" element={<QRCodePage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/display-control"
            element={
              <ProtectedRoute allowedRoles={['admin', 'controller']}>
                <DisplayControl />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-participant"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
                <AddParticipant />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
