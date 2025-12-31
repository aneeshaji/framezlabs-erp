import { useState, useEffect } from 'react';
import { Search, ReceiptText, Filter, ShoppingBag, Calendar, TrendingUp, Eye } from 'lucide-react';
import posService, { Transaction } from '../services/pos.service';
import InvoiceModal from '../components/modals/InvoiceModal';
import { useAuth } from '../context/AuthContext';

export default function SalesHistory() {
    const { user } = useAuth();
    const isAdmin = user?.user?.role === 'ADMIN';

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await posService.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleViewInvoice = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowInvoice(true);
    };

    const filteredTransactions = transactions.filter(t =>
        t._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerPhone?.includes(searchTerm)
    );

    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalProfit = filteredTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalOrders = filteredTransactions.length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales History</h1>
                    <p className="text-gray-500 font-medium">Monitor all past transactions and invoices</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <ReceiptText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
                            <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">₹{totalSales.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Profit</p>
                            <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">₹{totalProfit.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Orders</p>
                            <h3 className="text-2xl font-black text-gray-900 leading-none mt-1">{totalOrders}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, Customer Name or Phone..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-700 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 font-bold italic">Loading transactions...</div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-bold italic">No transactions found matching your search.</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest rounded-tl-2xl">Transaction ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                    {isAdmin && <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Profit</th>}
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest rounded-tr-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                                                #{transaction._id?.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-700">
                                                    {new Date(transaction.createdAt || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                    {new Date(transaction.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xs">
                                                    {(transaction.customerName || 'W').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{transaction.customerName || 'Walk-in Customer'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 tracking-tight">{transaction.customerPhone || 'Retail Sale'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm">
                                                <p className="font-black text-gray-900">₹{transaction.totalAmount.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-emerald-600">
                                                    {transaction.profit ? `+₹${transaction.profit.toLocaleString()}` : '-'}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {transaction.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewInvoice(transaction)}
                                                className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-xl transition-all"
                                                title="View Invoice"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedTransaction && (
                <InvoiceModal
                    transaction={selectedTransaction}
                    isOpen={showInvoice}
                    onClose={() => {
                        setShowInvoice(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}
        </div>
    );
}
