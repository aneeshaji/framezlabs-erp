import { useState, useEffect, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import posService, { Transaction } from '../services/pos.service';
import inventoryService, { Product } from '../services/inventory.service';
import customerService, { Customer } from '../services/customer.service';
import clsx from 'clsx';

export default function Reports() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: subDays(new Date(), 30),
        end: new Date()
    });
    const [rangeLabel, setRangeLabel] = useState('Last 30 Days');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [trxData, prodData, custData] = await Promise.all([
                posService.getTransactions(),
                inventoryService.getProducts(),
                customerService.getCustomers()
            ]);
            setTransactions(trxData);
            setProducts(prodData);
            setCustomers(custData);
        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Data Processing ---

    // 1. Filter Data by Date Range
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (!t.createdAt) return false;
            const textDate = new Date(t.createdAt);
            return isWithinInterval(textDate, { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) });
        });
    }, [transactions, dateRange]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            if (!c.createdAt) return false;
            const textDate = new Date(c.createdAt);
            return isWithinInterval(textDate, { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) });
        });
    }, [customers, dateRange]);

    // 2. Summary Cards
    const summary = useMemo(() => {
        const revenue = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const profit = filteredTransactions.reduce((sum, t) => sum + (t.profit || 0), 0);
        const orders = filteredTransactions.length;
        const avgOrderValue = orders > 0 ? revenue / orders : 0;
        const newCustomers = filteredCustomers.length;

        return { revenue, profit, orders, avgOrderValue, newCustomers };
    }, [filteredTransactions, filteredCustomers]);

    // 3. Sales by Category (Pie Chart)
    const categoryData = useMemo(() => {
        const categoryMap: Record<string, number> = {};
        const productCategoryMap = new Map(products.map(p => [p._id, p.category]));

        // Fallback for products deleted or not found
        const UNKNOWN_CATEGORY = 'Uncategorized';

        filteredTransactions.forEach(t => {
            t.items.forEach(item => {
                const category = productCategoryMap.get(item.productId) || UNKNOWN_CATEGORY;
                categoryMap[category] = (categoryMap[category] || 0) + item.subtotal;
            });
        });

        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, products]);

    // 4. Top Selling Products (Bar Chart)
    const topProductsData = useMemo(() => {
        const productMap: Record<string, { name: string, value: number }> = {};

        filteredTransactions.forEach(t => {
            t.items.forEach(item => {
                if (!productMap[item.name]) {
                    productMap[item.name] = { name: item.name, value: 0 };
                }
                productMap[item.name].value += item.quantity;
            });
        });

        return Object.values(productMap)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredTransactions]);

    // 5. Daily Revenue (Line Chart) or Customer Growth
    const revenueTrendData = useMemo(() => {
        const days = Math.min(30, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 3600 * 24)));
        // If range is large, maybe group by week/month? For now, stick to daily for < 60 days

        const dataMap: Record<string, { revenue: number, profit: number }> = {};

        // Initialize map
        for (let i = 0; i <= days; i++) {
            const date = subDays(dateRange.end, days - i);
            dataMap[format(date, 'yyyy-MM-dd')] = { revenue: 0, profit: 0 };
        }

        filteredTransactions.forEach(t => {
            if (!t.createdAt) return;
            const dateStr = format(new Date(t.createdAt), 'yyyy-MM-dd');
            if (dataMap[dateStr]) {
                dataMap[dateStr].revenue += t.totalAmount;
                dataMap[dateStr].profit += (t.profit || 0);
            }
        });

        return Object.entries(dataMap).map(([date, values]) => ({
            date: format(new Date(date), 'MMM dd'),
            ...values
        }));
    }, [filteredTransactions, dateRange]);


    const handleRangeChange = (range: '7days' | '30days' | 'month') => {
        const end = new Date();
        let start = new Date();
        let label = '';

        switch (range) {
            case '7days':
                start = subDays(end, 7);
                label = 'Last 7 Days';
                break;
            case '30days':
                start = subDays(end, 30);
                label = 'Last 30 Days';
                break;
            case 'month':
                start = startOfMonth(end);
                endOfMonth(end); // Helper doesn't mutate, but we use 'end' which is today. 
                // Actually to show full 'This Month' context we usually want start of month to NOW.
                label = 'This Month';
                break;
        }
        setDateRange({ start, end });
        setRangeLabel(label);
    };

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-gray-500 font-medium">Insights for {rangeLabel} ({format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')})</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    <button
                        onClick={() => handleRangeChange('7days')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", rangeLabel === 'Last 7 Days' ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50")}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => handleRangeChange('30days')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", rangeLabel === 'Last 30 Days' ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50")}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => handleRangeChange('month')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all", rangeLabel === 'This Month' ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-50")}
                    >
                        This Month
                    </button>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4 text-green-600">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Revenue</p>
                    <p className="text-2xl font-black text-gray-900">₹{summary.revenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Profit</p>
                    <p className="text-2xl font-black text-gray-900">₹{summary.profit.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Orders</p>
                    <p className="text-2xl font-black text-gray-900">{summary.orders}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-4 text-purple-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">New Customers</p>
                    <p className="text-2xl font-black text-gray-900">{summary.newCustomers}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue & Profit Trend */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Financial Performance</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
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
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales by Category */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Sales by Category</h3>
                    <div className="flex-1 min-h-[300px] flex items-center justify-center">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                                    />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 italic">No sales data in this period</p>
                        )}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Top Selling Items (Qty)</h3>
                    <div className="flex-1 min-h-[300px]">
                        {topProductsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsData} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={100}
                                        tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" name="Quantity Sold" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 italic text-center">No sales data in this period</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
