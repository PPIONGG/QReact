import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { getRoles } from '../services/api';

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface AssignRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (roleIds: number[]) => Promise<void>;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({ isOpen, onClose, onSave }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
            setSelectedRoleIds([]); // Reset selection on open
            setError(null);
        }
    }, [isOpen]);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const data = await getRoles({ include_inactive: false });
            setRoles(data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load roles");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRole = (roleId: number) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            await onSave(selectedRoleIds);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save roles");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-[#001529] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Roles</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Icons.Refresh className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="text-center p-4 text-slate-500">No roles available.</div>
                    ) : (
                        <div className="space-y-2">
                            {roles.map(role => (
                                <label
                                    key={role.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedRoleIds.includes(role.id)
                                        ? 'bg-red-50 dark:bg-red-900/10 border-[#B30000] dark:border-red-500'
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRoleIds.includes(role.id)}
                                        onChange={() => toggleRole(role.id)}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#B30000] focus:ring-[#B30000]"
                                    />
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{role.name}</div>
                                        {role.description && (
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{role.description}</div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#B30000] hover:bg-[#8a0000] rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving && <Icons.Refresh className="w-3.5 h-3.5 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
