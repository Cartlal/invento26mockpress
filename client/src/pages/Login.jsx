import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const API_URL = "http://localhost:5000/api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                username,
                password
            });

            // Store token
            localStorage.setItem('authToken', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success("ACCESS GRANTED", {
                style: {
                    background: '#00ff41',
                    color: '#000',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                }
            });

            // Redirect based on role
            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/display-control');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "ACCESS DENIED", {
                style: {
                    background: '#ff0000',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black spy-grid-bg scanlines flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/assets/dev-bg.jpg')" }}></div>

            {/* Login Card */}
            <div className="w-full max-w-md z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <img src="/assets/Invento-logo.png" alt="INVENTO" className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="font-orbitron text-3xl font-black text-white mb-2 tracking-wider">
                        SECURE ACCESS
                    </h1>
                    <p className="font-mono-tech text-xs text-spy-green tracking-widest">
                        INVENTO 2026 • ADMIN PORTAL
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-dark-panel border-2 border-spy-green hud-corners p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Lock className="w-6 h-6 text-spy-green pulse-glow" />
                        <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">
                            AUTHENTICATION REQUIRED
                        </h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                USERNAME
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black border-2 border-spy-green/30 focus:border-spy-green pl-12 pr-4 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                                    placeholder="Enter username"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-mono-tech text-xs text-spy-green tracking-widest mb-2">
                                PASSWORD
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black border-2 border-spy-green/30 focus:border-spy-green pl-12 pr-12 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                                    placeholder="Enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-spy-green transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 font-orbitron font-bold text-sm tracking-widest border-2 transition-all ${loading
                                    ? 'bg-gray-700 border-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-spy-green text-black border-spy-green hover:bg-transparent hover:text-spy-green'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                    AUTHENTICATING...
                                </div>
                            ) : (
                                'ACCESS SYSTEM'
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 pt-6 border-t border-spy-green/20">
                        <p className="font-mono-tech text-xs text-gray-600 text-center">
                            AUTHORIZED PERSONNEL ONLY
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <img src="/assets/KLE-TECH.webp" alt="KLE Tech" className="w-32 mx-auto mb-2 opacity-50" />
                    <p className="font-mono-tech text-xs text-gray-700">
                        KLE TECHNOLOGICAL UNIVERSITY
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
