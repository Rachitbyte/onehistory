import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Activity, Menu } from 'lucide-react';
import { useSidebar } from '../SidebarContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleSidebar } = useSidebar();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 h-[var(--navbar-height)] min-h-[var(--navbar-height)] border-b border-slate-200 bg-white">
            <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-2 md:gap-3">
                    {user && (
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 md:hidden"
                            aria-label="Toggle navigation menu"
                        >
                            <Menu size={20} />
                        </button>
                    )}

                    <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-3 no-underline">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <Activity size={20} />
                        </div>
                        <span className="text-xl font-semibold text-slate-900">OneHistory</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <Link to="/about" className="nav-btn-about">
                        About
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 no-underline hover:bg-slate-50 sm:flex">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                    <User size={14} />
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                            </Link>
                            <button onClick={handleLogout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn min-h-[38px] px-4 py-2 text-sm">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
