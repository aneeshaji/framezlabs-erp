import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    UserPlus,
    Phone,
    Mail,
    MapPin,
    TrendingUp,
    History,
    ChevronRight,
    Star,
    Edit3,
    Trash2
} from 'lucide-react';
import customerService, { Customer } from '../services/customer.service';
import CreateCustomerModal from '../components/crm/CreateCustomerModal';
import clsx from 'clsx';

export default function CRM() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await customerService.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    const stats = {
        totalCustomers: customers.length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        avgValue: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0,
        loyalCustomers: customers.filter(c => c.orderCount >= 5).length
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Customer Relationship Management</h1>
                    <p className="text-gray-500 font-medium">Manage and understand your client base</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    New Customer
                </button>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Clients', value: stats.totalCustomers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Lifetime Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Avg Client Value', value: `₹${Math.round(stats.avgValue).toLocaleString()}`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Loyal Clients', value: stats.loyalCustomers, icon: History, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
                                <Icon className={clsx("w-5 h-5", stat.color)} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Customer List */}
                <div className="flex-1 space-y-4">
                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search clients by name or phone..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="py-20 bg-white rounded-3xl border border-gray-100 text-center">
                                <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">No clients found</p>
                            </div>
                        ) : (
                            filteredCustomers.map(customer => (
                                <button
                                    key={customer._id}
                                    onClick={() => setSelectedCustomer(customer)}
                                    className={clsx(
                                        "w-full bg-white p-5 rounded-3xl border transition-all text-left flex items-center justify-between group",
                                        selectedCustomer?._id === customer._id
                                            ? "border-primary-500 ring-2 ring-primary-50 shadow-md"
                                            : "border-gray-100 hover:border-gray-200 shadow-sm"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-primary-600 font-black text-xl">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{customer.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{customer.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12">
                                        <div className="hidden md:block text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Spent</p>
                                            <p className="font-black text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                                        </div>
                                        <div className="hidden md:block text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p>
                                            <p className="font-black text-gray-900">{customer.orderCount}</p>
                                        </div>
                                        <ChevronRight className={clsx("w-5 h-5 transition-transform", selectedCustomer?._id === customer._id ? "translate-x-1 text-primary-600" : "text-gray-300")} />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Profile Detail Side Panel */}
                <div className="w-full lg:w-[400px]">
                    {selectedCustomer ? (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden sticky top-6 animate-in slide-in-from-right-10 duration-300">
                            <div className="h-32 bg-primary-600 relative">
                                <div className="absolute -bottom-12 left-8">
                                    <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                                        <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center text-primary-600 font-black text-4xl">
                                            {selectedCustomer.name.charAt(0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-16 p-8 space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedCustomer.name}</h2>
                                        <div className="flex gap-1">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Edit3 className="w-4 h-4" /></button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-rose-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-black uppercase tracking-widest">
                                        #{selectedCustomer._id?.slice(-8).toUpperCase()}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Phone className="w-4 h-4 text-gray-400" /></div>
                                        <span className="font-bold">{selectedCustomer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Mail className="w-4 h-4 text-gray-400" /></div>
                                        <span className="font-bold">{selectedCustomer.email || 'No email provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><MapPin className="w-4 h-4 text-gray-400" /></div>
                                        <span className="font-bold">{selectedCustomer.address || 'No address provided'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
                                        <p className="text-xl font-black text-gray-900">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders Count</p>
                                        <p className="text-xl font-black text-gray-900">{selectedCustomer.orderCount}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Internal Notes</h4>
                                    <p className="text-sm font-medium text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed italic">
                                        {selectedCustomer.notes || 'No notes added for this client yet.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                            <Users className="w-16 h-16 opacity-10 mb-4" />
                            <p className="font-bold">Select a client to view details</p>
                            <p className="text-xs max-w-[200px]">Understand buying patterns and manage relationships</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateCustomerModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCustomerCreated={fetchCustomers}
            />
        </div>
    );
}
