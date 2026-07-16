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
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '0.5rem 0'
        }}>
            <div className="container" style={{ padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <Activity size={20} />
                    </div>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-main)',
                        letterSpacing: '-0.02em'
                    }}>
                        OneHistory
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link to="/about" className="nav-btn-about">
                        About
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link to="/profile" className="flex items-center gap-2" style={{
                                padding: '0.25rem 0.75rem 0.25rem 0.25rem',
                                borderRadius: '2rem',
                                background: 'rgba(255,255,255,0.4)',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s',
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}>
                                <div style={{
                                    width: '28px', height: '28px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    <User size={14} />
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {user.name}
                                </span>
                            </Link>
                            <button onClick={handleLogout} className="btn-outline" style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                padding: '0.4rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
