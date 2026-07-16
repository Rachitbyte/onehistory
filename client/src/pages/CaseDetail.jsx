import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { format } from 'date-fns';
import { ArrowLeft, Plus, FileText, FlaskConical, Pill, CircleAlert, Trash2, Clock, Upload, Calendar, Activity } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import PatientReportedMeds from '../components/PatientReportedMeds';
import AppointmentForm from '../components/AppointmentForm';

const CaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Actions State
    const [actionMode, setActionMode] = useState(null); // 'VISIT', 'LAB', 'RX', 'UPLOAD_DOC'
    const [formInput, setFormInput] = useState({});
    const [refreshDocs, setRefreshDocs] = useState(0);

    useEffect(() => {
        fetchTimeline();
    }, [id]);

    const fetchTimeline = async () => {
        try {
            const res = await api.get(`/cases/${id}/timeline`);
            setData(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || "Access Denied");
        } finally {
            setLoading(false);
        }
    };



    // Medicine Management
    const [medList, setMedList] = useState([]);
    const [currentMed, setCurrentMed] = useState({
        name: '',
        quantity: '',
        freqMode: 'Daily', // Daily, Interval, Specific
        freqValue: '',
        timingCond: '', // Before Food, After Food...
        durationVal: '',
        durationUnit: 'Days'
    });

    const COMMON_MEDICINES = [
        "Paracetamol", "Ibuprofen", "Amoxicillin", "Metformin",
        "Atorvastatin", "Omeprazole", "Lisinopril", "Amlodipine",
        "Levothyroxine", "Azithromycin"
    ];

    const addMedicine = () => {
        // Validation
        if (!currentMed.name || !currentMed.quantity) {
            alert("Name and Quantity are required.");
            return;
        }
        if (!currentMed.durationVal) {
            alert("Duration is required.");
            return;
        }

        // Antibiotic Warning (Simple Check)
        const antibiotics = ['amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline', 'metronidazole'];
        const isAntibiotic = antibiotics.some(abx => currentMed.name.toLowerCase().includes(abx));
        if (isAntibiotic && parseInt(currentMed.durationVal) < 3) {
            if (!window.confirm("Warning: Antibiotics typically require at least 3 days. Continue?")) return;
        }

        // Format Timing String
        let timingStr = '';
        if (currentMed.freqMode === 'Daily') timingStr = currentMed.freqValue || 'Once Daily';
        else if (currentMed.freqMode === 'Interval') timingStr = `Every ${currentMed.freqValue || 2} days`;
        else if (currentMed.freqMode === 'Specific') timingStr = Object.keys(currentMed.freqValue || {}).filter(k => currentMed.freqValue[k]).join(', ');

        if (currentMed.timingCond) timingStr += ` (${currentMed.timingCond})`;

        const medEntry = {
            name: currentMed.name,
            quantity: currentMed.quantity,
            timing: timingStr,
            duration: `${currentMed.durationVal} ${currentMed.durationUnit}`
        };

        setMedList([...medList, medEntry]);
        setCurrentMed({
            name: '', quantity: '',
            freqMode: 'Daily', freqValue: '', timingCond: '',
            durationVal: '', durationUnit: 'Days'
        });
    };

    const removeMedicine = (idx) => {
        const newList = [...medList];
        newList.splice(idx, 1);
        setMedList(newList);
    };

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus === 'CLOSED' ? 'Close' : 'Reopen'} this case?`)) return;
        try {
            await api.patch(`/cases/${id}/status`, { status: newStatus });
            // Refresh data
            const res = await api.get(`/cases/${id}/timeline`);
            setData(res.data);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (actionMode === 'VISIT') {
                await api.post('/clinical/visits', { caseId: id, ...formInput });
            } else if (actionMode === 'LAB') {
                await api.post('/clinical/labs', { caseId: id, ...formInput });
            } else if (actionMode === 'PRESCRIPTION') {
                if (medList.length === 0) {
                    alert("Please add at least one medicine.");
                    return;
                }
                await api.post('/clinical/prescriptions', {
                    caseId: id,
                    medicines: medList
                });
            } else if (actionMode === 'REPORT') {
                // ... (existing logic)
            }

            setActionMode(null);
            setFormInput({});
            setMedList([]); // Reset
            fetchTimeline();
        } catch (err) {
            alert(err.response?.data?.error || "Action failed");
        }
    };

    // Safe Access
    const caseInfo = data?.case || {};
    const timeline = data?.timeline || [];

    const renderIcon = (type) => {
        switch (type) {
            case 'VISIT': return <FileText size={16} />;
            case 'LAB_REQUEST': case 'LAB_REPORT': return <FlaskConical size={16} />;
            case 'PRESCRIPTION': return <Pill size={16} />;
            case 'APPOINTMENT': return <Calendar size={16} />;
            default: return <Activity size={16} />;
        }
    };

    const renderMedicineItem = (medString) => {
        const match = medString.match(/^(.*?) \((.*?)\)(?: - (.*?))?(?: \[(.*?)\])?$/);
        if (!match) return <div className="p-2 border-b">{medString}</div>;
        const [_, name, quantity, timing, duration] = match;
        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b last:border-0 hover:bg-slate-50 transition-colors gap-2">
                <div className="flex items-start gap-3">
                    <div className="text-slate-400 mt-1" style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                        •
                    </div>
                    <div>
                        <div className="font-semibold text-slate-800 text-base">
                            {name} {quantity && <span className="text-slate-500 font-normal text-sm ml-1">({quantity})</span>}
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end mt-1 sm:mt-0">
                    {timing && (
                        <div className="badge badge-primary flex items-center gap-1" style={{ fontSize: '0.7rem', padding: '0.3em 0.8em' }}>
                            <Clock size={10} />
                            {timing}
                        </div>
                    )}
                    {duration && (
                        <div className="badge badge-warning flex items-center gap-1" style={{ fontSize: '0.7rem', padding: '0.3em 0.8em' }}>
                            <FileText size={10} />
                            {duration}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="container">
            {/* ... (Header & Timeline code remains same) ... */}
            <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ border: 'none', paddingLeft: 0, marginBottom: '1rem' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </button>

            <div className="card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="heading" style={{ marginBottom: '0.5rem' }}>{caseInfo.title}</h1>
                        <div className="subheading" style={{ fontSize: '0.9rem' }}>
                            Patient ID: {caseInfo.patient_id} • Cases ID: {caseInfo.id}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${caseInfo.status === 'OPEN' ? 'badge-green' : 'badge-danger'}`} style={{ marginRight: '1rem' }}>
                            {caseInfo.status}
                        </span>

                        {/* Status Toggle Button */}
                        {user.role === 'DOCTOR' && (
                            <button
                                onClick={() => handleStatusChange(caseInfo.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                                className={`btn btn-sm ${caseInfo.status === 'OPEN' ? 'btn-danger' : 'btn-outline'}`}
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                            >
                                {caseInfo.status === 'OPEN' ? 'Close Case' : 'Reopen Case'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Timeline */}
                <div style={{ flex: 2 }}>
                    <div className="card">
                        <h2 className="subheading mb-4">Case Timeline</h2>
                        {timeline.length === 0 ? (
                            <div className="text-muted">No history recorded yet.</div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="timeline-item shadow-sm p-3 rounded bg-white">
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.75rem',
                                            background: 'rgba(255, 255, 255, 0.5)',
                                            backdropFilter: 'blur(4px)',
                                            border: '1px solid rgba(255, 255, 255, 0.8)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}>
                                            <Clock size={12} style={{ color: 'var(--primary)' }} />
                                            <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
                                                {format(new Date(item.created_at), "MMM d, yyyy")}
                                            </span>
                                            <span style={{ width: '1px', height: '10px', background: '#cbd5e1' }} />
                                            <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>
                                                {format(new Date(item.created_at), "h:mm a")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2" style={{ fontWeight: 600 }}>
                                            {renderIcon(item.type)}
                                            {item.type === 'PRESCRIPTION' ? 'Prescription' : item.summary}
                                        </div>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                            {item.type === 'PRESCRIPTION' && item.details.includes('Medicines:') ? (
                                                <div className="bg-white rounded-lg mt-3 border shadow-sm overflow-hidden">
                                                    <div className="flex flex-col">
                                                        {item.details.replace(/^.*Medicines:\s*/, '').split(' ||| ').map((med, i) => (
                                                            <div key={i}>{renderMedicineItem(med)}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : item.type === 'APPOINTMENT' ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-slate-500 text-sm">Scheduled for:</span>
                                                    <span className="font-semibold text-primary">
                                                        {format(new Date(item.details), "MMMM d, yyyy 'at' h:mm a")}
                                                    </span>
                                                </div>
                                            ) : (
                                                item.details
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#94a3b8' }}>
                                            By: {item.actor}
                                            {item.type === 'LAB_REQUEST' && user.role === 'LAB' && item.details === 'REQUESTED' && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => {
                                                            const obs = prompt("Enter Lab Observations:");
                                                            if (obs) api.post('/clinical/reports', { testId: item.id, observations: obs })
                                                                .then(() => fetchTimeline())
                                                                .catch(e => alert(e.response?.data?.error));
                                                        }}
                                                    >
                                                        Upload Report
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Sidebar (Doctor/Provider) */}
                <div style={{ flex: 1 }}>
                    {(user.role === 'DOCTOR' && caseInfo.status === 'OPEN') && (
                        <div className="card mb-4">
                            <h2 className="subheading mb-4">Actions</h2>
                            <div className="flex flex-col gap-2">
                                <button className="btn btn-outline justify-start" onClick={() => setActionMode('VISIT')}>
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Visit Note
                                </button>
                                <button className="btn btn-outline justify-start" onClick={() => setActionMode('LAB')}>
                                    <FlaskConical size={16} style={{ marginRight: '0.5rem' }} /> Order Hub Lab
                                </button>
                                <button className="btn btn-outline justify-start" onClick={() => setActionMode('PRESCRIPTION')}>
                                    <Pill size={16} style={{ marginRight: '0.5rem' }} /> Issue Prescription
                                </button>
                                <button className="btn btn-outline justify-start" onClick={() => setActionMode('FOLLOW_UP')}>
                                    <Calendar size={16} style={{ marginRight: '0.5rem' }} /> Schedule Follow-Up
                                </button>
                                <button className="btn btn-outline justify-start" onClick={() => setActionMode('UPLOAD_DOC')}>
                                    <Upload size={16} style={{ marginRight: '0.5rem' }} /> Upload Document
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Documents Section */}
                    <div className="card mb-4">
                        <h2 className="subheading mb-4">Documents</h2>
                        <DocumentList caseId={id} refreshTrigger={refreshDocs} />
                    </div>

                    {/* Action Form */}
                    {/* Action Form (Modal) */}
                    {actionMode && (
                        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setActionMode(null) }}>
                            {actionMode === 'FOLLOW_UP' ? (
                                <AppointmentForm
                                    targetId={caseInfo.patient_id}
                                    initialData={null}
                                    onSuccess={() => {
                                        setActionMode(null);
                                        fetchTimeline();
                                    }}
                                    onCancel={() => setActionMode(null)}
                                    caseId={id}
                                />
                            ) : (
                                <div className="modal-content">
                                    <h3 className="heading" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                                        {actionMode === 'PRESCRIPTION' ? 'New Prescription' :
                                            actionMode === 'VISIT' ? 'Visit Note' :
                                                actionMode === 'LAB' ? 'Lab Request' :
                                                    actionMode === 'UPLOAD_DOC' ? 'Upload Document' : 'New Action'}
                                    </h3>

                                    {actionMode === 'UPLOAD_DOC' ? (
                                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <DocumentUpload
                                                caseId={id}
                                                onUploadSuccess={() => {
                                                    setRefreshDocs(prev => prev + 1);
                                                    setActionMode(null);
                                                }}
                                                onCancel={() => setActionMode(null)}
                                            />
                                        </div>
                                    ) : (
                                        <form onSubmit={handleActionSubmit} className="flex flex-col gap-4">
                                            {actionMode === 'VISIT' && (
                                                <>
                                                    <input className="input" placeholder="Diagnosis" onChange={e => setFormInput({ ...formInput, diagnosis: e.target.value })} required />
                                                    <textarea className="input" rows="4" placeholder="Clinical Notes..." onChange={e => setFormInput({ ...formInput, notes: e.target.value })} required />
                                                </>
                                            )}
                                            {actionMode === 'LAB' && (
                                                <>
                                                    <select className="input" onChange={e => setFormInput({ ...formInput, testType: e.target.value })} required>
                                                        <option value="">Select Test Type</option>
                                                        <option value="Blood Test">Blood Test</option>
                                                        <option value="X-Ray">X-Ray</option>
                                                        <option value="MRI">MRI</option>
                                                        <option value="CT Scan">CT Scan</option>
                                                        <option value="Ultrasound">Ultrasound</option>
                                                    </select>
                                                    <input className="input" placeholder="Lab ID / Reference (Optional)" onChange={e => setFormInput({ ...formInput, labId: e.target.value })} />
                                                </>
                                            )}
                                            {actionMode === 'PRESCRIPTION' && (
                                                <div className="animate-fade-in">
                                                    <div className="text-sm text-muted mb-2 font-semibold">Add Medication</div>

                                                    <div className="flex flex-col gap-2 mb-4">
                                                        <div className="flex gap-2">
                                                            <input
                                                                className="input"
                                                                list="med-options"
                                                                placeholder="Search or type name..."
                                                                value={currentMed.name}
                                                                onChange={e => setCurrentMed({ ...currentMed, name: e.target.value })}
                                                                style={{ flex: 3 }}
                                                                autoComplete="off"
                                                            />
                                                            <datalist id="med-options">
                                                                {COMMON_MEDICINES.map(m => <option key={m} value={m} />)}
                                                            </datalist>

                                                            <input
                                                                className="input"
                                                                placeholder="Quantity (e.g. 20 tablets)"
                                                                value={currentMed.quantity}
                                                                onChange={e => setCurrentMed({ ...currentMed, quantity: e.target.value })}
                                                                style={{ flex: 1.5 }}
                                                            />
                                                        </div>

                                                        {/* Frequency Mode */}
                                                        <div className="flex gap-2 mb-2">
                                                            {['Daily', 'Interval', 'Specific'].map(mode => (
                                                                <button
                                                                    type="button"
                                                                    key={mode}
                                                                    onClick={() => setCurrentMed({ ...currentMed, freqMode: mode, freqValue: '' })}
                                                                    className={`btn btn-sm ${currentMed.freqMode === mode ? 'btn-primary' : 'btn-outline'}`}
                                                                    style={{
                                                                        fontSize: '0.75rem',
                                                                        background: currentMed.freqMode === mode ? 'var(--primary)' : 'transparent',
                                                                        color: currentMed.freqMode === mode ? 'white' : 'var(--text-muted)'
                                                                    }}
                                                                >
                                                                    {mode}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Frequency Options */}
                                                        <div className="mb-3 p-2 bg-slate-50 rounded border">
                                                            {currentMed.freqMode === 'Daily' && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {['Once', 'Twice (1-0-1)', 'Thrice (1-1-1)', '4 Times'].map(opt => (
                                                                        <button
                                                                            type="button"
                                                                            key={opt}
                                                                            onClick={() => setCurrentMed({ ...currentMed, freqValue: opt })}
                                                                            className={`badge ${currentMed.freqValue === opt ? 'badge-primary' : ''}`}
                                                                            style={{ cursor: 'pointer', border: '1px solid #e2e8f0' }}
                                                                        >
                                                                            {opt}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {currentMed.freqMode === 'Interval' && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm">Every</span>
                                                                    <input
                                                                        type="number"
                                                                        className="input"
                                                                        style={{ width: '60px', padding: '0.25rem' }}
                                                                        value={currentMed.freqValue}
                                                                        onChange={e => setCurrentMed({ ...currentMed, freqValue: e.target.value })}
                                                                    />
                                                                    <span className="text-sm">Days</span>
                                                                </div>
                                                            )}
                                                            {currentMed.freqMode === 'Specific' && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                                        const selected = currentMed.freqValue && currentMed.freqValue[day];
                                                                        return (
                                                                            <button
                                                                                type="button"
                                                                                key={day}
                                                                                onClick={() => {
                                                                                    const newVal = { ...(currentMed.freqValue || {}), [day]: !selected };
                                                                                    setCurrentMed({ ...currentMed, freqValue: newVal });
                                                                                }}
                                                                                className={`badge ${selected ? 'badge-primary' : ''}`}
                                                                                style={{ cursor: 'pointer', border: '1px solid #e2e8f0', opacity: selected ? 1 : 0.7 }}
                                                                            >
                                                                                {day}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Condition */}
                                                        <div className="mb-3">
                                                            <div className="text-xs text-muted mb-1 font-bold">TIMING</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {['Before Food', 'After Food', 'With Food', 'Empty Stomach', 'Bedtime'].map(cond => (
                                                                    <button
                                                                        type="button"
                                                                        key={cond}
                                                                        onClick={() => setCurrentMed({ ...currentMed, timingCond: cond })}
                                                                        className={`badge ${currentMed.timingCond === cond ? 'badge-success' : ''}`}
                                                                        style={{ cursor: 'pointer', border: '1px solid #e2e8f0' }}
                                                                    >
                                                                        {cond}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Duration */}
                                                        <div className="mb-3">
                                                            <div className="text-xs text-muted mb-1 font-bold">DURATION</div>
                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                {[3, 5, 7, 10, 14, 30].map(d => (
                                                                    <button
                                                                        type="button"
                                                                        key={d}
                                                                        onClick={() => setCurrentMed({ ...currentMed, durationVal: d })}
                                                                        className={`badge ${currentMed.durationVal == d ? 'badge-warning' : ''}`}
                                                                        style={{ cursor: 'pointer', border: '1px solid #e2e8f0' }}
                                                                    >
                                                                        {d} Days
                                                                    </button>
                                                                ))}
                                                                <input
                                                                    placeholder="Custom"
                                                                    className="input"
                                                                    style={{ width: '80px', padding: '0.25rem', fontSize: '0.8rem' }}
                                                                    value={currentMed.durationVal}
                                                                    onChange={e => setCurrentMed({ ...currentMed, durationVal: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="justify-between items-center" style={{ display: 'flex', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '0.2rem' }}>
                                                            <span>* Type any name if not in list.</span>
                                                            <button type="button" onClick={addMedicine} className="btn btn-sm btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                                                                + Add
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Added List */}
                                                    {medList.length > 0 && (
                                                        <div className="mb-4 border rounded-lg p-3 bg-white/50">
                                                            <div className="text-xs text-muted mb-2 font-bold uppercase tracking-wider">Prescribed Items ({medList.length})</div>
                                                            {medList.map((m, i) => (
                                                                <div key={i} className="flex justify-between items-center text-sm p-2 border-b last:border-0 hover:bg-white/80 transition-colors rounded">
                                                                    <div className="flex flex-col">
                                                                        <span style={{ fontWeight: 500 }}>{m.name} <span className="text-muted">({m.dosage})</span></span>
                                                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                            {m.timing} {m.duration && `• ${m.duration}`}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeMedicine(i)}
                                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-3 mt-2 pt-4 border-t border-gray-100">
                                                <button className="btn w-full">Confirm & Submit</button>
                                                <button type="button" className="btn btn-outline" onClick={() => setActionMode(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
