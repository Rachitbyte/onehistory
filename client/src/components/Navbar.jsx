import React from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
            <div className="container flex items-center justify-between" style={{ padding: '0.75rem 2rem' }}>
                <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-3 no-underline">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                        <Activity size={20} />
                    </div>
                    <span className="text-xl font-semibold text-slate-900">OneHistory</span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link to="/about" className="nav-btn-about">
                        About
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 no-underline hover:bg-slate-50">
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
                        <Link to="/login" className="btn" style={{ fontSize: '0.9rem', minHeight: '38px', padding: '0.5rem 1rem' }}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
