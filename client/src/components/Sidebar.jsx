import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, UserCircle, Home, Shield, X } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useSidebar } from '../SidebarContext';

const Sidebar = () => {
    const { user } = useAuth();
    const { isSidebarOpen, closeSidebar } = useSidebar();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/history', label: 'Cases', icon: LayoutDashboard },
        { path: '/appointments', label: user?.role === 'DOCTOR' ? 'Appointments' : 'Visits', icon: Calendar },
        { path: '/consents', label: 'Consents', icon: Shield },
        { path: '/profile', label: 'Profile', icon: UserCircle },
    ];

    const initials = user?.name
        ?.split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'U';

    return (
        <>
            {isSidebarOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed inset-x-0 bottom-0 top-[var(--navbar-height)] z-40 bg-slate-950/40 md:hidden"
                />
            )}

            <aside
                className={`fixed bottom-0 left-0 top-[var(--navbar-height)] z-50 flex h-[calc(100vh-var(--navbar-height))] w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:sticky md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button
                    type="button"
                    onClick={closeSidebar}
                    className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
                    aria-label="Close navigation menu"
                >
                    <X size={20} />
                </button>

                <nav className="flex flex-col gap-1 px-3 py-5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                                `relative flex items-center gap-3 rounded-xl px-3 py-3 pl-4 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-emerald-600" />}
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto border-t border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{user?.role || 'Account'}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
