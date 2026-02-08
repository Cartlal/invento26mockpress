import { useState, useEffect } from "react";
import axios from "axios";
import { ShieldAlert, RefreshCw, Search, ArrowLeft } from 'lucide-react';
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/admin/logs`);
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.ip && log.ip.includes(searchTerm))
    );

    return (
        <div className="min-h-screen bg-black spy-grid-bg p-4 md:p-8 text-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="p-2 border border-spy-green/50 text-spy-green hover:bg-spy-green hover:text-black transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="font-orbitron text-2xl md:text-3xl font-black tracking-wider text-spy-blue flex items-center gap-3">
                                <ShieldAlert className="w-8 h-8" />
                                SYSTEM AUDIT LOGS
                            </h1>
                            <p className="font-mono-tech text-xs text-gray-400 tracking-widest mt-1">
                                SECURE RECORD OF ALL OPERATIONS
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black border border-spy-blue/30 pl-10 pr-4 py-2 font-mono-tech text-sm focus:border-spy-blue outline-none w-64"
                            />
                        </div>
                        <button
                            onClick={fetchLogs}
                            className={`p-2 border border-spy-blue/50 text-spy-blue hover:bg-spy-blue hover:text-black transition-all ${loading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-dark-panel border border-spy-blue/30 shadow-neon-blue">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono-tech text-sm">
                            <thead className="bg-spy-blue/10 border-b border-spy-blue/30 text-spy-blue uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Details</th>
                                    <th className="p-4">Source IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500 animate-pulse">
                                            RETRIEVING ENCRYPTED RECORDS...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-spy-blue/5 transition-colors group">
                                            <td className="p-4 whitespace-nowrap text-gray-400">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="p-4 font-bold">
                                                <span className={`px-2 py-1 text-xs border ${log.action.includes('FAILED') || log.action.includes('DELETED')
                                                        ? 'border-spy-red text-spy-red bg-spy-red/10'
                                                        : log.action.includes('SUCCESS') || log.action.includes('ADDED')
                                                            ? 'border-spy-green text-spy-green bg-spy-green/10'
                                                            : 'border-spy-blue text-spy-blue bg-spy-blue/10'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-300 max-w-md truncate group-hover:whitespace-normal group-hover:break-words">
                                                {JSON.stringify(log.details)}
                                            </td>
                                            <td className="p-4 text-gray-500 font-mono">
                                                {log.ip || 'Unknown'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500">
                                            NO MATCHING RECORDS FOUND
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 text-right">
                    <p className="font-mono-tech text-xs text-gray-600">
                        TOTAL RECORDS INDEXED: {logs.length}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Logs;
