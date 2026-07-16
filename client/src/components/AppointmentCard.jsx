import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Video, Mic, MapPin, CheckCircle, XCircle, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

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

    // --- Helpers ---
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

    // --- Permissions ---
    const canConfirm = isDoctor && status === 'REQUESTED' && !isHistory;
    const canCancel = ['REQUESTED', 'CONFIRMED'].includes(status) && !isHistory;
    const canReschedule = ['REQUESTED', 'CONFIRMED'].includes(status) && !isHistory;

    // --- Dashboard Compact Mode ---
    if (variant === 'dashboard') {
        const statusColors = {
            CONFIRMED: { bg: '#dcfce7', text: '#166534' },
            REQUESTED: { bg: '#fef9c3', text: '#854d0e' },
            CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
            COMPLETED: { bg: '#eff6ff', text: '#1e40af' },
            default: { bg: '#f1f5f9', text: '#475569' }
        };
        const sColor = statusColors[status] || statusColors.default;

        return (
            <div className="group dashboard-appointment-item" style={{
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '12px',
                border: 'none',
                boxShadow: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.2s ease',
                cursor: 'pointer'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{
                            fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
                            padding: '2px 6px', borderRadius: '4px',
                            background: sColor.bg, color: sColor.text
                        }}>
                            {status}
                        </span>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>
                        {otherPartyName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                        <Clock size={12} className="text-slate-400" />
                        <span>{format(startDate, 'MMM d, h:mm a')}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02), 0 10px 15px rgba(0,0,0,0.05)',
            marginBottom: '20px',
            overflow: 'hidden',
            transition: 'transform 0.2s',
            opacity: isHistory ? 0.7 : 1,
            filter: isHistory ? 'grayscale(0.5)' : 'none'
        }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr auto', gap: '0' }}>

                {/* 1. Date Column */}
                <div style={{
                    background: isHistory ? '#f1f5f9' : '#4f46e5',
                    color: isHistory ? '#94a3b8' : 'white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '24px',
                    textAlign: 'center',
                    minWidth: '100px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.9 }}>{format(startDate, 'EEE')}</span>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1' }}>{format(startDate, 'dd')}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', opacity: 0.9 }}>{format(startDate, 'MMM')}</span>
                    </div>
                </div>

                {/* 2. Main Content */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Top Row: Status & Time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                            padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
                            ...(() => {
                                switch (status) {
                                    case 'CONFIRMED': return { background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0' };
                                    case 'REQUESTED': return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
                                    case 'CANCELLED': return { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', textDecoration: 'line-through' };
                                    case 'COMPLETED': return { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
                                    default: return { background: '#f1f5f9', color: '#64748b' };
                                }
                            })()
                        }}>
                            {status}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>
                            <Clock size={14} />
                            {format(startDate, 'h:mm a')}
                            <span>•</span>
                            <span>{duration_minutes} min</span>
                        </div>
                    </div>

                    {/* Middle: Info */}
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {otherPartyName}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                {getTypeIcon(type)}
                                <span style={{ textTransform: 'capitalize' }}>{type.toLowerCase().replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Tags */}
                    {reason_tags && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {JSON.parse(reason_tags).map((tag, i) => (
                                <span key={i} style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Actions (Right Side) */}
                {!isHistory && (
                    <div style={{
                        padding: '24px',
                        borderLeft: '1px solid rgba(255,255,255,0.5)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        background: 'rgba(248, 250, 252, 0.5)'
                    }}>
                        {canConfirm && (
                            <button
                                onClick={() => handleStatusChange('CONFIRMED')}
                                disabled={loading}
                                title="Confirm Appointment"
                                style={{
                                    width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                    background: '#ecfdf5', color: '#059669', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <CheckCircle size={20} />
                            </button>
                        )}

                        {canReschedule && (
                            <button
                                onClick={() => onUpdate && onUpdate('RESCHEDULE', appointment)}
                                disabled={loading}
                                title="Reschedule"
                                style={{
                                    width: '42px', height: '42px', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer',
                                    background: 'white', color: '#6366f1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <RotateCw size={18} />
                            </button>
                        )}

                        {canCancel && (
                            <button
                                onClick={() => handleStatusChange('CANCELLED')}
                                disabled={loading}
                                title="Cancel"
                                style={{
                                    width: '42px', height: '42px', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer',
                                    background: 'white', color: '#ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <XCircle size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 4. Notes Section (Expandable) */}
            {reason_text && (
                <div style={{ borderTop: '1px solid #f1f5f9' }}>
                    <button
                        onClick={() => setNotesExpanded(!notesExpanded)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}
                    >
                        <span>Notes</span>
                        {notesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {notesExpanded && (
                        <div style={{ padding: '0 24px 20px', background: 'rgba(248, 250, 252, 0.5)' }}>
                            <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>
                                {reason_text}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;
