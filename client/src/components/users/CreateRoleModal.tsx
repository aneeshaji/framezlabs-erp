import React, { useState } from 'react';
import { X, ShieldPlus, Loader2, Link2, FileText } from 'lucide-react';
import userService from '../../services/user.service';

interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateRoleModal({ isOpen, onClose, onSuccess }: CreateRoleModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[]
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return setError('Role name is required');

        setLoading(true);
        setError('');
        try {
            await userService.createRole({
                ...formData,
                name: formData.name.toUpperCase() // Ensure roles are uppercase
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 bg-primary-600 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <ShieldPlus className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight">Create Custom Role</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Role Name</label>
                        <div className="relative group">
                            <ShieldPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                required
                                type="text"
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-black text-xs uppercase tracking-wider text-gray-900"
                                placeholder="e.g. SALES_HEAD"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Description</label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <textarea
                                required
                                rows={3}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 resize-none text-sm"
                                placeholder="Describe the purpose of this role..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
