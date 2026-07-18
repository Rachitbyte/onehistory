import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Shield, CheckCircle, XCircle, Clock, User, AlertCircle, Search, FileKey } from 'lucide-react';

const ConsentsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'
    const [consents, setConsents] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Doctor: Request Form
    const [requestPatientId, setRequestPatientId] = useState('');
    const [requestPurpose, setRequestPurpose] = useState('');

    useEffect(() => {
        fetchConsents();
    }, [activeTab]);

    const fetchConsents = async () => {
        setLoading(true);
        try {
            if (user.role === 'PATIENT') {
                const [activeRes, pendingRes] = await Promise.all([
                    api.get('/consent'),
                    api.get('/consent/pending')
                ]);
                setConsents(activeRes.data);
                setPendingRequests(pendingRes.data);
            } else {
                // Doctor
                const res = await api.get('/consent');
                setConsents(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post('/consent/approve', { consentId: id, scope: 'ALL' });
            fetchConsents();
            alert("Access granted.");
        } catch (err) { alert("Failed to approve."); }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this request?")) return;
        try {
            await api.post('/consent/reject', { consentId: id });
            fetchConsents();
        } catch (err) { alert("Failed to reject."); }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm("Revoke access? The provider will no longer be able to view your data.")) return;
        try {
            await api.post('/consent/revoke', { consentId: id });
            fetchConsents();
        } catch (err) { alert("Failed to revoke."); }
    };

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        if (!requestPatientId) return alert("Patient ID is required");
        try {
            await api.post('/consent/request', { patientId: requestPatientId, purpose: requestPurpose || 'Medical Care' });
            alert("Request sent.");
            setRequestPatientId('');
            setRequestPurpose('');
        } catch (err) { alert("Failed to send request. " + (err.response?.data?.error || "")); }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading && consents.length === 0) return <div className="p-8 text-center text-gray-500">Loading consents...</div>;

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>

            <header className="flex items-center gap-3 mb-8">
                <div style={{ padding: '0.75rem', background: 'var(--primary-soft)', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="heading" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Data Access & Consents</h1>
                    <p className="subheading">Manage who can view your medical records</p>
                </div>
            </header>

            {user.role === 'PATIENT' ? (
                <>
                    {/* TABS */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('active')}
                            style={{
                                padding: '0.75rem 0',
                                borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-light)',
                                fontWeight: 600,
                                background: 'none'
                            }}
                        >
                            Active Access ({consents.filter(c => c.status === 'ACTIVE').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            style={{
                                padding: '0.75rem 0',
                                borderBottom: activeTab === 'pending' ? '2px solid var(--warning)' : '2px solid transparent',
                                color: activeTab === 'pending' ? 'var(--warning-dark)' : 'var(--text-light)',
                                fontWeight: 600,
                                background: 'none',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            Pending Requests ({pendingRequests.length})
                            {pendingRequests.length > 0 && <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{pendingRequests.length}</span>}
                        </button>
                    </div>

                    {/* Pending Requests Content */}
                    {activeTab === 'pending' && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            {pendingRequests.length === 0 ? (
                                <div className="card text-center py-12 text-gray-400">No pending requests.</div>
                            ) : (
                                pendingRequests.map(req => (
                                    <div key={req.id} className="card flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderLeft: '4px solid var(--warning)' }}>
                                        <div>
                                            <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                                                <AlertCircle size={18} /> Access Requested
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Doctor requesting access</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                <span className="font-semibold">Provider ID:</span> {req.provider_id} • <span className="font-semibold">Purpose:</span> {req.purpose}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Requested on {formatDate(req.requested_at)}</div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button onClick={() => handleReject(req.id)} className="btn btn-outline flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50">
                                                Reject
                                            </button>
                                            <button onClick={() => handleApprove(req.id)} className="btn flex-1 md:flex-none bg-primary text-white">
                                                Approve Access
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Active Consents Content */}
                    {activeTab === 'active' && (
                        <div className="grid gap-4">
                            {consents.filter(c => c.status === 'ACTIVE').length === 0 ? (
                                <div className="card text-center py-12 text-gray-400">No active consents. Your data is private.</div>
                            ) : (
                                consents.filter(c => c.status === 'ACTIVE').map(c => (
                                    <div key={c.id} className="card flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div style={{ width: '40px', height: '40px', background: '#ecfdf5', color: '#059669', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">
                                                    {c.scope && c.scope.startsWith('CASE:') ? 'Case Specific Access' : 'Full Profile Access'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Granted to <span className="font-semibold">{c.provider_id}</span> on {formatDate(c.granted_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRevoke(c.id)} className="text-sm text-red-500 font-semibold hover:underline">
                                            Revoke
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            ) : (
                // DOCTOR VIEW
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left: Request Form */}
                    <div className="lg:col-span-1">
                        <div className="card bg-slate-50 border-slate-200">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <FileKey size={20} className="text-primary" /> Request Access
                            </h3>
                            <form onSubmit={handleRequestAccess} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Patient ID</label>
                                    <input
                                        className="input bg-white w-full"
                                        placeholder="e.g. patient-123"
                                        value={requestPatientId}
                                        onChange={e => setRequestPatientId(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Purpose</label>
                                    <input
                                        className="input bg-white w-full"
                                        placeholder="e.g. Routine Checkup"
                                        value={requestPurpose}
                                        onChange={e => setRequestPurpose(e.target.value)}
                                    />
                                </div>
                                <button className="btn w-full justify-center">Send Request</button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Active List */}
                    <div className="lg:col-span-2">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            Active Consents ({consents.length})
                        </h3>
                        <div className="space-y-3">
                            {consents.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-dashed">No active consents found.</div>
                            ) : (
                                consents.map(c => (
                                    <div key={c.id} className="card p-4 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-gray-800">Patient: {c.patient_id}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Since {formatDate(c.granted_at)} • Purpose: {c.purpose}
                                            </div>
                                        </div>
                                        <span className="badge badge-success">Active</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ConsentsPage;
