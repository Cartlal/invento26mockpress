import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, ShieldAlert } from 'lucide-react';

const API_URL = "http://localhost:5000/api";

function AnalyticsPanel() {
    const [distribution, setDistribution] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [distRes, logRes] = await Promise.all([
                axios.get(`${API_URL}/admin/analytics/distribution`),
                axios.get(`${API_URL}/admin/logs`)
            ]);
            setDistribution(distRes.data);
            setLogs(logRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Live update every 10s
        return () => clearInterval(interval);
    }, []);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-spy-green p-2 text-xs font-mono-tech">
                    <p>{`Score ${label}: ${payload[0].value} votes`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Vote Distribution Chart */}
            <div className="bg-dark-panel border border-spy-green/30 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-spy-green" />
                    <h3 className="font-orbitron font-bold text-white tracking-wider">
                        VOTE DISTRIBUTION
                    </h3>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distribution}>
                            <XAxis
                                dataKey="score"
                                stroke="#00ff4130"
                                tick={{ fill: '#00ff41', fontSize: 10, fontFamily: 'monospace' }}
                            />
                            <YAxis
                                stroke="#00ff4130"
                                tick={{ fill: '#00ff41', fontSize: 10, fontFamily: 'monospace' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="count" fill="#00ff41">
                                {distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index < 3 ? '#ff0000' : index > 7 ? '#00ff41' : '#facc15'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-dark-panel border border-spy-green/30 p-6 backdrop-blur-sm flex flex-col h-80">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-spy-yellow" />
                    <h3 className="font-orbitron font-bold text-white tracking-wider">
                        SYSTEM LOGS (AUDIT)
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {logs.length === 0 ? (
                        <p className="text-gray-500 font-mono-tech text-xs text-center py-10">NO LOGS RECORDED</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} className="border-b border-spy-green/10 pb-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-spy-green font-mono-tech text-xs font-bold w-1/3">
                                        {log.action}
                                    </span>
                                    <span className="text-gray-500 font-mono-tech text-[10px] text-right">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                {log.details && (
                                    <p className="text-gray-400 font-mono-tech text-[10px] mt-1 truncate">
                                        {JSON.stringify(log.details)}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPanel;
