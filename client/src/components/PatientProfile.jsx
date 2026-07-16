import React, { useState } from 'react';
import { Save, User, FileHeart, AlertCircle } from 'lucide-react';

const PatientProfile = ({ user, profile, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(profile);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    return (
        <div>
            {/* Header / Identity */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), #22d3ee)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '2rem'
                }}>
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                        {user.name}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.25rem' }}>
                        Patient ID: <span style={{ fontFamily: 'monospace' }}>{user.id}</span>
                    </p>
                </div>
            </div>

            {/* Medical Record Ownership Statement */}
            <div style={{
                background: 'rgba(79, 70, 229, 0.05)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
            }}>
                <FileHeart color="var(--primary)" size={24} style={{ marginTop: '0.25rem' }} />
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>Medical Record Ownership</h3>
                    <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        You are the sole owner of your medical data on OneHistory. Doctors and facilities can only access your records with your explicit consent. You have the right to revoke access at any time.
                    </p>
                </div>
            </div>

            {/* Personal Information */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="heading" style={{ fontSize: '1.25rem', margin: 0 }}>Personal Information</h2>
                    <button
                        className="btn-outline"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        {isEditing ? <><Save size={16} style={{ marginRight: '8px' }} /> Save Changes</> : 'Edit Info'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Date of Birth</label>
                        <input
                            className="input"
                            name="dob"
                            type="date"
                            value={formData.dob || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Blood Group</label>
                        <input
                            className="input"
                            name="blood_group"
                            value={formData.blood_group || ''}
                            onChange={handleChange}
                            placeholder="e.g. O+, A-"
                            disabled={!isEditing}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Address</label>
                        <input
                            className="input"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Email</label>
                        <input
                            className="input"
                            name="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Phone</label>
                        <input
                            className="input"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </div>

            {/* Critical Health Info */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} color="var(--danger)" />
                    Critical Health Information
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block', color: 'var(--danger)' }}>Known Allergies</label>
                    <textarea
                        className="input"
                        name="allergies"
                        value={formData.allergies || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="List any known medication or food allergies..."
                        style={{ minHeight: '80px', borderColor: formData.allergies ? 'var(--danger)' : '' }}
                    />
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="card">
                <h2 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Emergency Contact</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Contact Name</label>
                        <input
                            className="input"
                            name="emergency_contact_name"
                            value={formData.emergency_contact_name || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Contact Phone</label>
                        <input
                            className="input"
                            name="emergency_contact_phone"
                            value={formData.emergency_contact_phone || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
