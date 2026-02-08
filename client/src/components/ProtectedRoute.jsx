import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:5000/api";

function ProtectedRoute({ children, allowedRoles }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('authToken');
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                // Verify against backend
                await axios.get(`${API_URL}/auth/verify`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setIsAuthenticated(true);
                setUserRole(storedUser.role);
            } catch (err) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 border-4 border-spy-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="font-mono-tech text-spy-green text-lg tracking-widest">VERIFYING ACCESS...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role Check
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center p-8 border-2 border-spy-red hud-corners">
                    <h1 className="text-3xl font-orbitron text-spy-red font-bold mb-4">ACCESS DENIED</h1>
                    <p className="font-mono-tech text-white mb-6">
                        CLEARANCE LEVEL INSUFFICIENT<br />
                        REQUIRED: {allowedRoles.join(' / ').toUpperCase()}<br />
                        DETECTED: {userRole?.toUpperCase()}
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('authToken');
                            window.location.href = '/login';
                        }}
                        className="px-6 py-2 bg-spy-red text-white font-orbitron font-bold hover:bg-transparent border-2 border-spy-red transition-all"
                    >
                        RETURN TO LOGIN
                    </button>
                </div>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
