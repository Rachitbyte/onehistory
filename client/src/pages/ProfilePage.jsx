import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import DoctorProfile from '../components/DoctorProfile';
import PatientProfile from '../components/PatientProfile';
import PatientReportedMeds from '../components/PatientReportedMeds';

const ProfilePage = () => {
    const { logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile');
            setUserData(res.data.user);
            setProfileData(res.data.profile);
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            const msg = err.response?.data?.error || err.message || 'Failed to load profile data.';
            setError(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (updatedData) => {
        try {
            await api.put('/profile', updatedData);
            setProfileData(updatedData); // Optimistic update
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div className="container" style={{ padding: '4rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {userData.role === 'DOCTOR' && (
                <DoctorProfile user={userData} profile={profileData} onUpdate={handleUpdate} />
            )}
            {userData.role === 'PATIENT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    <PatientProfile user={userData} profile={profileData} onUpdate={handleUpdate} />
                    <PatientReportedMeds patientId={userData.id} />
                </div>
            )}

            {/* Account Actions */}
            <div style={{ maxWidth: '800px', margin: '3rem auto 0 auto', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                <button
                    onClick={logout}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                    }}
                >
                    Sign Out of All Devices
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
