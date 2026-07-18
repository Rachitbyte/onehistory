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

    const [patientCreds, setPatientCreds] = useState({ id: '', password: '' });
    const [providerCreds, setProviderCreds] = useState({ id: '', password: '', license: '' });
    const [selectedServices, setSelectedServices] = useState([]);

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

    const GoogleAuthBtn = () => (
        <button type="button" className="btn btn-outline w-full mt-4">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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
        <div className="min-h-screen flex bg-white text-slate-900">
            <aside className="hidden lg:flex w-[58%] bg-slate-950 text-white flex-col justify-center px-16 py-12">
                <div className="max-w-xl">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center">
                            <Activity size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-semibold">OneHistory</span>
                    </div>

                    <h1 className="text-5xl font-semibold leading-tight tracking-normal mb-6">
                        Modernizing Medical Records.
                    </h1>
                    <p className="text-lg text-slate-300 leading-8 mb-10">
                        Secure, unified, and instantly accessible patient history. Empowering providers and patients with triple-PIN security standards.
                    </p>

                    <div className="flex flex-col gap-3">
                        {['Universal Access Across Clinics', 'Military-Grade Triple-PIN Encryption', 'Real-time Immutable Audit Logs'].map((feature) => (
                            <div key={feature} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                <CheckCircle size={20} className="text-emerald-300" />
                                <span className="font-medium text-slate-100">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md animate-step-content">
                    {state === 'SUCCESS' ? (
                        <div className="text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                                <CheckCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Processing Request</h2>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-medium text-emerald-900">
                                Secure tunnel established. Establishing connection...
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
                                <p className="text-slate-500">Sign in or register your secure identifier</p>
                            </div>

                            {error && (
                                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="mb-8 flex rounded-xl bg-slate-100 p-1">
                                {['PATIENT', 'PROVIDER'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                            role === r ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <GoogleAuthBtn />

                            <div className="my-6 flex items-center text-slate-400">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="px-4 text-xs font-medium">or continue with</span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <form onSubmit={role === 'PATIENT' ? handlePatientSubmit : handleProviderSubmit} className="flex flex-col gap-4">
                                {role === 'PATIENT' && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-900">Patient ID</label>
                                            <input className="input" value={patientCreds.id} onChange={e => setPatientCreds({ ...patientCreds, id: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-900">Password / Triple-PIN</label>
                                            <input className="input" type="password" value={patientCreds.password} onChange={e => setPatientCreds({ ...patientCreds, password: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {role === 'PROVIDER' && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-900">Medical Identifier (ID / Email)</label>
                                            <input className="input" value={providerCreds.id} onChange={e => setProviderCreds({ ...providerCreds, id: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-900">Medical License Number</label>
                                            <input className="input" value={providerCreds.license} onChange={e => setProviderCreds({ ...providerCreds, license: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-900">Service Type</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Consultation', 'Laboratory', 'Pharmacy', 'Surgical'].map(srv => {
                                                    const isSelected = selectedServices.includes(srv);
                                                    return (
                                                        <button
                                                            key={srv}
                                                            type="button"
                                                            onClick={() => toggleService(srv)}
                                                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                                                                isSelected ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-700'
                                                            }`}
                                                        >
                                                            <input type="checkbox" checked={isSelected} readOnly className="accent-emerald-600" />
                                                            <span>{srv}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-slate-900">Password / Triple-PIN</label>
                                            <input className="input" type="password" value={providerCreds.password} onChange={e => setProviderCreds({ ...providerCreds, password: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                <button className="btn w-full mt-2">
                                    Proceed Securely
                                </button>
                            </form>

                            <div className="mt-8 text-center text-xs text-slate-400">
                                [ Demo Fillers ] &middot;
                                <button type="button" onClick={() => quickFill('PATIENT')} className="ml-1 underline">Patient</button>
                                {' | '}
                                <button type="button" onClick={() => quickFill('PROVIDER')} className="underline">Provider</button>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Login;
