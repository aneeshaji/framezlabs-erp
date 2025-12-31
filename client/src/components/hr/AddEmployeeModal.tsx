import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import hrService from '../../services/hr.service';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        dateOfBirth: '',
        address: '',
        salary: {
            base: 0,
            allowances: 0,
            currency: 'INR'
        }
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await hrService.createEmployee(formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to onboard employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="px-8 py-6 bg-primary-600 text-white flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight">Onboard New Employee</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                            Personal & Professional ID
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Employee ID</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                                    placeholder="EMP001"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Joining Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                                    value={formData.dateOfJoining}
                                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">First Name</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Last Name</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                            Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Phone</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Address</label>
                            <textarea
                                required
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium resize-none"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                            Role & Compensation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Department</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-black text-xs uppercase tracking-wider"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    <option value="SALES">Sales & Marketing</option>
                                    <option value="OPERATIONS">Operations</option>
                                    <option value="INVENTORY">Inventory</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="HR">Human Resources</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Designation</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-medium"
                                    placeholder="e.g. Sales Executive"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Base Salary</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                                    value={formData.salary.base}
                                    onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, base: Number(e.target.value) } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Allowances</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold"
                                    value={formData.salary.allowances}
                                    onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, allowances: Number(e.target.value) } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Onboarding'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
