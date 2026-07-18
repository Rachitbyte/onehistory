import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import {
    Search,
    Calendar,
    FileText,
    ChevronRight,
    Clock,
    ArrowRight,
    Zap,
    GripHorizontal,
    CheckCircle,
    AlertCircle,
    X,
    CirclePlus
} from 'lucide-react';

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

    const parseDate = (dateString) => {
        if (!dateString) return null;
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? null : d;
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return 'N/A';

        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return isNaN(age) ? 'N/A' : age;
    };

    if (loading) {
        return <div className="container mt-16 text-center text-slate-500">Loading Portal...</div>;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const pendingCases = cases.filter(c => c.status === 'PENDING_CONSENT');

    const ActionTile = ({ icon: Icon, label, to, disabled = false }) => {
        const content = (
            <>
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${disabled ? 'bg-slate-200 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
                    <Icon size={28} />
                </div>
                <span className={`font-semibold ${disabled ? 'text-slate-500' : 'text-slate-900'}`}>{label}</span>
            </>
        );

        if (to && !disabled) {
            return (
                <Link to={to} className="card flex min-h-36 flex-col items-center justify-center gap-4 no-underline transition-colors hover:bg-slate-50">
                    {content}
                </Link>
            );
        }

        return (
            <div className="card flex min-h-36 cursor-not-allowed flex-col items-center justify-center gap-4 bg-slate-100 opacity-60">
                {content}
            </div>
        );
    };

    return (
        <div className="min-h-full bg-slate-50 pb-16">
            <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-8">
                <form onSubmit={handleSearch} className="relative hidden w-96 md:block">
                    <input
                        className="h-11 w-full rounded-full border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-600 focus:bg-white"
                        placeholder="Search records, doctors, clinics..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </form>

                <div className="ml-auto flex items-center gap-4">
                    <div className="relative cursor-pointer p-2 text-slate-500">
                        <AlertCircle size={20} />
                        <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-emerald-600" />
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-900">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold leading-tight text-slate-900">
                                {user.role === 'DOCTOR' && !user.name.startsWith('Dr.') ? 'Dr. ' : ''}{user.name}
                            </span>
                            <span className="text-xs capitalize text-slate-500">{user.role} Account</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8">
                {user.role === 'PATIENT' ? (
                    <div className="animate-step-content flex flex-col gap-6">
                        <div className="card flex flex-wrap items-center gap-8 px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="m-0 text-lg font-semibold text-slate-900">Account Setup</h3>
                                    <span className="text-sm text-slate-500">Complete your profile to unlock all features</span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                                        <CheckCircle size={16} />
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-700">Link Hospital</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                                <div className="flex items-center gap-2 opacity-60">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500">2</div>
                                    <span className="text-sm font-semibold text-slate-500">Medical History</span>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                                <div className="flex items-center gap-2 opacity-60">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-500">3</div>
                                    <span className="text-sm font-semibold text-slate-500">Consent Controls</span>
                                </div>
                            </div>
                        </div>

                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <ActionTile icon={Calendar} label="Book Appointment" to="/appointments" />
                            <ActionTile icon={FileText} label="Lab Results" disabled />
                            <ActionTile icon={Search} label="Find Clinic" disabled />
                        </section>
                    </div>
                ) : (
                    <div className="animate-fade-in flex flex-col gap-6">
                        <header className="mb-2 flex items-center justify-between">
                            <div>
                                <h1 className="heading mb-1">Workspace</h1>
                                <p className="subheading flex items-center gap-2 text-slate-500">
                                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                    {today}
                                </p>
                            </div>
                        </header>

                        <section className="animate-fade-in">
                            <div className="flex flex-wrap gap-4">
                                {Object.entries({
                                    "Open Cases": cases.filter(c => c.status === 'OPEN').length,
                                    "Pending Requests": appointments.filter(a => a.status === 'REQUESTED').length,
                                    "Today's Appointments": appointments.filter(a => {
                                        const d = parseDate(a.start_time);
                                        return d && d.toDateString() === new Date().toDateString() && a.status === 'CONFIRMED';
                                    }).length
                                }).map(([label, count]) => (
                                    <div key={label} className="card flex min-w-40 flex-1 flex-col bg-white p-6">
                                        <span className="mb-1 text-3xl font-semibold leading-none text-slate-900">{count}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="mb-4 flex items-center gap-2 opacity-70">
                                <Zap size={16} className="text-emerald-600" />
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Actions</h2>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="card bg-white">
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                            <CirclePlus size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="m-0 text-xl font-semibold text-slate-900">New Case</h3>
                                            <p className="m-0 text-sm text-slate-500">Create patient record</p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleCreateCase} className="flex flex-col gap-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <input className="input" placeholder="Patient ID" value={createPatientId} onChange={e => setCreatePatientId(e.target.value)} />
                                            <input className="input" placeholder="Case Title" value={newCaseTitle} onChange={e => setNewCaseTitle(e.target.value)} />
                                        </div>
                                        <button className="btn w-full py-4">
                                            Create Record <ArrowRight size={18} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                            <section>
                                <div className="mb-4 flex items-end justify-between px-2">
                                    <div className="flex items-center gap-2 opacity-70">
                                        <GripHorizontal size={16} className="text-slate-500" />
                                        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Activity</h2>
                                    </div>
                                    <Link to="/history" className="text-xs font-semibold text-emerald-700 no-underline">View All</Link>
                                </div>
                                <div className="card bg-white p-2">
                                    {cases.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500">No recent activity.</div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {cases.slice(0, 5).map(c => {
                                                const d = parseDate(c.created_at);
                                                return (
                                                    <Link key={c.id} to={`/case/${c.id}`} className="flex items-center justify-between rounded-xl p-4 no-underline transition-colors hover:bg-slate-50">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${c.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                {c.title.substring(0, 1).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                                                                <div className="mt-1 flex gap-2 text-xs text-slate-500">
                                                                    <span>{d ? d.toLocaleDateString() : 'Date N/A'}</span>
                                                                    {c.patient_id && <span>&middot; {c.patient_id}</span>}
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

                            <section>
                                <div className="mb-4 flex items-center gap-2 px-2 opacity-70">
                                    <Clock size={16} className="text-slate-500" />
                                    <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming</h2>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {appointments.length === 0 ? (
                                        <div className="card border-dashed bg-transparent text-center text-slate-500">No appointments.</div>
                                    ) : (
                                        appointments.map(a => {
                                            const d = parseDate(a.start_time);
                                            return (
                                                <div key={a.id} className="card flex items-center justify-between bg-white p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                            <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-900">{a.patient_name}</div>
                                                            <div className="mt-1 text-xs text-slate-500">{d ? d.toLocaleDateString() : ''}</div>
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

            {patientProfile && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4"
                    onClick={() => { setPatientProfile(null); setPendingCreation(null); }}
                >
                    <div
                        className="animate-fade-in w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between px-6 py-4 ${pendingCreation ? 'bg-emerald-600' : 'bg-[var(--alert-red)]'}`}>
                            <div className="flex flex-col">
                                <h4 className="m-0 text-sm font-semibold uppercase tracking-wide text-white">
                                    {pendingCreation ? 'Verify Patient Identity' : 'Basic Medical Profile'}
                                </h4>
                                <span className="text-xs font-medium text-white/80">
                                    {pendingCreation ? 'Confirm before creating case' : 'Emergency view - Read-Only'}
                                </span>
                            </div>
                            <button
                                onClick={() => { setPatientProfile(null); setPendingCreation(null); }}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="mb-8 flex justify-between border-b border-slate-100 pb-6">
                                <div>
                                    <div className="mb-1 text-3xl font-semibold text-slate-900">{patientProfile.user.name}</div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="font-semibold">ID: {patientProfile.user.id}</span>
                                        <span>&middot;</span>
                                        <span>{patientProfile.profile.gender || 'Gender N/A'}</span>
                                        <span>&middot;</span>
                                        <span>{calculateAge(patientProfile.profile.dob)} Years</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-1 text-xs font-semibold uppercase text-[var(--alert-red)]">Blood Group</div>
                                    <div className="text-4xl font-semibold leading-none text-slate-900">{patientProfile.profile.blood_group || '-'}</div>
                                </div>
                            </div>

                            <div className="mb-8 grid gap-8 md:grid-cols-2">
                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-[var(--alert-red)]">
                                        <AlertCircle size={16} /> Critical Medical Conditions
                                    </div>
                                    {patientProfile.profile.medical_conditions ? (
                                        <div className="text-base font-semibold leading-6 text-[var(--alert-red)]">
                                            {patientProfile.profile.medical_conditions}
                                        </div>
                                    ) : (
                                        <span className="italic text-slate-400">None reported</span>
                                    )}
                                </div>

                                <div>
                                    <div className="mb-2 text-xs font-semibold uppercase text-[var(--alert-red)]">Allergies</div>
                                    {patientProfile.profile.allergies ? (
                                        <div className="rounded-lg border-l-4 border-[var(--alert-red)] bg-white px-3 py-2 text-sm font-semibold text-[var(--alert-red)]">
                                            {patientProfile.profile.allergies}
                                        </div>
                                    ) : (
                                        <span className="italic text-slate-400">None recorded</span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="mb-2 text-xs font-semibold uppercase text-slate-600">Emergency Contact</div>
                                {patientProfile.profile.emergency_contact_name ? (
                                    <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-3">
                                        <div className="text-sm font-semibold text-slate-900">{patientProfile.profile.emergency_contact_name}</div>
                                        <div className="h-4 w-px bg-slate-300" />
                                        <a href={`tel:${patientProfile.profile.emergency_contact_phone}`} className="text-sm font-semibold text-emerald-700 no-underline">
                                            {patientProfile.profile.emergency_contact_phone}
                                        </a>
                                    </div>
                                ) : (
                                    <span className="text-slate-400">Not set</span>
                                )}
                            </div>

                            {patientMeds.length > 0 && (
                                <div className="mb-6">
                                    <div className="mb-2 text-xs font-semibold uppercase text-slate-600">Active Medications</div>
                                    <div className="flex flex-wrap gap-2">
                                        {patientMeds.map(m => (
                                            <span key={m.id} className="rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700">
                                                {m.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pendingCreation ? (
                                <div className="mt-4 border-t border-slate-200 pt-6">
                                    <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                                        <strong>Creating Case:</strong> "{pendingCreation.title}"<br />
                                        Please verify this is the correct patient before proceeding.
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            className="btn btn-outline flex-1"
                                            onClick={() => { setPatientProfile(null); setPendingCreation(null); }}
                                        >
                                            Cancel
                                        </button>
                                        <button className="btn flex-[2]" onClick={confirmCreateCase}>
                                            Confirm & Create Case
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 flex gap-4 border-t border-slate-200 pt-6">
                                    <button className="btn btn-outline flex-1" onClick={() => setPatientProfile(null)}>
                                        Close
                                    </button>
                                    {searchResult && searchResult.length > 0 && (
                                        <Link to={`/case/${searchResult[0].id}`} className="btn flex-1 no-underline">
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
