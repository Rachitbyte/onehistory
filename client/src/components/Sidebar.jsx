import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, UserCircle, Home, Shield } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    const { user } = useAuth();
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/history', label: 'Cases', icon: LayoutDashboard },
        { path: '/appointments', label: user?.role === 'DOCTOR' ? 'Appointments' : 'Visits', icon: Calendar },
        { path: '/consents', label: 'Consents', icon: Shield },
        { path: '/profile', label: 'Profile', icon: UserCircle },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40
                    }}
                />
            )}

            {/* Sidebar Container */}
            <aside style={{
                width: '256px',
                background: 'white',
                borderRight: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                position: isMobile ? 'fixed' : 'sticky',
                top: isMobile ? 0 : 'calc(70px + 1rem)', // adjusting if navbar exists
                height: isMobile ? '100vh' : 'auto',
                left: 0,
                bottom: 0,
                transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                transition: 'transform 0.3s ease',
                zIndex: 50,
                boxShadow: isMobile && isOpen ? '4px 0 24px rgba(0,0,0,0.1)' : 'none'
            }}>
                {/* Mobile Close Button */}
                {isMobile && (
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                        &times;
                    </button>
                )}

                {/* Brand Logo */}
                <div style={{ padding: '2rem 1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'var(--emerald-primary)', color: 'white',
                        width: '32px', height: '32px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Shield size={20} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--slate-900)' }}>OneHistory</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobile && onClose()}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.875rem 1.5rem',
                                textDecoration: 'none',
                                color: isActive ? 'var(--emerald-primary)' : 'var(--slate-500)',
                                background: isActive ? '#ecfdf5' : 'transparent',
                                fontWeight: isActive ? 600 : 500,
                                transition: 'all 0.2s ease',
                                borderRight: isActive ? '4px solid var(--emerald-primary)' : '4px solid transparent'
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
