import React, { useEffect, useState, useRef } from 'react';
import { Icons } from './Icon';
import { getDocuments, uploadDocument, deleteDocument, assignDocumentRoles } from '../services/api';
import { AssignRoleModal } from './AssignRoleModal';

interface KnowledgePageProps {
    onToggleSidebar: () => void;
}

export const KnowledgePage: React.FC<KnowledgePageProps> = ({ onToggleSidebar }) => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Role Assignment State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        setIsLoading(true);
        try {
            const res = await getDocuments();
            // The API returns { documents: [], total: ... } or just array based on endpoint? 
            // API Doc says: { documents: [ ... ] }
            setDocuments(res.documents || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        setIsUploading(true);
        setError(null);
        try {
            await uploadDocument(file);
            loadDocs();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await deleteDocument(id);
            loadDocs();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const openAssignRoleModal = (docId: number) => {
        setSelectedDocId(docId);
        setIsRoleModalOpen(true);
    };

    const handleSaveRoles = async (roleIds: number[]) => {
        if (selectedDocId === null) return;
        await assignDocumentRoles(selectedDocId, roleIds);
        // Optionally show success message or reload docs
        alert("Roles assigned successfully!");
    };

    return (
        <div className="flex-1 overflow-auto bg-white rounded-2xl dark:bg-[#000C17] p-8 text-slate-900 dark:text-slate-100">

            <AssignRoleModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                onSave={handleSaveRoles}
            />

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Icons.Menu className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#B30000]">Knowledge Base</h1>
                        <p className="text-slate-500 mt-1">Manage documents for RAG context</p>
                    </div>
                </div>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#B30000] text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
                    >
                        {isUploading ? (
                            <>
                                <Icons.Refresh className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Icons.Plus className="w-4 h-4" />
                                Upload PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm uppercase font-medium">
                        <tr>
                            <th className="p-4 border-b dark:border-slate-700">Filename</th>
                            <th className="p-4 border-b dark:border-slate-700">Size</th>
                            <th className="p-4 border-b dark:border-slate-700">Pages</th>
                            <th className="p-4 border-b dark:border-slate-700">Uploaded</th>
                            <th className="p-4 border-b dark:border-slate-700 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading documents...</td></tr>
                        ) : documents.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No documents found. Upload a PDF to get started.</td></tr>
                        ) : (
                            documents.map(doc => (
                                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4 font-medium flex items-center gap-2">
                                        <Icons.Book className="w-4 h-4 text-[#B30000]" />
                                        {doc.filename}
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td className="p-4 text-slate-500 text-sm">{doc.total_pages}</td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openAssignRoleModal(doc.id)}
                                            className="text-slate-500 hover:text-[#B30000] p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded flex items-center gap-1 text-sm font-medium transition-colors"
                                            title="Assign Role"
                                        >
                                            <Icons.User className="w-4 h-4" />
                                            Assign Role
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Icons.Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
