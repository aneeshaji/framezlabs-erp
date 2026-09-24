import { useState, useEffect, useRef } from 'react';
import { Search, ReceiptText, ShoppingBag, Calendar, TrendingUp, Eye, X, ChevronDown } from 'lucide-react';
import posService, { Transaction } from '../services/pos.service';
import InvoiceModal from '../components/modals/InvoiceModal';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

// ─── helpers ────────────────────────────────────────────────
const formatDate = (raw?: string) => {
    if (!raw) return { date: '—', time: '—' };
    const d = new Date(raw);
    if (isNaN(d.getTime())) return { date: '—', time: '—' };
    const date = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { date, time };
};

const formatId = (id?: string) => {
    if (!id) return 'N/A';
    if (/^\d+$/.test(id)) return `#${id.padStart(4, '0')}`;
    return `#${id.slice(-8).toUpperCase()}`;
};

const toYMD = (d: Date) => d.toISOString().slice(0, 10);   // "YYYY-MM-DD"
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

type Preset = 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'all' | 'custom';

const getPresetRange = (preset: Preset): { from: string; to: string } => {
    const now = new Date();
    switch (preset) {
        case 'today':
            return { from: toYMD(now), to: toYMD(now) };
        case 'yesterday': {
            const y = new Date(now); y.setDate(y.getDate() - 1);
            return { from: toYMD(y), to: toYMD(y) };
        }
        case 'week': {
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            return { from: toYMD(start), to: toYMD(now) };
        }
        case 'month':
            return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(now) };
        case 'last_month': {
            const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const last  = new Date(now.getFullYear(), now.getMonth(), 0);
            return { from: toYMD(first), to: toYMD(last) };
        }
        default:
            return { from: '', to: '' };
    }
};

const PRESETS: { key: Preset; label: string }[] = [
    { key: 'all',        label: 'All Time' },
    { key: 'today',      label: 'Today' },
    { key: 'yesterday',  label: 'Yesterday' },
    { key: 'week',       label: 'This Week' },
    { key: 'month',      label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'custom',     label: 'Custom Range' },
];

// ─── component ──────────────────────────────────────────────
export default function SalesHistory() {
    const { user } = useAuth();
    const isAdmin = user?.user?.role === 'ADMIN';

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // date filter
    const [preset, setPreset]     = useState<Preset>('month');
    const [dateFrom, setDateFrom] = useState(toYMD(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    const [dateTo, setDateTo]     = useState(toYMD(new Date()));
    const [showDropdown, setShowDropdown] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
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

    const applyPreset = (p: Preset) => {
        setPreset(p);
        if (p !== 'custom') {
            const range = getPresetRange(p);
            setDateFrom(range.from);
            setDateTo(range.to);
            setShowDropdown(false);
        }
    };

    // filter by date range + search
    const filteredTransactions = transactions.filter(t => {
        // date filter
        if (preset !== 'all' && (dateFrom || dateTo)) {
            const txDate = t.createdAt ? new Date(t.createdAt) : null;
            if (txDate && !isNaN(txDate.getTime())) {
                if (dateFrom && txDate < startOfDay(new Date(dateFrom))) return false;
                if (dateTo   && txDate > endOfDay(new Date(dateTo)))     return false;
            }
        }
        // search filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            return (
                t._id?.toLowerCase().includes(q) ||
                t.customerName?.toLowerCase().includes(q) ||
                t.customerPhone?.includes(searchTerm)
            );
        }
        return true;
    });

    const totalSales  = filteredTransactions.reduce((s, t) => s + Number(t.totalAmount), 0);
    const totalProfit = filteredTransactions.reduce((s, t) => s + Number(t.profit || 0), 0);
    const totalOrders = filteredTransactions.length;

    const activePresetLabel = PRESETS.find(p => p.key === preset)?.label ?? 'Filter';
    const hasDateFilter = preset !== 'all';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales History</h1>
                    <p className="text-gray-500 font-medium">Monitor all past transactions and invoices</p>
                </div>
            </div>

            {/* ── Date Filter Bar ───────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Filter by Date
                </span>

                {/* Preset quick buttons */}
                <div className="flex flex-wrap gap-2">
                    {PRESETS.filter(p => p.key !== 'custom').map(p => (
                        <button
                            key={p.key}
                            onClick={() => applyPreset(p.key)}
                            className={clsx(
                                'px-3 py-1.5 text-xs font-bold rounded-xl transition-all',
                                preset === p.key
                                    ? 'bg-sky-500 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-200 hidden md:block" />

                {/* Custom range inputs */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-semibold">From</span>
                    <input
                        type="date"
                        value={dateFrom}
                        max={dateTo || toYMD(new Date())}
                        onChange={e => { setDateFrom(e.target.value); setPreset('custom'); }}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 font-semibold">To</span>
                    <input
                        type="date"
                        value={dateTo}
                        min={dateFrom}
                        max={toYMD(new Date())}
                        onChange={e => { setDateTo(e.target.value); setPreset('custom'); }}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent cursor-pointer"
                    />
                    {hasDateFilter && (
                        <button
                            onClick={() => applyPreset('all')}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-bold px-2 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                            title="Clear date filter"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>

                {/* Active filter badge */}
                {hasDateFilter && (
                    <div className="ml-auto text-xs bg-sky-50 text-sky-600 font-bold px-3 py-1.5 rounded-xl border border-sky-100 whitespace-nowrap">
                        {activePresetLabel === 'Custom Range'
                            ? `${dateFrom || '...'} → ${dateTo || '...'}`
                            : activePresetLabel
                        }
                        {' '}· {totalOrders} results
                    </div>
                )}
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

            {/* Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, Customer Name or Phone..."
                        className="w-full pl-12 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 font-bold italic">Loading transactions...</div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 font-bold">No transactions found</p>
                            <p className="text-gray-300 text-sm mt-1">Try a different date range or search term</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                    {isAdmin && <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Profit</th>}
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {formatId(transaction._id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-bold text-gray-700">{formatDate(transaction.createdAt).date}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(transaction.createdAt).time}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                                                    {(transaction.customerName || 'W').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{transaction.customerName || 'Walk-in Customer'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400">{transaction.customerPhone || 'Retail Sale'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <p className="font-black text-gray-900">₹{Number(transaction.totalAmount).toLocaleString()}</p>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-emerald-600">
                                                    {transaction.profit ? `+₹${Number(transaction.profit).toLocaleString()}` : '—'}
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
                                                onClick={() => { setSelectedTransaction(transaction); setShowInvoice(true); }}
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
                    onClose={() => { setShowInvoice(false); setSelectedTransaction(null); }}
                />
            )}
        </div>
    );
}
