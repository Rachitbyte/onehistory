import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
            <ArrowLeft size={18} className="text-emerald-600" />
            <span>Go Back Home</span>
        </button>
    );
};

export default BackButton;
