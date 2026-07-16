import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, AlertTriangle, CheckCircle, Info, User, Tag, FileText, X } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const REASON_TAGS = [
    "General Consultation", "Follow-up", "Prescription Renewal",
    "Lab Results Review", "Urgent Care", "Vaccination", "Other"
];

const DURATION_PRESETS = [15, 30, 45, 60];

const AppointmentForm = ({ targetId, onSuccess, onCancel, initialData = null, caseId = null }) => {
    const { user } = useAuth();

    // Initial State
    const [date, setDate] = useState((initialData && initialData.start_time) ? format(new Date(initialData.start_time), 'yyyy-MM-dd') : '');
    const [time, setTime] = useState((initialData && initialData.start_time) ? format(new Date(initialData.start_time), 'HH:mm') : '');
    const [duration, setDuration] = useState(initialData?.duration_minutes || 30);
    const [type, setType] = useState(initialData?.type || 'IN_PERSON');

    // Reason Selection
    const initialReasonList = initialData ? JSON.parse(initialData.reason_tags || '[]') : [];
    const [selectedReason, setSelectedReason] = useState(initialReasonList[0] || '');
    const [reasonText, setReasonText] = useState(initialData?.reason_text || '');

    // Doctor specific: Patient ID input
    const effectiveTargetId = (targetId && !targetId.includes('missing')) ? targetId : '';
    const [customPatientId, setCustomPatientId] = useState(effectiveTargetId);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const finalTargetId = user.role === 'DOCTOR' ? customPatientId : targetId;
        if (user.role === 'DOCTOR' && !finalTargetId) return setError("Patient ID is required.");
        if (!date || !time) return setError("Date and time are required.");
        if (!selectedReason) return setError("Select a reason.");

        const startDateTime = new Date(`${date}T${time}`);
        if (startDateTime < new Date()) return setError("Appointment must be in the future.");

        setLoading(true);

        const payload = {
            targetId: finalTargetId,
            startTime: startDateTime.toISOString(),
            duration: parseInt(duration),
            type,
            reasonTags: [selectedReason],
            reasonText,
            rescheduledFromId: initialData?.id || null,
            caseId: caseId || null
        };
        console.log("Submitting Appointment Payload:", payload); // DEBUG

        try {
            await api.post('/appointments-v2', payload);
            if (onSuccess) onSuccess();
        } catch (err) {
            const data = err.response?.data;
            const msg = (typeof data === 'object' ? data.error : data) || "Booking failed.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        if (initialData && initialData.id) return "Reschedule Appointment";
        if (caseId) return "Schedule Follow-Up";
        return "New Appointment";
    };

    const getButtonLabel = () => {
        if (loading) return 'Processing...';
        if (initialData) return 'Confirm Reschedule';
        return 'Send Request';
    };

    return (
        <div className="modal-content animate-fade-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="heading" style={{ fontSize: '1.25rem', marginBottom: 0 }}>
                    {getTitle()}
                </h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded flex items-center gap-2 text-sm border border-red-100">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Patient ID (Doctor only, Standard view or if missing) */}
                {user.role === 'DOCTOR' && !initialData && !caseId && (
                    <div>
                        <label className="text-xs text-muted mb-1 font-bold uppercase tracking-wider">Patient ID</label>
                        <input
                            className="input w-full"
                            placeholder="e.g. patient-123"
                            value={customPatientId}
                            onChange={e => setCustomPatientId(e.target.value)}
                            disabled={!!effectiveTargetId || loading}
                            required
                        />
                    </div>
                )}

                {/* GROUP 1: WHEN */}
                <div>
                    <label className="text-xs text-muted mb-2 font-bold uppercase tracking-wider block">When</label>
                    <div className="flex gap-4">
                        <div style={{ flex: 2 }}>
                            <label className="text-xs text-muted mb-1 block">Date</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                min={format(new Date(), 'yyyy-MM-dd')}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="text-xs text-muted mb-1 block">Time</label>
                            <input
                                type="time"
                                className="input w-full"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="text-xs text-muted mb-1 block">Duration</label>
                            <select
                                className="input w-full"
                                value={duration}
                                onChange={e => setDuration(e.target.value)}
                                disabled={loading}
                            >
                                {DURATION_PRESETS.map(d => (
                                    <option key={d} value={d}>{d} min</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* GROUP 2: HOW */}
                <div>
                    <label className="text-xs text-muted mb-2 font-bold uppercase tracking-wider block">How</label>
                    <div className="flex gap-4">
                        <div style={{ flex: 1 }}>
                            <label className="text-xs text-muted mb-1 block">Type</label>
                            <select
                                className="input w-full"
                                value={type}
                                onChange={e => setType(e.target.value)}
                                disabled={loading}
                            >
                                <option value="IN_PERSON">In-Person Visit</option>
                                <option value="VIDEO">Video Consultation</option>
                                <option value="AUDIO">Phone Call</option>
                            </select>
                        </div>
                        {/* Spacer for alignment if needed, or just let it expand */}
                        <div style={{ flex: 2 }}></div>
                    </div>
                </div>

                {/* GROUP 3: WHY */}
                <div>
                    <label className="text-xs text-muted mb-2 font-bold uppercase tracking-wider block">Why</label>
                    <div className="mb-3">
                        <label className="text-xs text-muted mb-1 block">Reason</label>
                        <div className="flex flex-wrap gap-2">
                            {REASON_TAGS.map(tag => (
                                <button
                                    type="button"
                                    key={tag}
                                    onClick={() => setSelectedReason(tag)}
                                    disabled={loading}
                                    className={`badge ${selectedReason === tag ? 'badge-primary' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid #e2e8f0',
                                        padding: '0.5em 1em',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea
                        className="input w-full"
                        rows="2"
                        value={reasonText}
                        onChange={e => setReasonText(e.target.value)}
                        placeholder="Notes (Optional)"
                        disabled={loading}
                    />
                </div>

                <div className="bg-blue-50/50 p-2 rounded text-xs text-slate-500 flex gap-2 border border-blue-50">
                    <Info size={14} className="text-primary shrink-0" />
                    <span>Appointment will be <strong>REQUESTED</strong> until confirmed.</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-2 pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        className="btn w-full justify-center"
                        disabled={loading}
                    >
                        {getButtonLabel()}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppointmentForm;
