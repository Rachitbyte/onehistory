import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Plus, History, Clock, ArrowLeft } from 'lucide-react';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentForm from '../components/AppointmentForm';
import BackButton from '../components/BackButton';

const AppointmentsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 10;

    // Actions
    const [showBookModal, setShowBookModal] = useState(false);
    const [rescheduleData, setRescheduleData] = useState(null);

    // Initial Load & Tab Change
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Allow booking for any role (Doctor can book for patient, Patient can book for self)
        if (params.get('action') === 'book' && user.role === 'PATIENT') {
            setShowBookModal(true);
        }

        setPage(1); // Reset page on tab switch
        fetchAppointments(1, activeTab, true);
    }, [activeTab, location.search]);

    const fetchAppointments = async (pageNum, view, reset = false) => {
        setLoading(true);
        try {
            const offset = (pageNum - 1) * LIMIT;
            const res = await api.get(`/appointments?view=${view}&limit=${LIMIT}&offset=${offset}`);

            if (reset) {
                setAppointments(res.data);
            } else {
                setAppointments(prev => [...prev, ...res.data]);
            }

            setHasMore(res.data.length === LIMIT);
        } catch (err) {
            console.error("Failed to load appointments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAppointments(nextPage, activeTab, false);
    };

    const handleUpdate = (action, data) => {
        if (action === 'RESCHEDULE') {
            setRescheduleData(data);
            setShowBookModal(true);
        } else {
            // Refresh current view logic
            setPage(1);
            fetchAppointments(1, activeTab, true);
        }
    };

    // Skeleton Loader (Component)
    const SkeletonCard = () => (
        <div className="p-4 border rounded-lg mb-3 animate-pulse bg-white">
            <div className="flex justify-between mb-3">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        </div>
    );

    return (
        <div className="container animate-fade-in pt-24" style={{ paddingBottom: '5rem' }}>
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 24px',
                    marginBottom: '32px',
                    borderRadius: '50px',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.5)',
                    color: '#4f46e5'
                }}>
                    <ArrowLeft size={20} />
                </div>
                <span style={{
                    fontFamily: 'sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#334155',
                    letterSpacing: '-0.02em'
                }}>
                    Go Back Home
                </span>
            </button>

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontFamily: 'sans-serif', fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1e293b' }}>
                        {user.role === 'DOCTOR' ? 'Appointments' : 'My Appointments'}
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                        {user.role === 'DOCTOR' ? 'Manage upcoming visits and requests.' : 'Manage your scheduled visits and history.'}
                    </p>
                </div>

                {user.role === 'PATIENT' && (
                    <button
                        onClick={() => { setRescheduleData(null); setShowBookModal(true); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 24px', borderRadius: '50px',
                            background: '#4f46e5', color: 'white',
                            border: 'none', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.5)',
                            cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Plus size={20} /> Book Appointment
                    </button>
                )}
            </div>

            {/* Glass Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{
                    background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)',
                    padding: '6px', borderRadius: '50px', display: 'inline-flex', gap: '4px',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        style={{
                            padding: '10px 32px', borderRadius: '50px',
                            border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                            background: activeTab === 'upcoming' ? 'white' : 'transparent',
                            color: activeTab === 'upcoming' ? '#4f46e5' : '#64748b',
                            boxShadow: activeTab === 'upcoming' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '10px 32px', borderRadius: '50px',
                            border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem',
                            background: activeTab === 'history' ? 'white' : 'transparent',
                            color: activeTab === 'history' ? '#4f46e5' : '#64748b',
                            boxShadow: activeTab === 'history' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        History
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {loading && page === 1 ? (
                    <div className="grid gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="card text-center py-16 flex flex-col items-center justify-center opacity-80" style={{ minHeight: '300px' }}>
                        <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={32} />
                        </div>
                        <h3 className="subheading" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Appointments Found</h3>
                        <p className="text-muted mb-6 max-w-sm">
                            {activeTab === 'upcoming'
                                ? "You don't have any upcoming visits scheduled."
                                : "No past appointment history available."}
                        </p>
                        {activeTab === 'upcoming' && user.role === 'PATIENT' && (
                            <button onClick={() => setShowBookModal(true)} className="btn btn-outline" style={{ background: 'white' }}>
                                Book Your First Appointment
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {appointments.map(appt => (
                            <div key={appt.id} className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <AppointmentCard
                                    appointment={appt}
                                    onUpdate={handleUpdate}
                                />
                            </div>
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="btn btn-outline"
                                    style={{ padding: '0.8rem 2.5rem', background: 'white' }}
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showBookModal && (
                <div
                    className="modal-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowBookModal(false); }}
                >
                    <AppointmentForm
                        initialData={rescheduleData}
                        targetId={user.role === 'DOCTOR' ? 'patient-param-missing' : 'doctor-123'}
                        onSuccess={() => {
                            setShowBookModal(false);
                            if (activeTab === 'upcoming') {
                                setPage(1);
                                fetchAppointments(1, 'upcoming', true);
                            } else {
                                setActiveTab('upcoming');
                            }
                        }}
                        onCancel={() => setShowBookModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default AppointmentsPage;
