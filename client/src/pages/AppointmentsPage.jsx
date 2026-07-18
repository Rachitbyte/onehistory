import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { useLocation } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentForm from '../components/AppointmentForm';
import BackButton from '../components/BackButton';

const AppointmentsPage = () => {
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
        <div className="container animate-fade-in pt-10" style={{ paddingBottom: '5rem' }}>
            <BackButton />

            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="heading">
                        {user.role === 'DOCTOR' ? 'Appointments' : 'My Appointments'}
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1rem' }}>
                        {user.role === 'DOCTOR' ? 'Manage upcoming visits and requests.' : 'Manage your scheduled visits and history.'}
                    </p>
                </div>

                {user.role === 'PATIENT' && (
                    <button onClick={() => { setRescheduleData(null); setShowBookModal(true); }} className="btn">
                        <Plus size={20} /> Book Appointment
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`rounded-lg px-8 py-2 text-sm font-semibold transition-colors ${activeTab === 'upcoming' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`rounded-lg px-8 py-2 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
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
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
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
