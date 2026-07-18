import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, UserCircle, Home, Shield, X } from 'lucide-react';
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
            {isMobile && isOpen && (
                <div onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40" />
            )}

            <aside
                className={`z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
                    isMobile ? 'fixed left-0 top-0 h-screen shadow-lg' : 'sticky h-auto'
                }`}
                style={{
                    top: isMobile ? 0 : 'calc(70px + 1rem)',
                    bottom: 0,
                    transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                }}
            >
                {isMobile && (
                    <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                        <X size={20} />
                    </button>
                )}

                <div className="flex items-center gap-3 px-6 pb-4 pt-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                        <Shield size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-semibold text-slate-900">OneHistory</span>
                </div>

                <nav className="mt-4 flex flex-col px-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobile && onClose()}
                            className={({ isActive }) =>
                                `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
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
