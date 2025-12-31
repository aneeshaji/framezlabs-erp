import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Plus,
    Trash2,
    Calendar,
    Tag,
    FileText,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Wallet
} from 'lucide-react';
import financeService, { Expense, FinancialSummary } from '../services/finance.service';
import clsx from 'clsx';

const CATEGORIES = [
    'Raw Materials',
    'Rent',
    'Utilities',
    'Salary',
    'Marketing',
    'Maintenance',
    'Other'
];

export default function Finance() {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Raw Materials',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [summaryData, expensesData] = await Promise.all([
                financeService.getSummary(),
                financeService.getExpenses()
            ]);
            setSummary(summaryData);
            setExpenses(expensesData);
        } catch (error) {
            console.error('Failed to fetch finance data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await financeService.createExpense({
                ...formData,
                amount: Number(formData.amount),
                date: new Date().toISOString()
            } as any);
            setShowAddModal(false);
            setFormData({ title: '', amount: '', category: 'Raw Materials', notes: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to add expense', error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await financeService.deleteExpense(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete expense', error);
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Finance</h1>
                    <p className="text-gray-500 font-medium">Manage your shop's health and overheads</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Record Expense
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Total Revenue',
                        value: summary?.totalRevenue || 0,
                        icon: TrendingUp,
                        color: 'text-green-600',
                        bg: 'bg-green-50',
                        detail: `POS: ${summary?.posRevenue?.toLocaleString() || '0'} | Orders: ${summary?.orderRevenue?.toLocaleString() || '0'}`
                    },
                    {
                        label: 'Total Expenses',
                        value: summary?.totalExpenses || 0,
                        icon: TrendingDown,
                        color: 'text-red-600',
                        bg: 'bg-red-50',
                        detail: 'All overheads & materials'
                    },
                    {
                        label: 'Net Profit',
                        value: summary?.netProfit || 0,
                        icon: Wallet,
                        color: 'text-primary-600',
                        bg: 'bg-primary-50',
                        detail: 'Real earnings after costs'
                    }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={clsx("p-3 rounded-2xl", stat.bg)}>
                                <stat.icon className={clsx("w-6 h-6", stat.color)} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lifetime</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900">{stat.value.toLocaleString()}</h3>
                            <p className="text-xs text-gray-400 mt-1 font-medium">{stat.detail}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-right">
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between text-left">
                            <h3 className="font-black text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" /> Recent Expenses
                            </h3>
                        </div>
                        <div className="overflow-x-auto text-left">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                                        <th className="px-6 py-4 text-left">Expense</th>
                                        <th className="px-6 py-4 text-left">Category</th>
                                        <th className="px-6 py-4 text-left">Date</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {expenses.map(expense => (
                                        <tr key={expense._id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{expense.title}</div>
                                                {expense.notes && <div className="text-xs text-gray-400 line-clamp-1">{expense.notes}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(expense.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-gray-900">
                                                {expense.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteExpense(expense._id!)}
                                                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No expenses recorded yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="font-black text-gray-900 flex items-center gap-2 mb-6">
                            <PieChart className="w-5 h-5 text-gray-400" /> Spending Breakdown
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(summary?.expenseBreakdown || {}).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                                <div key={cat} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-gray-700">{cat}</span>
                                        <span className="font-black text-gray-900">{amt.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary-600 h-full rounded-full"
                                            style={{ width: `${(amt / (summary?.totalExpenses || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {Object.keys(summary?.expenseBreakdown || {}).length === 0 && (
                                <p className="text-center text-gray-400 text-sm italic py-8">No categorization data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900">Record Expense</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddExpense} className="p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    placeholder="e.g., Shop Rent, Material Batch #04"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount ()</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Notes</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium resize-none"
                                    rows={3}
                                    placeholder="Optional details..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95 mt-4"
                            >
                                Save Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
