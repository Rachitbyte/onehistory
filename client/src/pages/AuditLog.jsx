import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuditLog = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user.role === 'PATIENT') {
            fetchLogs();
        }
    }, [user.role]);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/audit');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (user.role !== 'PATIENT') return <div className="container">Access Restricted</div>;

    return (
        <div className="container">
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ border: 'none', paddingLeft: 0, marginBottom: '1rem' }}>
                &lt; Back to Dashboard
            </button>
            <h1 className="heading flex items-center gap-2"><Eye /> Access Audit Log</h1>

            <div className="card">
                {loading ? (
                    <div>Loading logs...</div>
                ) : logs.length === 0 ? (
                    <div className="text-muted">No access logs found.</div>
                ) : (
                    <div className="flex flex-col gap-0" style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        {/* Header */}
                        <div className="flex p-4 bg-slate-50 border-b font-medium text-sm text-slate-500">
                            <div style={{ flex: 1 }}>Time</div>
                            <div style={{ flex: 1 }}>Action</div>
                            <div style={{ flex: 1 }}>Who</div>
                            <div style={{ flex: 2 }}>Resource</div>
                        </div>
                        {/* Rows */}
                        {logs.map((log) => (
                            <div key={log.id} className="flex p-4 border-b last:border-0 hover:bg-slate-50 text-sm">
                                <div style={{ flex: 1, color: '#64748b' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>
                                <div style={{ flex: 1, fontWeight: 600 }}>
                                    <span className={`badge ${log.action === 'DENIED' ? 'badge-red' : 'badge-blue'}`}>
                                        {log.action}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    {log.accessor_id === user.id ? 'You' : log.accessor_id}
                                </div>
                                <div style={{ flex: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {log.resource_type}: {log.resource_id.substring(0, 8)}...
                                    {log.reason && <div style={{ color: '#ef4444', marginTop: '0.2rem' }}>Reason: {log.reason}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLog;
