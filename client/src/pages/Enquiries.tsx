import { useState, useEffect } from 'react';
import { Search, Mail, Trash2, Filter, Eye, X, User, Phone, Calendar, Clock, Tag, MessageCircle } from 'lucide-react';
import enquiryService, { Enquiry } from '../services/enquiry.service';
import clsx from 'clsx';

export default function EnquiriesPage() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const data = await enquiryService.getEnquiries();
            setEnquiries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch enquiries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
        try {
            await enquiryService.deleteEnquiry(id);
            setEnquiries(enquiries.filter(e => e._id !== id));
            if (selectedEnquiry?._id === id) setSelectedEnquiry(null);
        } catch (error) {
            console.error('Failed to delete enquiry', error);
        }
    };

    const categories = ['All', ...new Set(enquiries.map(e => e.category).filter(Boolean))];

    const filteredEnquiries = enquiries.filter(e => {
        const name = (e.name || '').toLowerCase();
        const phone = (e.phone || '').toLowerCase();
        const message = (e.message || '').toLowerCase();
        const search = searchTerm.toLowerCase();

        const matchesSearch = name.includes(search) || phone.includes(search) || message.includes(search);
        const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Website Enquiries</h1>
                    <p className="text-gray-500 font-medium">Manage and review messages received from your website</p>
                </div>
            </div>

            {/* Summary Row - Matching Sales History */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Enquiries', value: enquiries.length, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Today', value: enquiries.filter(e => e.createdAt && new Date(e.createdAt).toDateString() === new Date().toDateString()).length, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                    {
                        label: 'Last 7 Days', value: enquiries.filter(e => {
                            if (!e.createdAt) return false;
                            const date = new Date(e.createdAt);
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            return date >= sevenDaysAgo;
                        }).length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50'
                    },
                    { label: 'Active Topics', value: categories.length - 1 < 0 ? 0 : categories.length - 1, icon: Tag, color: 'text-green-600', bg: 'bg-green-50' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={clsx("p-3 rounded-xl", stat.bg)}>
                            <stat.icon className={clsx("w-6 h-6", stat.color)} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Table Section - Matching Sales History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or message..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-700 transition-all shadow-sm focus:outline-none"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-20 text-gray-500 font-medium">Loading enquiries...</div>
                    ) : filteredEnquiries.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-gray-400">
                            <Mail className="w-16 h-16 opacity-10 mb-4" />
                            <p className="text-lg font-bold">No enquiries found</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-50">
                                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 italic-none">
                                {filteredEnquiries.map(enquiry => (
                                    <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold text-gray-400">#{enquiry._id?.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-900">{enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : '---'}</p>
                                                <p className="text-gray-400 text-xs">{enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 mr-3">
                                                    {(enquiry.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-bold text-gray-900 capitalize">{enquiry.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">{enquiry.phone || 'No Phone'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-500 uppercase">
                                            {enquiry.category || 'General'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                Received
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => setSelectedEnquiry(enquiry)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(enquiry._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* View Modal - Matching Sales/Transaction Modal style */}
            {selectedEnquiry && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="font-black text-gray-900 uppercase tracking-tight">Enquiry Details</h2>
                            <button
                                onClick={() => setSelectedEnquiry(null)}
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Customer</label>
                                    <div className="flex items-center gap-2 text-gray-900 font-bold p-2 bg-gray-50 rounded-xl">
                                        <User className="w-4 h-4 text-primary-500" />
                                        {selectedEnquiry.name || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone</label>
                                    <div className="flex items-center gap-2 text-gray-900 font-bold p-2 bg-gray-50 rounded-xl">
                                        <Phone className="w-4 h-4 text-primary-500" />
                                        {selectedEnquiry.phone || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                                    <div className="flex items-center gap-2 text-gray-700 font-bold p-2 bg-gray-50 rounded-xl">
                                        <Tag className="w-4 h-4 text-primary-500" />
                                        {selectedEnquiry.category || 'General'}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Received On</label>
                                    <div className="flex items-center gap-2 text-gray-700 font-bold p-2 bg-gray-50 rounded-xl">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                        {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Message</label>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[120px] font-medium shadow-inner">
                                    {selectedEnquiry.message || 'No message provided.'}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSelectedEnquiry(null)}
                                className="px-6 py-2.5 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all text-sm uppercase tracking-widest shadow-lg shadow-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
