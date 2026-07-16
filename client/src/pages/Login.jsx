import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [role, setRole] = useState('PATIENT'); // 'PATIENT' | 'PROVIDER'
    const [state, setState] = useState('FORM'); // 'FORM' | 'SUCCESS'
    const [error, setError] = useState('');
    
    // Patient Form State
    const [patientCreds, setPatientCreds] = useState({ id: '', password: '' });
    
    // Provider Form State
    const [providerCreds, setProviderCreds] = useState({ id: '', password: '', license: '' });
    const [selectedServices, setSelectedServices] = useState([]);
    
    // Demo quick fill maps
    const quickFill = (r) => {
        setRole(r === 'PROVIDER' ? 'PROVIDER' : 'PATIENT');
        if (r === 'PROVIDER') {
            setProviderCreds({ id: 'doctor-123', password: 'password', license: 'MD-12345' });
            setSelectedServices(['Consultation']);
        } else {
            setPatientCreds({ id: 'patient-123', password: 'password' });
        }
    };

    const handlePatientSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(patientCreds.id, patientCreds.password);
        if (res.success) {
            setState('SUCCESS');
            setTimeout(() => navigate('/dashboard'), 1500);
        } else {
            setError(res.error);
        }
    };

    const handleProviderSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = await login(providerCreds.id, providerCreds.password);
        if (res.success) {
            setState('SUCCESS');
            setTimeout(() => navigate('/dashboard'), 1500);
        } else {
            setError(res.error);
        }
    };

    // Google Auth Button
    const GoogleAuthBtn = () => (
        <button type="button" className="flex justify-center items-center gap-2 w-full mt-4" style={{
            padding: '16px',
            border: '2px solid var(--slate-200)',
            borderRadius: '12px',
            fontWeight: 700,
            background: 'white',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            color: 'var(--slate-900)'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--slate-50)';
            e.currentTarget.querySelector('svg').style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.querySelector('svg').style.transform = 'scale(1)';
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            <svg viewBox="0 0 24 24" width="20" height="20" style={{ transition: 'transform 0.3s' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
        </button>
    );

    const toggleService = (service) => {
        if (selectedServices.includes(service)) {
            setSelectedServices(selectedServices.filter(s => s !== service));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', background: 'white', color: 'var(--slate-900)' }}>
            
            {/* Branding Sidebar (60%) */}
            <div className="hidden lg-flex" style={{
                width: '60%', 
                background: 'var(--emerald-dark)',
                position: 'relative',
                overflow: 'hidden',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',
                color: 'white'
            }}>
                {/* Abstract Circular Gradients */}
                <div style={{
                    position: 'absolute', top: '-10%', left: '-10%',
                    width: '500px', height: '500px',
                    background: 'var(--emerald-primary)', borderRadius: '50%',
                    filter: 'blur(100px)', opacity: 0.2
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '-10%',
                    width: '600px', height: '600px',
                    background: '#075985', borderRadius: '50%',
                    filter: 'blur(100px)', opacity: 0.2
                }} />

                <div style={{ maxWidth: '560px', zIndex: 10, width: '100%' }}>
                    {/* Logo Lockup */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                        <div style={{
                            width: '3rem', height: '3rem', 
                            background: 'white', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--emerald-primary)',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}>
                            <Activity size={24} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>OneHistory</span>
                    </div>

                    <h1 style={{ fontSize: '3.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
                        Modernizing Medical Records.
                    </h1>
                    
                    <p style={{ fontSize: '1.125rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '3rem', fontFamily: 'var(--font-body)' }}>
                        Secure, unified, and instantly accessible patient history. Empowering providers and patients with triple-PIN security standards.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {['Universal Access Across Clinics', 'Military-Grade Triple-PIN Encryption', 'Real-time Immutable Audit Logs'].map((feature, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(4px)',
                                padding: '1rem 1.5rem',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <CheckCircle size={20} color="var(--emerald-light)" />
                                <span style={{ fontWeight: 500, fontFamily: 'var(--font-body)' }}>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Functional Area (40% Desktop, 100% Mobile) */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative'
            }}>
                <div style={{ width: '100%', maxWidth: '448px' }} className="animate-step-content">
                    
                    {state === 'SUCCESS' ? (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '80px', height: '80px',
                                background: 'var(--emerald-light)', color: 'var(--emerald-primary)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <CheckCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--slate-900)', marginBottom: '1rem' }}>Processing Request</h2>
                            
                            <div style={{
                                background: '#f0fdf4', color: '#166534',
                                padding: '1rem 1.5rem', borderRadius: '12px',
                                fontSize: '0.95rem', fontWeight: 500,
                                marginTop: '1rem',
                                border: '1px solid #bbf7d0'
                            }}>
                                Secure tunnel established. Establishing connection...
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--slate-900)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontFamily: 'var(--font-body)' }}>Sign in or register your secure identifier</p>
                            </div>

                            {error && (
                                <div style={{
                                    background: '#fee2e2', color: '#dc2626',
                                    padding: '1rem', borderRadius: '12px',
                                    fontSize: '0.9rem', textAlign: 'center',
                                    marginBottom: '1.5rem', fontWeight: 500,
                                    border: '1px solid #fecaca'
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Role Switcher */}
                            <div style={{
                                background: '#f1f5f9',
                                padding: '4px',
                                borderRadius: '12px',
                                display: 'flex',
                                marginBottom: '2rem'
                            }}>
                                {['PATIENT', 'PROVIDER'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            background: role === r ? 'white' : 'transparent',
                                            color: role === r ? 'var(--emerald-primary)' : '#64748b',
                                            boxShadow: role === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <GoogleAuthBtn />

                            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#94a3b8' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--slate-200)' }}></div>
                                <span style={{ padding: '0 1rem', fontSize: '0.85rem', fontWeight: 500 }}>or continue with</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--slate-200)' }}></div>
                            </div>

                            {/* Dynamic Forms */}
                            <form onSubmit={role === 'PATIENT' ? handlePatientSubmit : handleProviderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                
                                {role === 'PATIENT' && (
                                    <>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-900)', display: 'block', marginBottom: '0.5rem' }}>Patient ID</label>
                                            <input 
                                                style={{ width: '100%', height: '44px', padding: '12px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                                value={patientCreds.id}
                                                onChange={e => setPatientCreds({...patientCreds, id: e.target.value})}
                                                onFocus={e => e.target.style.borderColor = 'var(--emerald-primary)'}
                                                onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-900)', display: 'block', marginBottom: '0.5rem' }}>Password / Triple-PIN</label>
                                            <input 
                                                type="password"
                                                style={{ width: '100%', height: '44px', padding: '12px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                                value={patientCreds.password}
                                                onChange={e => setPatientCreds({...patientCreds, password: e.target.value})}
                                                onFocus={e => e.target.style.borderColor = 'var(--emerald-primary)'}
                                                onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                                            />
                                        </div>
                                    </>
                                )}

                                {role === 'PROVIDER' && (
                                    <>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-900)', display: 'block', marginBottom: '0.5rem' }}>Medical Identifier (ID / Email)</label>
                                            <input 
                                                style={{ width: '100%', height: '44px', padding: '12px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                                value={providerCreds.id}
                                                onChange={e => setProviderCreds({...providerCreds, id: e.target.value})}
                                                onFocus={e => e.target.style.borderColor = 'var(--emerald-primary)'}
                                                onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-900)', display: 'block', marginBottom: '0.5rem' }}>Medical License Number</label>
                                            <input 
                                                style={{ width: '100%', height: '44px', padding: '12px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                                value={providerCreds.license}
                                                onChange={e => setProviderCreds({...providerCreds, license: e.target.value})}
                                                onFocus={e => e.target.style.borderColor = 'var(--emerald-primary)'}
                                                onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                                            />
                                        </div>
                                        
                                        {/* Service Type Selector Grid */}
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-900)', display: 'block', marginBottom: '0.5rem' }}>Service Type</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                {['Consultation', 'Laboratory', 'Pharmacy', 'Surgical'].map(srv => {
                                                    const isSelected = selectedServices.includes(srv);
                                                    return (
                                                        <div 
                                                            key={srv}
                                                            onClick={() => toggleService(srv)}
                                                            style={{
                                                                padding: '8px',
                                                                background: isSelected ? 'var(--emerald-light)' : 'var(--slate-50)',
                                                                borderRadius: '8px',
                                                                border: isSelected ? '1px solid var(--emerald-primary)' : '1px solid var(--slate-200)',
                                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                color: isSelected ? 'var(--emerald-dark)' : 'var(--slate-900)'
                                                            }}
                                                        >
                                                            <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--emerald-primary)', cursor: 'pointer' }} />
                                                            <span style={{ fontSize: '12px', fontWeight: 500 }}>{srv}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-900)', display: 'block', marginBottom: '0.5rem', marginTop: '0.5rem' }}>Password / Triple-PIN</label>
                                            <input 
                                                type="password"
                                                style={{ width: '100%', height: '44px', padding: '12px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '12px', fontSize: '1rem', outline: 'none' }}
                                                value={providerCreds.password}
                                                onChange={e => setProviderCreds({...providerCreds, password: e.target.value})}
                                                onFocus={e => e.target.style.borderColor = 'var(--emerald-primary)'}
                                                onBlur={e => e.target.style.borderColor = 'var(--slate-200)'}
                                            />
                                        </div>
                                    </>
                                )}

                                <button 
                                    className="w-full mt-4" 
                                    style={{
                                        background: 'var(--emerald-primary)',
                                        color: 'white',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 10px 20px -5px rgba(5, 150, 105, 0.4)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Proceed Securely
                                </button>
                            </form>
                            
                            {/* DEMO QUICK FILL HELPER (optional convenience) */}
                            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--slate-900)', fontSize: '0.8rem', opacity: 0.5 }}>
                                [ Demo Fillers ] &middot;
                                <button type="button" onClick={() => quickFill('PATIENT')} style={{background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline', marginLeft: '4px'}}>Patient</button> | 
                                <button type="button" onClick={() => quickFill('PROVIDER')} style={{background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline'}}>Provider</button>
                            </div>

                        </>
                    )}
                </div>
            </div>
            
            <style>{`
                @media (min-width: 1024px) {
                    .lg-flex { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
