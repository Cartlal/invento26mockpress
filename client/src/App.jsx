import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Voting from "./pages/Voting";
import Admin from "./pages/Admin";
import Display from "./pages/Display";
import DisplayControl from "./pages/DisplayControl";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import SecretOnboarding from "./pages/SecretOnboarding";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans antialiased">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Voting />} />
          <Route path="/login" element={<Login />} />
          <Route path="/protocol-alpha" element={<SecretOnboarding />} />
          <Route
            path="/display"
            element={
              <ProtectedRoute allowedRoles={['admin', 'controller', 'display']}>
                <Display />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
