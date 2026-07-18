import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Video, Mic, MapPin, CheckCircle, XCircle, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const statusBadgeClass = (status) => {
    switch (status) {
        case 'CONFIRMED':
            return 'badge-green';
        case 'CANCELLED':
        case 'NO_SHOW':
            return 'badge-red';
        case 'REQUESTED':
            return 'badge-warning';
        default:
            return 'badge';
    }
};

const AppointmentCard = ({ appointment, onUpdate, variant = 'full' }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [notesExpanded, setNotesExpanded] = useState(false);

    const {
        id, start_time, duration_minutes,
        type, status,
        patient_name, provider_name,
        reason_tags, reason_text
    } = appointment;

    const isDoctor = user.role === 'DOCTOR';
    const otherPartyName = isDoctor ? patient_name : provider_name;
    const startDate = new Date(start_time);
    const isPast = new Date() > new Date(startDate.getTime() + duration_minutes * 60000);
    const isHistory = ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status) || isPast;

    const getTypeIcon = (t) => {
        switch (t) {
            case 'VIDEO': return <Video size={14} />;
            case 'AUDIO': return <Mic size={14} />;
            case 'IN_PERSON': return <MapPin size={14} />;
            default: return <Calendar size={14} />;
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Mark as ${newStatus}?`)) return;
        setLoading(true);
        try {
            await api.patch(`/appointments/${id}/status`, { status: newStatus });
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(err.response?.data?.error || "Failed");
        } finally {
            setLoading(false);
        }
    };

    const canConfirm = isDoctor && status === 'REQUESTED' && !isHistory;
    const canCancel = ['REQUESTED', 'CONFIRMED'].includes(status) && !isHistory;
    const canReschedule = ['REQUESTED', 'CONFIRMED'].includes(status) && !isHistory;

    if (variant === 'dashboard') {
        return (
            <div className="dashboard-appointment-item flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-col gap-1">
                    <span className={`badge ${statusBadgeClass(status)}`}>{status}</span>
                    <span className="text-sm font-semibold text-slate-800">{otherPartyName}</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock size={12} />
                        <span>{format(startDate, 'MMM d, h:mm a')}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white ${isHistory ? 'opacity-70' : ''}`}>
            <div className="grid gap-0 md:grid-cols-[110px_1fr_auto]">
                <div className={`${isHistory ? 'bg-slate-100 text-slate-500' : 'bg-slate-950 text-white'} flex min-w-[100px] flex-col items-center justify-center p-6 text-center`}>
                    <span className="text-xs font-semibold uppercase">{format(startDate, 'EEE')}</span>
                    <span className="text-4xl font-semibold leading-none">{format(startDate, 'dd')}</span>
                    <span className="text-sm font-medium uppercase">{format(startDate, 'MMM')}</span>
                </div>

                <div className="flex flex-col gap-3 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className={`badge ${statusBadgeClass(status)}`}>{status}</span>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                            <Clock size={14} />
                            {format(startDate, 'h:mm a')}
                            <span>&middot;</span>
                            <span>{duration_minutes} min</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="mb-2 text-xl font-semibold text-slate-900">{otherPartyName}</h3>
                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                            {getTypeIcon(type)}
                            <span className="capitalize">{type.toLowerCase().replace('_', ' ')}</span>
                        </div>
                    </div>

                    {reason_tags && (
                        <div className="flex flex-wrap gap-2">
                            {JSON.parse(reason_tags).map((tag, i) => (
                                <span key={i} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {!isHistory && (
                    <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 p-4 md:flex-col md:border-l md:border-t-0">
                        {canConfirm && (
                            <button onClick={() => handleStatusChange('CONFIRMED')} disabled={loading} title="Confirm Appointment" className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100">
                                <CheckCircle size={20} />
                            </button>
                        )}
                        {canReschedule && (
                            <button onClick={() => onUpdate && onUpdate('RESCHEDULE', appointment)} disabled={loading} title="Reschedule" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100">
                                <RotateCw size={18} />
                            </button>
                        )}
                        {canCancel && (
                            <button onClick={() => handleStatusChange('CANCELLED')} disabled={loading} title="Cancel" className="rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50">
                                <XCircle size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {reason_text && (
                <div className="border-t border-slate-200">
                    <button
                        onClick={() => setNotesExpanded(!notesExpanded)}
                        className="flex w-full items-center justify-between bg-white px-6 py-3 text-xs font-semibold uppercase text-slate-500 hover:bg-slate-50"
                    >
                        <span>Notes</span>
                        {notesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {notesExpanded && (
                        <div className="bg-slate-50 px-6 pb-5">
                            <p className="m-0 text-sm leading-6 text-slate-600">{reason_text}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;
