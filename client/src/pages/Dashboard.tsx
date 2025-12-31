import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import inventoryService, { Product } from '../services/inventory.service';
import posService, { Transaction } from '../services/pos.service';
import { format, subDays, isSameDay } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Dashboard() {
    const { user } = useAuth();
    const isAdmin = user?.user?.role === 'ADMIN';

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [trxData, prodData] = await Promise.all([
                posService.getTransactions(),
                inventoryService.getProducts()
            ]);
            setTransactions(trxData);
            setProducts(prodData);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    // Metrics Calculation
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalProfit = transactions.reduce((sum, t) => sum + (t.profit || 0), 0);
    const lowStockCount = products.filter(p => p.stockLevel <= (p.minStockLevel || 5)).length;
    const totalOrders = transactions.length;

    // Sales Trend (Last 7 Days)
    const trendData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dailySales = transactions
            .filter(t => isSameDay(new Date(t.createdAt!), date))
            .reduce((sum, t) => sum + t.totalAmount, 0);
        return {
            name: format(date, 'EEE'), // Mon, Tue...
            sales: dailySales
        };
    });

    const stats = [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', protected: true },
        { label: 'Total Profit', value: `₹${totalProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', protected: true },
        { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Low Stock Items', value: lowStockCount.toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    ].filter(stat => !stat.protected || isAdmin);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium">Real-time overview of your business performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`${stat.bg} p-4 rounded-2xl`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend Chart - Admin Only */}
                {isAdmin && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Sales Trend (Last 7 Days)</h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#4F46E5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recent Orders Table - Full Width if not Admin */}
                <div className={clsx(
                    "bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col",
                    !isAdmin && "lg:col-span-2"
                )}>
                    <h3 className="text-lg font-black text-gray-900 mb-6">Recent Orders</h3>
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                <tr className="border-b border-gray-50">
                                    <th className="px-4 py-3 rounded-l-xl">Order ID</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3 text-right rounded-r-xl">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.slice(0, 5).map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 font-mono text-xs text-gray-500">#{t._id?.slice(-6).toUpperCase()}</td>
                                        <td className="px-4 py-4 font-bold text-gray-900">
                                            {t.customerName || 'Walk-in Customer'}
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-gray-900">₹{t.totalAmount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">No orders yet</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
