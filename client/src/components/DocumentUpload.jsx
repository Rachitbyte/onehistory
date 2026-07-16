import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const DocumentUpload = ({ caseId, onUploadSuccess, onCancel }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState({});
    const [notes, setNotes] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);

        // Generate previews for images
        selectedFiles.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, [file.name]: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('caseId', caseId);
        formData.append('notes', notes);

        if (user) {
            formData.append('uploaderId', user.id);
        }

        try {
            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadSuccess();
            setFiles([]);
            setPreviews({});
            setNotes('');
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed: " + (error.response?.data?.error || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/') && previews[file.name]) {
            return (
                <div className="w-8 h-8 rounded overflow-hidden border">
                    <img src={previews[file.name]} alt="Preview" className="w-full h-full object-cover" />
                </div>
            );
        }
        if (file.type.startsWith('image/')) return <ImageIcon size={20} />;
        if (file.type === 'application/pdf') return <FileText size={20} />;
        return <File size={20} />;
    };

    return (
        <div className="card mb-4 animate-fade-in">
            <h3 className="subheading mb-3">Upload Documents</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <div
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center gap-2 text-muted">
                        <Upload size={32} />
                        <span className="font-medium">Click to select files</span>
                        <span className="text-sm">Store Images, PDFs, or Docs</span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*,.pdf,.doc,.docx"
                        multiple
                    />
                </div>

                {files.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 border rounded">
                                <div className="text-slate-500">{getFileIcon(file)}</div>
                                <span className="flex-1 text-sm truncate">{file.name}</span>
                                <span className="text-xs text-muted">{Math.round(file.size / 1024)} KB</span>
                                <button type="button" onClick={() => removeFile(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div>
                    <label className="text-xs font-bold text-muted uppercase">Notes (Optional, applied to all)</label>
                    <textarea
                        className="input w-full p-2"
                        rows="2"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Add any context..."
                    />
                </div>

                <div className="flex gap-2 mt-1">
                    <button type="submit" className="btn btn-primary" disabled={isUploading || files.length === 0}>
                        {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline text-red-500 border-red-200 hover:bg-red-50"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DocumentUpload;
