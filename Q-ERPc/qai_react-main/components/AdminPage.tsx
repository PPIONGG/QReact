import React, { useEffect, useState } from 'react';
import { Icons } from './Icon';
import { getRoles, getUsers, createRole, assignRole } from '../services/api';

interface AdminPageProps {
    onToggleSidebar: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onToggleSidebar }) => {
    const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
    const [roles, setRoles] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create Role Generic State
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (activeTab === 'roles') {
                const data = await getRoles();
                setRoles(data);
            } else {
                const [userData, roleData] = await Promise.all([getUsers(), getRoles()]);
                setUsers(userData);
                setRoles(roleData); // Need roles for assignment
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName) return;
        try {
            await createRole(newRoleName, newRoleDesc);
            setNewRoleName('');
            setNewRoleDesc('');
            loadData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAssignRole = async (userId: string, roleId: number) => {
        try {
            await assignRole(userId, roleId);
            loadData(); // Refresh to show new role
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-white rounded-2xl dark:bg-[#000C17] p-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    <Icons.Menu className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold text-[#B30000]">Admin Dashboard</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'roles' ? 'border-[#B30000] text-[#B30000]' : 'border-transparent hover:text-slate-600 dark:hover:text-slate-400'}`}
                >
                    Roles & Permissions
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'border-[#B30000] text-[#B30000]' : 'border-transparent hover:text-slate-600 dark:hover:text-slate-400'}`}
                >
                    User Management
                </button>
            </div>

            {error && (
                <div className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <>
                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            {/* Create Role */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold mb-4">Create New Role</h3>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Role Name</label>
                                        <input
                                            type="text"
                                            value={newRoleName}
                                            onChange={e => setNewRoleName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                            placeholder="e.g. key_user"
                                        />
                                    </div>
                                    <div className="flex-[2]">
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={newRoleDesc}
                                            onChange={e => setNewRoleDesc(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                                            placeholder="Description..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleCreateRole}
                                        className="px-4 py-2 bg-[#B30000] text-white rounded-lg hover:bg-red-800 transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>

                            {/* Roles List */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                                        <tr>
                                            <th className="p-4 border-b dark:border-slate-700">ID</th>
                                            <th className="p-4 border-b dark:border-slate-700">Name</th>
                                            <th className="p-4 border-b dark:border-slate-700">Description</th>
                                            <th className="p-4 border-b dark:border-slate-700">Functions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map(role => (
                                            <tr key={role.id} className="border-b last:border-0 dark:border-slate-700">
                                                <td className="p-4">{role.id}</td>
                                                <td className="p-4 font-medium">{role.name}</td>
                                                <td className="p-4 text-slate-500">{role.description}</td>
                                                <td className="p-4 text-sm text-slate-500">
                                                    {role.functions?.length || 0} functions
                                                </td>
                                            </tr>
                                        ))}
                                        {roles.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-6 text-center text-slate-400">No roles found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                                    <tr>
                                        <th className="p-4 border-b dark:border-slate-700">Username</th>
                                        <th className="p-4 border-b dark:border-slate-700">Email</th>
                                        <th className="p-4 border-b dark:border-slate-700">Roles</th>
                                        <th className="p-4 border-b dark:border-slate-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                            <td className="p-4 font-medium">{u.username}</td>
                                            <td className="p-4 text-slate-500">{u.email}</td>
                                            <td className="p-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {u.roles?.map((r: string) => (
                                                        <span key={r} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    onChange={(e) => handleAssignRole(u.id, parseInt(e.target.value))}
                                                    value=""
                                                    className="text-sm border rounded px-2 py-1 bg-transparent dark:border-slate-600"
                                                >
                                                    <option value="" disabled>Assign Role...</option>
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
