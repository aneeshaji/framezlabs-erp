import { useState, useEffect } from 'react';
import {
    Users as UsersIcon,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Search,
    Edit3,
    UserPlus
} from 'lucide-react';
import userService, { User } from '../services/user.service';
import { useAuth } from '../context/AuthContext';
import CreateUserModal from '../components/users/CreateUserModal';
import EditUserModal from '../components/users/EditUserModal';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) return;
        setActionLoading(userId);
        try {
            await userService.deleteUser(userId);
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error) {
            console.error('Failed to delete user', error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN': return <ShieldAlert className="w-4 h-4 text-red-600" />;
            case 'MANAGER': return <ShieldCheck className="w-4 h-4 text-blue-600" />;
            default: return <Shield className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-50 text-red-700 border-red-100';
            case 'MANAGER': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 font-medium">Manage team access and permissions</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    New User
                </button>
            </div>

            {/* Stats & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <UsersIcon className="w-5 h-5 text-primary-600" />
                        <span className="font-bold text-gray-900">{users.length} Total Users</span>
                    </div>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm">
                                                {u.firstName[0]}{u.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs font-medium text-gray-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getRoleBadgeClass(u.role)}`}>
                                            {getRoleIcon(u.role)}
                                            {u.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-medium text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {u._id !== currentUser?.user?.id && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        disabled={actionLoading === u._id}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <CreateUserModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchUsers}
            />
            <EditUserModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSuccess={fetchUsers}
                user={selectedUser}
            />
        </div>
    );
}
