import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { CirclePlus, Search, Calendar, FileText, ChevronRight, Clock, User, ArrowRight, Zap, GripHorizontal, CheckCircle, AlertCircle, X, Shield, Activity } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [cases, setCases] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Doctor: Form State
    const [createPatientId, setCreatePatientId] = useState('');
    const [newCaseTitle, setNewCaseTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null); // Cases

    // Search Result State
    const [patientProfile, setPatientProfile] = useState(null);
    const [patientMeds, setPatientMeds] = useState([]);

    // VERIFICATION FLOW STATE
    const [pendingCreation, setPendingCreation] = useState(null); // { patientId, title }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const limit = 50; // Increased limit for accurate summary stats
            // Parallel fetch: Cases, Appointments, and Medications (if patient)
            const promises = [
                api.get('/cases'),
                api.get(`/appointments?view=upcoming&limit=${limit}`)
            ];

            if (user.role === 'PATIENT') {
                promises.push(api.get('/medications'));
            }

            const results = await Promise.allSettled(promises);

            // Cases
            if (results[0].status === 'fulfilled') setCases(results[0].value.data);
            // Appointments
            if (results[1].status === 'fulfilled') setAppointments(results[1].value.data);
            // Medications (if patient)
            if (user.role === 'PATIENT' && results[2] && results[2].status === 'fulfilled') {
                setMedications(results[2].value.data);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    // 1. INTERCEPT: triggers profile fetch instead of direct create
    const handleCreateCase = async (e) => {
        e.preventDefault();
        if (!createPatientId.trim() || !newCaseTitle.trim()) return alert("Both ID and Title are required.");

        // Store intent
        setPendingCreation({ patientId: createPatientId, title: newCaseTitle });

        // Reuse search logic to fetch verification data
        await performSearch(createPatientId);
    };

    // 2. ACTUAL EXECUTION: Called after user confirms in Modal
    const confirmCreateCase = async () => {
        if (!pendingCreation) return;
        try {
            const res = await api.post('/cases', { title: pendingCreation.title, patientId: pendingCreation.patientId });
            alert(res.data.status === 'pending_consent' ? "Request sent. Waiting for patient approval." : "Case created.");

            // Cleanup
            setCreatePatientId('');
            setNewCaseTitle('');
            setPendingCreation(null);
            setPatientProfile(null); // Close modal
            fetchData();
        } catch (err) { alert("Failed to create case."); }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        setPendingCreation(null); // Ensure we are in pure search mode
        await performSearch(searchTerm);
    };

    // Shared fetch logic
    const performSearch = async (id) => {
        setPatientProfile(null);
        setSearchResult(null);

        try {
            const [profileRes, medsRes, casesRes] = await Promise.allSettled([
                api.get(`/profile?patientId=${id}`),
                api.get(`/medications?patientId=${id}`),
                api.get(`/cases?patientId=${id}`)
            ]);

            if (profileRes.status === 'fulfilled') {
                setPatientProfile(profileRes.value.data);
                if (medsRes.status === 'fulfilled') setPatientMeds(medsRes.value.data);
                if (casesRes.status === 'fulfilled') setSearchResult(casesRes.value.data);
            } else {
                alert("Patient not found.");
                setPendingCreation(null); // Abort creation if invalid patient
            }
        } catch (err) {
            alert("Error searching patient.");
            setPendingCreation(null);
        }
    };

    const handleApproveCase = async (id, e) => {
        e.preventDefault();
        if (!window.confirm("Approve this case request? This grants access to your medical records for this case.")) return;
        try {
            await api.patch(`/cases/${id}/status`, { status: 'OPEN' });
            fetchData(); // Refresh to show updated status
        } catch (err) {
            alert("Failed to approve case.");
        }
    };

    // Helper for safe date parsing
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? null : d;
    };

    // Helper for Age Calculation
    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return 'N/A'; // Handle invalid date strings

        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return isNaN(age) ? 'N/A' : age;
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--slate-500)' }}>Loading Portal...</div>;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const pendingCases = cases.filter(c => c.status === 'PENDING_CONSENT');

    return (
        <div style={{ background: 'var(--slate-50)', minHeight: '100%', paddingBottom: '4rem' }}>
            {/* STICKY HEADER */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 40,
                height: '72px', background: 'white',
                borderBottom: '1px solid var(--slate-200)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 2rem'
            }}>
                <div style={{ position: 'relative', width: '384px' }} className="hidden md-block">
                    <input 
                        placeholder="Search records, doctors, clinics..."
                        style={{
                            width: '100%', background: '#F1F5F9', border: 'none',
                            padding: '10px 16px 10px 40px', borderRadius: '99px',
                            fontSize: '0.9rem', color: 'var(--slate-900)', outline: 'none'
                        }}
                    />
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                    <div style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', color: 'var(--slate-500)' }}>
                        <AlertCircle size={20} />
                        <span style={{ position: 'absolute', top: '4px', right: '6px', width: '8px', height: '8px', background: 'var(--emerald-primary)', borderRadius: '50%' }}></span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--slate-200)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ecfdf5', color: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.name.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-900)', lineHeight: '1.2' }}>{user.role === 'DOCTOR' && !user.name.startsWith('Dr.') ? 'Dr. ' : ''}{user.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>{user.role} Account</span>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '2rem 1rem 4rem' }}>
                {user.role === 'PATIENT' ? (
                    // ------------------ PATIENT PORTAL ------------------
                    <div className="animate-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Onboarding Progress Banner */}
                        <div className="card rad-24" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', background: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--emerald-primary)' }}>
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>Account Setup</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Complete your profile to unlock all features</span>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--emerald-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
                                        <CheckCircle size={16} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald-primary)' }}>Link Hospital</span>
                                </div>
                                <ChevronRight size={16} color="var(--slate-200)" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--slate-200)', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>2</div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Medical History</span>
                                </div>
                                <ChevronRight size={16} color="var(--slate-200)" />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--slate-200)', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>3</div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-500)' }}>Add Funding</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Grid: Wallet & Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {/* Credit Wallet Card */}
                            <div className="card rad-24" style={{ 
                                background: '#111827', 
                                color: 'white', padding: '2rem', position: 'relative', overflow: 'hidden'
                            }}>
                                
                                <div style={{ position: 'relative', zIndex: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Medical Credit</span>
                                        <Shield size={20} color="#059669" />
                                    </div>
                                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                                        <h2 style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0, lineHeight: 1 }}>Ksh 0.00</h2>
                                    </div>
                                    <button className="pulse-cta w-full flex justify-center items-center gap-2" style={{
                                        background: 'var(--emerald-primary)', color: 'white', border: 'none',
                                        padding: '16px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer'
                                    }}>
                                        <CirclePlus size={20} /> Apply for Credit Now
                                    </button>
                                </div>
                            </div>

                            {/* Quick Actions Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="card rad-24" style={{ padding: '1.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'pointer' }}>
                                    <div style={{ background: 'white', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', boxShadow: 'none' }}>
                                        <Activity size={28} />
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#064e3b', fontFamily: 'var(--font-heading)' }}>Apply</span>
                                </div>
                                <Link to="/appointments" className="card rad-24" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textDecoration: 'none' }}>
                                    <div style={{ background: '#f8fafc', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <Calendar size={28} />
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--slate-900)', fontFamily: 'var(--font-heading)' }}>Book Appt</span>
                                </Link>
                                <div className="card rad-24" style={{ padding: '1.5rem', background: '#f1f5f9', opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'not-allowed' }}>
                                    <div style={{ background: '#e2e8f0', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-500)' }}>
                                        <FileText size={28} />
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--slate-500)', fontFamily: 'var(--font-heading)' }}>Lab Results</span>
                                </div>
                                <div className="card rad-24" style={{ padding: '1.5rem', background: '#f1f5f9', opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', cursor: 'not-allowed' }}>
                                    <div style={{ background: '#e2e8f0', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-500)' }}>
                                        <Search size={28} />
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--slate-500)', fontFamily: 'var(--font-heading)' }}>Find Clinic</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Grid: Transactions & News */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                            {/* Empty State Transactions */}
                            <div className="card rad-24" style={{ background: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: '0 0 2rem 0' }}>Recent Transactions</h3>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', marginBottom: '1.5rem' }}>
                                        <FileText size={32} />
                                    </div>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0 0 0.5rem 0' }}>No Transactions Yet</h4>
                                    <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', maxWidth: '320px', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                                        You haven't made any medical payments or received credit disbursements recently.
                                    </p>
                                    <button className="flex items-center justify-center gap-2" style={{ background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                        <Search size={18} /> Explore Clinics
                                    </button>
                                </div>
                            </div>

                            {/* Health News Feed Item */}
                            <div className="card rad-24" style={{ background: 'white', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: '0 0 1.5rem 0' }}>Health & Wellness</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[1, 2].map(i => (
                                        <div key={i} className="health-news-card" style={{ display: 'flex', gap: '1rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', transition: 'background 0.2s' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#e2e8f0' }}>
                                                <img 
                                                    src={`https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=150&h=150`} 
                                                    alt="News" 
                                                    className="health-news-img"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Preventative Care</span>
                                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0 0 0.25rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    Why Annual Checkups Are Crucial for Early Detection
                                                </h4>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>2 days ago</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* END PATIENT PORTAL */}
                    </div>
                ) : (
                    // ------------------ DOCTOR PORTAL ------------------
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <header className="flex justify-between items-center mb-2">
                            <div>
                                <h1 className="heading" style={{ marginBottom: '0.25rem', fontFamily: 'var(--font-heading)', color: 'var(--slate-900)' }}>
                                    Workspace
                                </h1>
                                <p className="subheading" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-500)' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald-primary)' }}></span>
                                    {today}
                                </p>
                            </div>
                        </header>

                        <section className="animate-fade-in">
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {Object.entries({
                                    "Open Cases": cases.filter(c => c.status === 'OPEN').length,
                                    "Pending Requests": appointments.filter(a => a.status === 'REQUESTED').length,
                                    "Today's Appointments": appointments.filter(a => {
                                        const d = parseDate(a.start_time);
                                        return d && d.toDateString() === new Date().toDateString() && a.status === 'CONFIRMED';
                                    }).length
                                }).map(([label, count], i) => (
                                    <div key={i} className="card rad-24" style={{
                                        flex: '1 1 0px', background: 'white',
                                        padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: '160px'
                                    }}>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1, marginBottom: '0.25rem' }}>{count}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-4" style={{ opacity: 0.6 }}>
                                <Zap size={16} color="var(--emerald-primary)" />
                                <h2 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--slate-500)' }}>Quick Actions</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="card rad-24" style={{ background: 'white' }}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: '12px', color: '#059669' }}>
                                            <CirclePlus size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>New Case</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: 0 }}>Create patient record</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleCreateCase} className="flex-col gap-4" style={{ display: 'flex' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <input className="input" placeholder="Patient ID" value={createPatientId} onChange={e => setCreatePatientId(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--slate-200)' }} />
                                            <input className="input" placeholder="Case Title" value={newCaseTitle} onChange={e => setNewCaseTitle(e.target.value)} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--slate-200)' }} />
                                        </div>
                                        <button className="btn" style={{ width: '100%', background: '#059669', borderRadius: '12px', padding: '16px' }}>
                                            Create Record <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <section style={{ flex: 2 }}>
                                <div className="flex justify-between items-end mb-4 px-2">
                                    <div className="flex items-center gap-2" style={{ opacity: 0.6 }}>
                                        <GripHorizontal size={16} color="var(--slate-500)" />
                                        <h2 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--slate-500)' }}>Recent Activity</h2>
                                    </div>
                                    <Link to="/history" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textDecoration: 'none' }}>View All</Link>
                                </div>
                                <div className="card rad-24" style={{ padding: '0.5rem', background: 'white' }}>
                                    {cases.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>No recent activity.</div> : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {cases.slice(0, 5).map(c => {
                                                const d = parseDate(c.created_at);
                                                return (
                                                    <Link key={c.id} to={`/case/${c.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '16px', transition: 'background 0.2s' }} className="health-news-card hover-bg-light">
                                                        <div className="flex items-center gap-4">
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: c.status === 'OPEN' ? '#d1fae5' : '#f1f5f9', color: c.status === 'OPEN' ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                                                {c.title.substring(0, 1).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: 'var(--slate-900)', fontSize: '0.95rem' }}>{c.title}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                                                    <span>{d ? d.toLocaleDateString() : 'Date N/A'}</span>
                                                                    {c.patient_id && <span>• {c.patient_id}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </section>
                            <section style={{ flex: 1 }}>
                                <div className="flex items-center gap-2 mb-4 px-2" style={{ opacity: 0.6 }}>
                                    <Clock size={16} color="var(--slate-500)" />
                                    <h2 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--slate-500)' }}>Upcoming</h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {appointments.length === 0 ? <div className="card rad-24" style={{ textAlign: 'center', color: 'var(--slate-500)', borderStyle: 'dashed', background: 'transparent' }}>No appointments.</div> : (
                                        appointments.map(a => {
                                            const d = parseDate(a.start_time);
                                            return (
                                                <div key={a.id} className="card rad-24" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' }}>
                                                    <div className="flex items-center gap-4">
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.95rem' }}>{a.patient_name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>{d ? d.toLocaleDateString() : ''}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </main>

            {/* MODAL: BASIC MEDICAL PROFILE (Verification / Emergency View) */}
            {patientProfile && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => { setPatientProfile(null); setPendingCreation(null); }}>
                    <div
                        className="animate-fade-in"
                        style={{
                            background: '#fff',
                            width: '90%', maxWidth: '700px', // Widened for more data
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-md)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ background: pendingCreation ? 'var(--primary)' : '#dc2626', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ color: 'white', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1rem' }}>
                                    {pendingCreation ? 'Verify Patient Identity' : 'Basic Medical Profile'}
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                                    {pendingCreation ? 'Confirm before creating case' : 'Emergency view • Read-Only'}
                                </span>
                            </div>
                            <button onClick={() => { setPatientProfile(null); setPendingCreation(null); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem' }}>
                            {/* TOP ROW: Identity + Vitals */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.2rem' }}>{patientProfile.user.name}</div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#6b7280', fontSize: '0.95rem' }}>
                                        <span style={{ fontWeight: 600 }}>ID: {patientProfile.user.id}</span>
                                        <span>•</span>
                                        <span>{patientProfile.profile.gender || 'Gender N/A'}</span>
                                        <span>•</span>
                                        <span>{calculateAge(patientProfile.profile.dob)} Years</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Blood Group</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', lineHeight: 1 }}>{patientProfile.profile.blood_group || '-'}</div>
                                </div>
                            </div>

                            {/* MIDDLE ROW: Critical Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

                                {/* 1. Critical Health Info (Conditions) */}
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.5rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={16} /> Critical Medical Conditions
                                    </div>
                                    {patientProfile.profile.medical_conditions ? (
                                        <div style={{ fontWeight: 600, color: '#7f1d1d', fontSize: '1rem', lineHeight: '1.4' }}>
                                            {patientProfile.profile.medical_conditions}
                                        </div>
                                    ) : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>None reported</span>}
                                </div>

                                {/* 2. Allergies */}
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Allergies</div>
                                    {patientProfile.profile.allergies ? (
                                        <div style={{ padding: '0.5rem 0.75rem', background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', fontWeight: 700, fontSize: '0.9rem', borderRadius: '4px' }}>
                                            {patientProfile.profile.allergies}
                                        </div>
                                    ) : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>None recorded</span>}
                                </div>
                            </div>

                            {/* BOTTOM ROW: Emergency Contact */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Emergency Contact</div>
                                {patientProfile.profile.emergency_contact_name ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '8px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{patientProfile.profile.emergency_contact_name}</div>
                                        <div style={{ height: '14px', width: '1px', background: '#d1d5db' }}></div>
                                        <a href={`tel:${patientProfile.profile.emergency_contact_phone}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>{patientProfile.profile.emergency_contact_phone}</a>
                                    </div>
                                ) : <span style={{ color: '#9ca3af' }}>Not set</span>}
                            </div>

                            {/* MEDICATIONS (Optional) */}
                            {patientMeds.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Medications</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {patientMeds.map(m => (
                                            <span key={m.id} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#334155' }}>
                                                {m.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FOOTER ACTIONS */}
                            {pendingCreation ? (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                                    <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#6b7280', background: '#f9fafb', padding: '0.75rem', borderRadius: '8px' }}>
                                        <strong>Creating Case:</strong> "{pendingCreation.title}"<br />
                                        Please verify this is the correct patient before proceeding.
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ flex: 1, borderColor: '#d1d5db', color: '#374151' }}
                                            onClick={() => { setPatientProfile(null); setPendingCreation(null); }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ flex: 2, background: 'var(--primary)' }}
                                            onClick={confirmCreateCase}
                                        >
                                            Confirm & Create Case
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                                    <button className="btn btn-outline" style={{ flex: 1, borderColor: '#d1d5db', color: '#374151' }} onClick={() => setPatientProfile(null)}>
                                        Close
                                    </button>
                                    {searchResult && searchResult.length > 0 && (
                                        <Link to={`/case/${searchResult[0].id}`} className="btn" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                                            View Cases ({searchResult.length})
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

