import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserPlus, Shield, Lock, Key } from 'lucide-react';

import { apiUrl as API_URL } from "../config";

function SecretOnboarding() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("controller");
    const [masterKey, setMasterKey] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/onboard-user`, {
                username,
                password,
                role
            }, {
                headers: {
                    'x-master-key': masterKey
                }
            });

            toast.success(`User ${username} Created!`, {
                style: {
                    background: '#00ff41',
                    color: '#000',
                    fontFamily: 'monospace'
                }
            });

            // Clear sensitive fields
            setUsername("");
            setPassword("");
            setRole("controller");
        } catch (err) {
            toast.error(err.response?.data?.error || "CREATION FAILED", {
                style: {
                    background: '#ff0000',
                    color: '#fff',
                    fontFamily: 'monospace'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black spy-grid-bg flex items-center justify-center p-4">
            <div className="bg-dark-panel border-2 border-spy-blue hud-corners max-w-md w-full p-8 shadow-neon-blue">
                {/* Header */}
                <div className="text-center mb-8">
                    <Shield className="w-16 h-16 text-spy-blue mx-auto mb-4 animate-pulse" />
                    <h1 className="font-orbitron text-2xl font-black text-white tracking-widest uppercase">
                        Protocol: Onboard
                    </h1>
                    <p className="font-mono-tech text-xs text-spy-blue mt-2 tracking-widest">
                        AUTHORIZED PERSONNEL ONLY
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleCreate} className="space-y-6">
                    {/* Master Key */}
                    <div>
                        <label className="flex items-center gap-2 font-mono-tech text-xs text-spy-purple tracking-widest mb-2">
                            <Key size={14} /> MASTER AUTHORIZATION KEY
                        </label>
                        <input
                            type="password"
                            value={masterKey}
                            onChange={(e) => setMasterKey(e.target.value)}
                            className="w-full bg-black border-2 border-spy-purple/50 focus:border-spy-purple px-4 py-3 font-mono-tech text-white text-lg outline-none transition-all placeholder-gray-700"
                            placeholder="Enter Master Key"
                            required
                        />
                    </div>

                    <div className="border-t border-gray-800 my-4"></div>

                    {/* Username */}
                    <div>
                        <label className="flex items-center gap-2 font-mono-tech text-xs text-spy-blue tracking-widest mb-2">
                            <UserPlus size={14} /> NEW USERNAME
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black border-2 border-spy-blue/50 focus:border-spy-blue px-4 py-3 font-rajdhani text-white text-lg outline-none transition-all"
                            placeholder="e.g., judge01"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="flex items-center gap-2 font-mono-tech text-xs text-spy-blue tracking-widest mb-2">
                            <Lock size={14} /> ASSIGN PASSWORD
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border-2 border-spy-blue/50 focus:border-spy-blue px-4 py-3 font-mono-tech text-white text-lg outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block font-mono-tech text-xs text-spy-blue tracking-widest mb-2">
                            CLEARANCE LEVEL
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setRole('controller')}
                                className={`py-2 text-xs font-bold font-orbitron border transition-all ${role === 'controller'
                                    ? 'bg-spy-blue text-black border-spy-blue'
                                    : 'bg-transparent text-gray-500 border-gray-700 hover:border-spy-blue'
                                    }`}
                            >
                                CONTROLLER
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('display')}
                                className={`py-2 text-xs font-bold font-orbitron border transition-all ${role === 'display'
                                    ? 'bg-spy-yellow text-black border-spy-yellow'
                                    : 'bg-transparent text-gray-500 border-gray-700 hover:border-spy-yellow'
                                    }`}
                            >
                                DISPLAY
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('coordinator')}
                                className={`py-2 text-xs font-bold font-orbitron border transition-all ${role === 'coordinator'
                                    ? 'bg-spy-purple text-black border-spy-purple'
                                    : 'bg-transparent text-gray-500 border-gray-700 hover:border-spy-purple'
                                    }`}
                            >
                                COORDINATOR
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`py-2 text-xs font-bold font-orbitron border transition-all ${role === 'admin'
                                    ? 'bg-spy-red text-white border-spy-red'
                                    : 'bg-transparent text-gray-500 border-gray-700 hover:border-spy-red'
                                    }`}
                            >
                                ADMIN
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-6 font-orbitron font-bold text-lg tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${loading
                            ? 'bg-gray-800 border-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-spy-blue text-black border-spy-blue hover:bg-transparent hover:text-spy-blue shadow-neon-blue'
                            }`}
                    >
                        {loading ? 'INITIALIZING...' : 'CREATE USER RECORD'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="font-mono-tech text-[10px] text-gray-600">
                        SYSTEM ID: INV-2026-SECURE<br />
                        ACCESS LOGGED
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SecretOnboarding;
