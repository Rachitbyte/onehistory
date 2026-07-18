import React, { useState } from 'react';
import { Save, User, ShieldCheck, Clock, MapPin } from 'lucide-react';

const DoctorProfile = ({ user, profile, onUpdate }) => {
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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header / Identity */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '2rem'
                }}>
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {user.name}
                        {profile.verification_status === 'VERIFIED' && (
                            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ShieldCheck size={14} /> Verified
                            </span>
                        )}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.25rem' }}>
                        {profile.designation || 'Medical Professional'} • {profile.specialty || 'General Practice'}
                    </p>
                </div>
            </div>

            {/* Core Information */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="heading" style={{ fontSize: '1.25rem', margin: 0 }}>Professional Details</h2>
                    <button
                        className="btn-outline"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        {isEditing ? <><Save size={16} style={{ marginRight: '8px' }} /> Save Changes</> : 'Edit Profile'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>License Number</label>
                        <div className="input" style={{ background: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)' }}>
                            {profile.license_number || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                            Official license numbers cannot be edited.
                        </div>
                    </div>

                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Designation</label>
                        <input
                            className="input"
                            name="designation"
                            value={formData.designation || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Specialty</label>
                        <input
                            className="input"
                            name="specialty"
                            value={formData.specialty || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Years of Experience</label>
                        <input
                            className="input"
                            name="experience_years"
                            type="number"
                            value={formData.experience_years || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Affiliated Hospital / Clinic</label>
                        <input
                            className="input"
                            name="affiliated_hospital"
                            value={formData.affiliated_hospital || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </div>

            {/* Availability & Modes */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Availability & Access</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Current Status</label>
                        <select
                            className="input"
                            name="availability_status"
                            value={formData.availability_status || 'AVAILABLE'}
                            onChange={handleChange}
                            disabled={!isEditing}
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="BUSY">Busy / In Consultation</option>
                            <option value="OFF_DUTY">Off Duty</option>
                        </select>
                    </div>
                    <div>
                        <label className="subheading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Consultation Modes</label>
                        <input
                            className="input"
                            name="consultation_modes"
                            value={formData.consultation_modes || ''}
                            onChange={handleChange}
                            placeholder="e.g. IN_PERSON, ONLINE"
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </div>

            {/* Data Responsibility Statement */}
            <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
            }}>
                <ShieldCheck color="#b45309" size={24} style={{ marginTop: '0.25rem' }} />
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#b45309', margin: '0 0 0.5rem 0' }}>Data Responsibility</h3>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        As a verified healthcare provider, you are authorized to access patient records only for specific medical purposes. All access logs are immutable and auditable. Misuse of patient data will result in immediate suspension and reporting to relevant medical boards.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
