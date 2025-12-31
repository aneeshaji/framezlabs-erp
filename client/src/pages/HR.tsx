import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Phone,
    Clock,
    MoreVertical,
    ChevronRight,
    BadgeCheck,
    AlertCircle,
    Building2
} from 'lucide-react';
import hrService, { Employee } from '../services/hr.service';
import AddEmployeeModal from '../components/hr/AddEmployeeModal';

export default function HR() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await hrService.getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.employeeId}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Staff Directory</h1>
                    <p className="text-gray-500 font-medium">Manage your team profiles, contact info, and employment status</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-100 transition-all active:scale-95 group"
                >
                    <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Onboard Employee
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Staff', value: employees.length, icon: Users, color: 'primary' },
                    { label: 'Active', value: employees.filter(e => e.status === 'ACTIVE').length, icon: BadgeCheck, color: 'emerald' },
                    { label: 'On Leave', value: employees.filter(e => e.status === 'ON_LEAVE').length, icon: Clock, color: 'blue' },
                    { label: 'Resigned', value: employees.filter(e => e.status === 'RESIGNED').length, icon: AlertCircle, color: 'rose' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or employee ID..."
                        className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 font-medium text-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                    {['ALL', 'ACTIVE', 'ON_LEAVE'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((emp) => (
                    <div key={emp._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                        <div className="p-8 space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-gray-100 group-hover:border-primary-100 transition-colors">
                                        <Users className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">{emp.firstName} {emp.lastName}</h3>
                                        <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">{emp.designation}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                        emp.status === 'ON_LEAVE' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {emp.status}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span>{emp.department} Dept.</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span className="truncate">{emp.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span>{emp.phone}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                                    <p className="text-xs font-black text-gray-700">{new Date(emp.dateOfJoining).toLocaleDateString()}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Emp ID</p>
                                    <p className="text-xs font-black text-gray-700">#{emp.employeeId}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button className="flex-1 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 group/btn">
                                    View Full Profile
                                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                                <button className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEmployees.length === 0 && (
                <div className="bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                        <Users className="w-10 h-10 text-gray-200" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900">No employees found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Try adjusting your search query or status filter to find the team members you're looking for.</p>
                    </div>
                </div>
            )}

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchEmployees}
            />
        </div>
    );
}
