import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, File, Download, Trash2, Eye, X } from 'lucide-react';
import api from '../api';
import { format } from 'date-fns';

const SecureImage = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // If src is already a data URL or blob, use it directly (e.g. from local preview)
        if (src.startsWith('data:') || src.startsWith('blob:')) {
            setImageSrc(src);
            setLoading(false);
            return;
        }

        const fetchImage = async () => {
            try {
                // Remove base URL if present to avoid double prefixing if we use relative paths
                const cleanSrc = src.replace(api.defaults.baseURL, '');
                const response = await api.get(cleanSrc, { responseType: 'blob' });

                if (isMounted) {
                    const url = URL.createObjectURL(response.data);
                    setImageSrc(url);
                }
            } catch (error) {
                console.error("Failed to load image", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            // Cleanup blob URL
            if (imageSrc && imageSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    if (loading) return <div className={`bg-slate-100 animate-pulse ${className}`} style={{ minHeight: '100px' }} />;
    if (!imageSrc) return <div className={`bg-slate-100 flex items-center justify-center text-slate-400 ${className}`} style={{ minHeight: '100px' }}><ImageIcon size={24} /></div>;

    return <img src={imageSrc} alt={alt} className={className} />;
};

const DocumentList = ({ caseId, refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, [caseId, refreshTrigger]);

    const fetchDocuments = async () => {
        try {
            console.log("Fetching documents for case:", caseId);
            const res = await api.get(`/documents/${caseId}`);
            console.log("Documents fetched:", res.data);
            setDocuments(res.data);
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        try {
            await api.delete(`/documents/${id}`);
            fetchDocuments();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const getIcon = (doc) => {
        if (doc.file_type === 'IMAGE') {
            return (
                <SecureImage
                    src={`/documents/file/${doc.file_path}`}
                    alt={doc.title}
                    className="w-full h-full object-cover"
                />
            );
        }
        switch (doc.file_type) {
            case 'PDF': return <FileText size={20} className="text-red-500" />;
            default: return <File size={20} className="text-slate-500" />;
        }
    };

    const handleDownload = async (filename, title) => {
        try {
            const response = await api.get(`/documents/file/${filename}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', title || filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Download failed", error);
            alert("Download failed");
        }
    };

    // Open in Modal
    const handlePreview = (doc) => {
        setPreviewDoc(doc);
    };

    if (loading) return <div className="p-4 text-center text-muted">Loading documents...</div>;

    if (documents.length === 0) {
        return <div className="p-4 text-center text-muted bg-slate-50 rounded border border-dashed">No documents uploaded yet.</div>;
    }

    return (
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
            {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border rounded transition-colors hover:bg-slate-50">
                    <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center border text-slate-500 overflow-hidden" style={{ minWidth: '2.5rem' }}>
                        {getIcon(doc)}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handlePreview(doc)}>
                        <div className="font-semibold text-slate-800 truncate hover:text-primary transition-colors" title={doc.title}>
                            {doc.title}
                        </div>
                        <div className="text-xs text-muted flex gap-2">
                            <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                            {doc.notes && <span className="truncate max-w-[200px]">• {doc.notes}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePreview(doc)}
                            className="btn btn-sm btn-ghost p-1 text-slate-500 hover:text-slate-900"
                            title="Preview"
                        >
                            <Eye size={16} />
                        </button>
                        <button
                            onClick={() => handleDownload(doc.file_path, doc.original_name)}
                            className="btn btn-sm btn-ghost p-1 text-slate-500 hover:text-emerald-700"
                            title="Download"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(doc.id)}
                            className="btn btn-sm btn-ghost p-1 text-slate-500 hover:text-red-600"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Preview Modal */}
            {previewDoc && (
                <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
                    <div className="modal-content animate-scale-in" style={{ maxWidth: '800px', width: '90%', padding: '1rem' }} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg truncate mr-4">{previewDoc.title}</h3>
                            <button onClick={() => setPreviewDoc(null)} className="btn btn-sm btn-ghost p-1">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="bg-slate-100 rounded overflow-hidden flex items-center justify-center p-2" style={{ minHeight: '300px', maxHeight: '70vh' }}>
                            {previewDoc.file_type === 'IMAGE' ? (
                                <SecureImage
                                    src={`/documents/file/${previewDoc.file_path}`}
                                    alt={previewDoc.title}
                                    className="max-w-full max-h-[70vh] object-contain"
                                />
                            ) : previewDoc.file_type === 'PDF' ? (
                                <div className="text-center p-8">
                                    <FileText size={48} className="mx-auto text-slate-400 mb-2" />
                                    <p className="text-muted mb-4">PDF Preview not supported inside secured modal.</p>
                                    <button
                                        onClick={() => handleDownload(previewDoc.file_path, previewDoc.original_name)}
                                        className="btn btn-primary"
                                    >
                                        Download to View
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <File size={48} className="mx-auto text-slate-400 mb-2" />
                                    <p className="text-muted">Preview not available for this file type.</p>
                                    <button
                                        onClick={() => handleDownload(previewDoc.file_path, previewDoc.original_name)}
                                        className="btn btn-primary mt-4"
                                    >
                                        Download to View
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentList;
