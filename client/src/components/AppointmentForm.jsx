import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { AlertTriangle, Info, X } from 'lucide-react';
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
    const [date, setDate] = useState((initialData && initialData.start_time) ? format(new Date(initialData.start_time), 'yyyy-MM-dd') : format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    const [time, setTime] = useState((initialData && initialData.start_time) ? format(new Date(initialData.start_time), 'HH:mm') : '10:00');
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
        <div className="modal-content animate-fade-in">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="m-0 text-xl font-semibold text-slate-900">
                    {getTitle()}
                </h3>
                <button onClick={onCancel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <X size={24} />
                </button>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* Patient ID (Doctor only, Standard view or if missing) */}
                {user.role === 'DOCTOR' && !initialData && !caseId && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Patient ID</label>
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
                <section className="border-t border-slate-100 pt-5">
                    <div className="mb-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">When</div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs text-slate-500">Date</label>
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
                        <div>
                            <label className="mb-1 block text-xs text-slate-500">Time</label>
                            <input
                                type="time"
                                className="input w-full"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs text-slate-500">Duration</label>
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
                </section>

                {/* GROUP 2: HOW */}
                <section className="border-t border-slate-100 pt-5">
                    <div className="mb-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">How</div>
                    </div>
                    <label className="mb-1 block text-xs text-slate-500">Type</label>
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
                </section>

                {/* GROUP 3: WHY */}
                <section className="border-t border-slate-100 pt-5">
                    <div className="mb-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why</div>
                    </div>
                    <div className="mb-3">
                        <label className="mb-2 block text-xs text-slate-500">Reason</label>
                        <div className="flex flex-wrap gap-2">
                            {REASON_TAGS.map(tag => (
                                <button
                                    type="button"
                                    key={tag}
                                    onClick={() => setSelectedReason(tag)}
                                    disabled={loading}
                                    className={`badge ${selectedReason === tag ? 'badge-primary' : ''}`}
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
                </section>

                <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                    <Info size={14} className="shrink-0 text-slate-500" />
                    <span>Appointment will be <strong>REQUESTED</strong> until confirmed.</span>
                </div>

                {/* Actions */}
                <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                    <button
                        type="submit"
                        className="btn w-full justify-center sm:flex-1"
                        disabled={loading}
                    >
                        {getButtonLabel()}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline w-full sm:w-auto"
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
