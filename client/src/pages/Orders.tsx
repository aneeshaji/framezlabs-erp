import { useState, useEffect } from 'react';
import {
    Search,
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertCircle,
    Truck,
    Timer,
    ChevronRight,
    Plus
} from 'lucide-react';
import orderService, { Order, OrderStatus } from '../services/order.service';
import CreateOrderModal from '../components/orders/CreateOrderModal';
import clsx from 'clsx';

const statusConfig: Record<OrderStatus, any> = {
    [OrderStatus.PENDING]: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
    [OrderStatus.IN_PRODUCTION]: { icon: Timer, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Production' },
    [OrderStatus.READY_FOR_PICKUP]: { icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Ready for Pickup' },
    [OrderStatus.DELIVERED]: { icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Delivered' },
    [OrderStatus.CANCELLED]: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Cancelled' },
};

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: OrderStatus) => {
        try {
            await orderService.updateStatus(id, newStatus);
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filteredOrders = orders.filter((order: Order) => {
        const matchesSearch =
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerPhone.includes(searchTerm);
        const matchesTab = activeTab === 'ALL' || order.status === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
                    <p className="text-gray-500 font-medium">Track your custom manufacturing and fulfillment workflow</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Custom Order
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'All Orders', value: orders.length, color: 'bg-gray-50 text-gray-600' },
                    { label: 'In Production', value: orders.filter((o: Order) => o.status === OrderStatus.IN_PRODUCTION).length, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Pending', value: orders.filter((o: Order) => o.status === OrderStatus.PENDING).length, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Completed', value: orders.filter((o: Order) => o.status === OrderStatus.DELIVERED).length, color: 'bg-emerald-50 text-emerald-600' },
                ].map((stat, idx) => (
                    <div key={idx} className={clsx("p-4 rounded-2xl border border-gray-100", stat.color)}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{stat.label}</p>
                        <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-wrap gap-2">
                    {['ALL', ...Object.values(OrderStatus)].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                activeTab === tab
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            )}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by customer name or phone..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-20 bg-white rounded-2xl border border-gray-100 text-center">
                        <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">No orders found matching your criteria</p>
                    </div>
                ) : (
                    filteredOrders.map((order: Order) => {
                        const config = statusConfig[order.status];
                        const StatusIcon = config.icon;

                        return (
                            <div key={order._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary-100 transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx("p-3 rounded-xl", config.bg)}>
                                            <StatusIcon className={clsx("w-6 h-6", config.color)} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-gray-900">{order.customerName}</h3>
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">
                                                    #{order._id?.slice(-6).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">{order.customerPhone}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-8 md:gap-12">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Type</p>
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider",
                                                order.orderType === 'CUSTOM' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                            )}>
                                                {order.orderType}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Due Date</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                            <p className="text-lg font-black text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id!, e.target.value as OrderStatus)}
                                                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                {Object.values(OrderStatus).map(s => (
                                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Mini-List */}
                                <div className="mt-6 pt-6 border-t border-gray-50 flex flex-wrap gap-4">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <span className="w-5 h-5 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-black text-primary-600">
                                                {item.quantity}
                                            </span>
                                            <span className="text-xs font-bold text-gray-700">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <CreateOrderModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onOrderCreated={fetchOrders}
            />
        </div>
    );
}
