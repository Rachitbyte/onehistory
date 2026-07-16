import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Shield, Trash2, Plus } from 'lucide-react';

const ConsentManager = () => {
    const { user } = useAuth();
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [providerId, setProviderId] = useState('');
    const [scope, setScope] = useState('ALL');
    const [duration, setDuration] = useState(24);

    useEffect(() => {
        fetchConsents();
    }, []);

    const fetchConsents = async () => {
        try {
            const res = await api.get('/consent');
            setConsents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGrant = async (e) => {
        e.preventDefault();
        try {
            await api.post('/consent', { providerId, scope, purpose: 'Patient Grant', durationHours: duration });
            setProviderId('');
            fetchConsents();
        } catch (err) {
            alert(err.response?.data?.error || "Failed");
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm("Revoke this consent?")) return;
        try {
            await api.post('/consent/revoke', { consentId: id });
            fetchConsents();
        } catch (err) {
            alert(err.response?.data?.error || "Failed");
        }
    };

    if (user.role !== 'PATIENT') return <div className="container">Access Restricted</div>;

    return (
        <div className="container">
            <h1 className="heading flex items-center gap-2">
                <Shield /> Consent Manager
            </h1>

            <div className="flex gap-4">
                <div style={{ flex: 2 }}>
                    <div className="card">
                        <h2 className="subheading mb-4">Active Consents</h2>
                        {consents.length === 0 ? (
                            <div className="text-muted">No active consents.</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {consents.map(c => (
                                    <div key={c.id} className="flex justify-between items-center" style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', opacity: c.status === 'REVOKED' ? 0.5 : 1 }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{c.provider_id}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {c.scope} • Expires: {new Date(c.expires_at).toLocaleString()}
                                            </div>
                                            <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                                {c.status}
                                            </span>
                                        </div>
                                        {c.status === 'ACTIVE' && (
                                            <button className="btn btn-sm btn-outline btn-danger" onClick={() => handleRevoke(c.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div className="card">
                        <h2 className="subheading mb-4">Grant New Access</h2>
                        <form onSubmit={handleGrant} className="flex flex-col gap-2">
                            <div>
                                <label className="subheading" style={{ fontSize: '0.85rem' }}>Provider ID</label>
                                <input className="input" value={providerId} onChange={e => setProviderId(e.target.value)} placeholder="e.g. doctor-123" required />
                            </div>

                            <div>
                                <label className="subheading" style={{ fontSize: '0.85rem' }}>Scope</label>
                                <select className="input" value={scope} onChange={e => setScope(e.target.value)}>
                                    <option value="ALL">Full Access</option>
                                    <option value="LAB">Lab Only</option>
                                    <option value="CASE">Single Case (Manual)</option>
                                </select>
                            </div>

                            <div>
                                <label className="subheading" style={{ fontSize: '0.85rem' }}>Duration (Hours)</label>
                                <input className="input" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                            </div>

                            <button className="btn flex items-center justify-center gap-2">
                                <Plus size={16} /> Grant Access
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsentManager;
