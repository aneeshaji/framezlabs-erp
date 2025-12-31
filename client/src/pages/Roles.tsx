import { useState, useEffect } from 'react';
import {
    Shield,
    ShieldAlert,

    Plus,
    Trash2,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Info,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users as UsersIcon,
    FileText,
    Settings as SettingsIcon,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import userService, { Role } from '../services/user.service';
import CreateRoleModal from '../components/users/CreateRoleModal';

const ALL_PERMISSIONS = [
    { id: 'dashboard.view', label: 'View Dashboard', icon: LayoutDashboard },
    { id: 'pos.access', label: 'Access POS', icon: CreditCard },
    { id: 'orders.manage', label: 'Manage Orders', icon: ShoppingCart },
    { id: 'inventory.view', label: 'View Inventory', icon: Package },
    { id: 'inventory.manage', label: 'Manage Inventory', icon: Package },
    { id: 'crm.manage', label: 'Manage CRM', icon: UsersIcon },
    { id: 'finance.view', label: 'View Finance', icon: FileText },
    { id: 'finance.manage', label: 'Manage Finance', icon: FileText },
    { id: 'settings.manage', label: 'System Settings', icon: SettingsIcon },
    { id: 'users.manage', label: 'User Roles', icon: Shield },
];

export default function Roles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await userService.getRoles();
            setRoles(data);
            if (data.length > 0 && !selectedRole) setSelectedRole(data[0]);
        } catch (error) {
            console.error('Failed to fetch roles', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePermission = (permId: string) => {
        if (!selectedRole || (selectedRole.isSystem && selectedRole.name === 'ADMIN')) return;

        const hasPerm = selectedRole.permissions.includes(permId);
        const newPermissions = hasPerm
            ? selectedRole.permissions.filter(p => p !== permId)
            : [...selectedRole.permissions, permId];

        setSelectedRole({ ...selectedRole, permissions: newPermissions });
    };

    const handleSave = async () => {
        if (!selectedRole || (selectedRole.isSystem && selectedRole.name === 'ADMIN')) return;
        setIsSaving(true);
        try {
            await userService.updateRole(selectedRole._id, {
                permissions: selectedRole.permissions,
                description: selectedRole.description
            });
            setRoles(roles.map(r => r._id === selectedRole._id ? selectedRole : r));
            alert('Role updated successfully!');
        } catch (error) {
            console.error('Failed to update role', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRole || selectedRole.isSystem) return;
        if (!confirm(`Are you sure you want to delete the ${selectedRole.name} role?`)) return;

        try {
            await userService.deleteRole(selectedRole._id);
            const updatedRoles = roles.filter(r => r._id !== selectedRole._id);
            setRoles(updatedRoles);
            setSelectedRole(updatedRoles[0] || null);
        } catch (error) {
            console.error('Failed to delete role', error);
            alert('Cannot delete role. It may be in use.');
        }
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Roles & Permissions</h1>
                <p className="text-gray-500 font-medium">Define exactly what your team can see and do</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Role List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Available Roles</label>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="p-1 hover:bg-white rounded-lg text-primary-600 transition-all active:scale-90 border border-transparent hover:border-primary-100"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    {roles.map(role => (
                        <button
                            key={role._id}
                            onClick={() => setSelectedRole(role)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${selectedRole?._id === role._id
                                ? 'bg-white border-primary-200 shadow-md ring-1 ring-primary-100'
                                : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${selectedRole?._id === role._id ? 'bg-primary-50 text-primary-600' : 'bg-white text-gray-400'
                                        }`}>
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{role.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{role.permissions.includes('*') ? 'All' : role.permissions.length} Permissions</p>
                                    </div>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedRole?._id === role._id ? 'text-primary-600 translate-x-1' : 'text-gray-300'}`} />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedRole ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black text-gray-900">{selectedRole.name}</h2>
                                        {selectedRole.isSystem && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-[8px] font-black uppercase tracking-widest text-gray-500 rounded-md">System Role</span>
                                        )}
                                    </div>
                                    <textarea
                                        disabled={selectedRole.name === 'ADMIN'}
                                        className="text-sm text-gray-500 font-medium bg-transparent border-none p-0 focus:ring-0 resize-none w-full"
                                        value={selectedRole.description}
                                        onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                                    />
                                </div>
                                {selectedRole.name !== 'ADMIN' && (
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-primary-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-50 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Configuration'}
                                    </button>
                                )}
                            </div>

                            <div className="p-8 space-y-8">
                                {selectedRole.name === 'ADMIN' ? (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                            <ShieldAlert className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">Administrator Role</h3>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto">This is a system-protected role with full access to all ERP modules. Permissions cannot be modified for this role.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {selectedRole.isSystem && (
                                            <div className="p-4 bg-blue-50/50 rounded-2xl flex items-center gap-3 text-blue-700 text-xs font-medium border border-blue-50">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                This is a core system role. You can modify its permissions but it cannot be deleted.
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ALL_PERMISSIONS.map(perm => {
                                                const Icon = perm.icon;
                                                const isActive = selectedRole.permissions.includes(perm.id) || selectedRole.permissions.includes('*');
                                                return (
                                                    <button
                                                        key={perm.id}
                                                        onClick={() => handleTogglePermission(perm.id)}
                                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${isActive
                                                            ? 'bg-primary-50/30 border-primary-100 text-primary-900 shadow-sm'
                                                            : 'bg-white border-gray-100 text-gray-400 opacity-60'
                                                            } hover:border-primary-200`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-50'}`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-bold">{perm.label}</span>
                                                        </div>
                                                        {isActive ? <CheckCircle2 className="w-5 h-5 text-primary-600" /> : <XCircle className="w-5 h-5 text-gray-200" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {!selectedRole.isSystem && (
                                    <div className="pt-8 border-t border-gray-50">
                                        <div className="bg-red-50/50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 border border-red-50">
                                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Danger Zone</p>
                                            <button
                                                onClick={handleDelete}
                                                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-700 shadow-lg shadow-red-50 transition-all active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete {selectedRole.name} Role
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-20 text-center space-y-4">
                            <Info className="w-12 h-12 text-gray-300" />
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Select a Role</h3>
                                <p className="text-sm text-gray-500 max-w-xs">Pick a role from the left to configure its access levels and specific system permissions.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CreateRoleModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchRoles}
            />
        </div>
    );
}
