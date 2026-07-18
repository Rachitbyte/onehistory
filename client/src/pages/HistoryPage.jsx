import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { FileText, Activity, Search, Filter } from 'lucide-react';

const HistoryPage = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL_TIME');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/cases');
            setCases(res.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = cases.filter(c => {
        // 1. Search (Title, ID, or Patient ID if doctor)
        const isDoctor = user.role === 'DOCTOR';
        const searchLower = searchTerm.toLowerCase();
        const searchMatch =
            c.title.toLowerCase().includes(searchLower) ||
            c.id.toString().toLowerCase().includes(searchLower) ||
            (isDoctor && c.patient_id && c.patient_id.toLowerCase().includes(searchLower));

        // 2. Status Filter
        const statusMatch = statusFilter === 'ALL' || c.status === statusFilter;

        // 3. Date Filter
        let dateMatch = true;
        const now = new Date();
        const created = new Date(c.created_at);

        if (dateFilter === 'LAST_30_DAYS') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            dateMatch = created >= thirtyDaysAgo;
        } else if (dateFilter === 'LAST_6_MONTHS') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            dateMatch = created >= sixMonthsAgo;
        }

        return searchMatch && statusMatch && dateMatch;
    });

    if (loading) return <div className="p-8 text-center text-muted">Loading history...</div>;

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                        {user.role === 'DOCTOR' ? 'All Cases' : 'Medical History'}
                    </h1>
                    <p className="text-muted">
                        Full archive of {user.role === 'DOCTOR' ? 'patient records' : 'your medical records'}.
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-6" style={{ padding: '0 0.5rem' }}>
                <div className="flex gap-4" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                            className="input"
                            style={{ paddingLeft: '2.75rem', height: '48px', boxShadow: 'none', background: 'white' }}
                            placeholder={user.role === 'DOCTOR' ? "Search by case name, ID, or patient ID" : "Search by case name or ID"}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Controls - Simple Selects */}
                    <div className="flex gap-3">
                        <select
                            className="input"
                            style={{
                                width: 'auto',
                                minWidth: '140px',
                                padding: '0 2.5rem 0 1rem',
                                height: '48px',
                                cursor: 'pointer',
                                boxShadow: 'none',
                                border: '1px solid var(--border)',
                                backgroundColor: 'white',
                                color: statusFilter === 'ALL' ? 'var(--text-muted)' : 'var(--text-main)',
                                fontWeight: statusFilter === 'ALL' ? '400' : '600'
                            }}
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                        </select>

                        <select
                            className="input"
                            style={{
                                width: 'auto',
                                minWidth: '140px',
                                padding: '0 2.5rem 0 1rem',
                                height: '48px',
                                cursor: 'pointer',
                                boxShadow: 'none',
                                border: '1px solid var(--border)',
                                backgroundColor: 'white',
                                color: dateFilter === 'ALL_TIME' ? 'var(--text-muted)' : 'var(--text-main)',
                                fontWeight: dateFilter === 'ALL_TIME' ? '400' : '600'
                            }}
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                        >
                            <option value="ALL_TIME">All Time</option>
                            <option value="LAST_30_DAYS">Last 30 Days</option>
                            <option value="LAST_6_MONTHS">Last 6 Months</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                {filteredCases.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-muted pb-2" style={{ fontSize: '1.1rem' }}>No cases match your search or filters.</div>
                        <div className="text-sm text-slate-400">Try adjusting your filters or search terms.</div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredCases.map(c => (
                            <Link key={c.id} to={`/case/${c.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    padding: '1.25rem', borderRadius: 'var(--radius-md)',
                                    background: 'white', border: '1px solid var(--border)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s', cursor: 'pointer'
                                }} className="hover-bg-light">
                                    <div className="flex gap-4 items-center">
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: c.status === 'OPEN' ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
                                            color: c.status === 'OPEN' ? 'var(--success)' : 'var(--text-muted)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem' }}>{c.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(c.created_at).toLocaleDateString()}
                                                {user.role === 'DOCTOR' && <span className="ml-2 text-slate-400">• Patient ID: {c.patient_id}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`badge ${c.status === 'OPEN' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
