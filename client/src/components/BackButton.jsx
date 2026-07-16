import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/dashboard')}
            className="group relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-300 hover:-translate-y-1 mb-8 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-2 rounded-xl bg-white/60 shadow-sm group-hover:scale-110 transition-transform text-primary">
                <ArrowLeft size={20} />
            </div>
            <span className="relative font-heading font-bold text-slate-700 tracking-tight">Go Back Home</span>
        </button>
    );
};

export default BackButton;
