import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Plus, Trash2, Edit2, AlertCircle, Info, Pill, Apple, Leaf } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_ICONS = {
    OTC: <Pill size={16} />,
    SUPPLEMENT: <Apple size={16} />,
    HERBAL: <Leaf size={16} />,
    OTHER: <Info size={16} />
};

const TYPE_COLORS = {
    OTC: 'bg-slate-100 text-slate-700',
    SUPPLEMENT: 'bg-slate-100 text-slate-700',
    HERBAL: 'bg-emerald-100 text-emerald-700',
    OTHER: 'bg-gray-100 text-gray-700'
};

const PatientReportedMeds = ({ patientId, readOnly = false }) => {
    const { user } = useAuth();
    const [meds, setMeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMed, setEditingMed] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', type: 'OTC', dosage: '', frequency: '', start_date: '', end_date: '', reason: '', notes: ''
    });

    useEffect(() => {
        fetchMeds();
    }, [patientId]);

    const fetchMeds = async () => {
        setLoading(true);
        try {
            const query = patientId ? `?patientId=${patientId}` : '';
            const res = await api.get(`/medications${query}`);
            setMeds(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMed) {
                await api.put(`/medications/${editingMed.id}`, formData);
            } else {
                await api.post('/medications', formData);
            }
            setShowForm(false);
            setEditingMed(null);
            resetForm();
            fetchMeds();
        } catch (err) {
            alert("Failed to save medication");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this medication history?")) return;
        try {
            await api.delete(`/medications/${id}`);
            fetchMeds();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'OTC', dosage: '', frequency: '', start_date: '', end_date: '', reason: '', notes: '' });
    };

    const startEdit = (med) => {
        setFormData({
            name: med.name,
            type: med.type,
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            start_date: med.start_date || '',
            end_date: med.end_date || '',
            reason: med.reason || '',
            notes: med.notes || ''
        });
        setEditingMed(med);
        setShowForm(true);
    };

    const isPatient = user.role === 'PATIENT';
    // If readOnly is passed (Doctor View) OR user is not patient (Double Safety)
    const viewOnly = readOnly || !isPatient;

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="subheading flex items-center gap-2 mb-0">
                    <Info size={20} className="text-slate-400" />
                    Self-Reported Medications
                </h3>
                {!viewOnly && (
                    <button
                        onClick={() => { setShowForm(true); setEditingMed(null); resetForm(); }}
                        className="btn btn-sm btn-outline flex items-center gap-1"
                    >
                        <Plus size={16} /> Add Entry
                    </button>
                )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 flex gap-3 text-sm text-slate-600">
                <AlertCircle size={20} className="shrink-0 text-slate-400" />
                <p className="italic">
                    The following medications are reported by the patient and are not prescribed or verified by a healthcare professional.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-4 text-muted">Loading history...</div>
            ) : meds.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-muted">No patient-reported medications logged.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {meds.map(med => (
                        <div key={med.id} className="p-4 bg-white border border-slate-200 rounded-lg transition-colors hover:bg-slate-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${TYPE_COLORS[med.type]}`}>
                                            {TYPE_ICONS[med.type]}
                                            {med.type}
                                        </span>
                                        <h4 className="font-bold text-slate-800 text-lg">{med.name}</h4>
                                    </div>
                                    <div className="text-sm text-slate-600 space-y-1">
                                        {(med.dosage || med.frequency) && (
                                            <div>{med.dosage} {med.frequency && `• ${med.frequency}`}</div>
                                        )}
                                        {med.reason && <div><span className="text-slate-400">Reason:</span> {med.reason}</div>}
                                        {med.notes && <div className="italic text-slate-500 mt-1">"{med.notes}"</div>}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2">
                                        Started: {med.start_date ? format(new Date(med.start_date), 'MMM d, yyyy') : 'Unknown'}
                                        {med.end_date && ` • Ended: ${format(new Date(med.end_date), 'MMM d, yyyy')}`}
                                    </div>
                                </div>
                                {!viewOnly && (
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(med)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(med.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && createPortal(
                <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
                    <div className="modal-content max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="heading mb-4">{editingMed ? 'Edit Entry' : 'Log Medication'}</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div>
                                <label className="text-xs font-bold text-muted mb-1 block">NAME</label>
                                <input className="input w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Vitamin D, Aspirin" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">TYPE</label>
                                    <select className="input w-full" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="OTC">OTC (Over the Counter)</option>
                                        <option value="SUPPLEMENT">Supplement</option>
                                        <option value="HERBAL">Herbal</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">DOSAGE</label>
                                    <input className="input w-full" value={formData.dosage} onChange={e => setFormData({ ...formData, dosage: e.target.value })} placeholder="e.g. 500mg" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted mb-1 block">FREQUENCY</label>
                                <input className="input w-full" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} placeholder="e.g. Once daily" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">START DATE</label>
                                    <input type="date" className="input w-full" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted mb-1 block">END DATE (Optional)</label>
                                    <input type="date" className="input w-full" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted mb-1 block">REASON</label>
                                <input className="input w-full" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="e.g. Headache, Wellness" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted mb-1 block">NOTES</label>
                                <textarea className="input w-full" rows="2" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional details..."></textarea>
                            </div>

                            <div className="flex gap-3 mt-4 pt-3 border-t border-slate-100">
                                <button type="submit" className="btn w-full">Save Entry</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline w-full">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PatientReportedMeds;
