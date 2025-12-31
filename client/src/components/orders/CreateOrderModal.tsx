import { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, Trash2, User, Phone } from 'lucide-react';
import inventoryService, { Product } from '../../services/inventory.service';
import orderService, { OrderStatus, OrderType } from '../../services/order.service';
import clsx from 'clsx';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderCreated: () => void;
}

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }: CreateOrderModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [orderType, setOrderType] = useState<OrderType>(OrderType.RETAIL);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            const data = await inventoryService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product === product._id);
            if (existing) {
                return prev.map(item =>
                    item.product === product._id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                );
            }
            return [...prev, {
                product: product._id,
                name: product.name,
                quantity: 1,
                price: product.price,
                subtotal: product.price
            }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty, subtotal: newQty * item.price };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product !== productId));
    };

    const calculateTotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setSubmitting(true);
        try {
            await orderService.createOrder({
                customerName,
                customerPhone,
                items: cart,
                totalAmount: calculateTotal(),
                status: OrderStatus.PENDING,
                orderType,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                notes,
                paymentMethod: 'Unpaid', // Default for orders
                isPaid: false
            });
            onOrderCreated();
            onClose();
            // Reset form
            setCart([]);
            setCustomerName('');
            setCustomerPhone('');
            setDueDate('');
            setNotes('');
        } catch (error) {
            console.error('Failed to create order', error);
            alert('Failed to create order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Create New Order</h2>
                        <p className="text-gray-500 text-sm font-medium">Record custom manufacturing or advance bookings</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left: Search & Select */}
                    <div className="flex-1 flex flex-col p-6 border-r border-gray-50 overflow-hidden">
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all group"
                                >
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 group-hover:text-primary-700">{product.name}</p>
                                        <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-gray-900">₹{product.price.toLocaleString()}</span>
                                        <div className="p-1.5 bg-gray-100 text-gray-400 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Order Details */}
                    <form onSubmit={handleSubmit} className="w-full md:w-[400px] flex flex-col p-6 bg-gray-50/50 overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            {/* Customer Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Information</h3>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Customer Name"
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Phone Number"
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Type & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Type</h3>
                                    <select
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={orderType}
                                        onChange={(e) => setOrderType(e.target.value as OrderType)}
                                    >
                                        <option value={OrderType.RETAIL}>Retail</option>
                                        <option value={OrderType.CUSTOM}>Custom</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</h3>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Cart Mini List */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items ({cart.length})</h3>
                                <div className="space-y-2">
                                    {cart.map(item => (
                                        <div key={item.product} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button type="button" onClick={() => updateQuantity(item.product, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><Minus className="w-3 h-3" /></button>
                                                <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.product, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><Plus className="w-3 h-3" /></button>
                                                <button type="button" onClick={() => removeFromCart(item.product)} className="p-1 hover:bg-gray-50 text-red-400 ml-1 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Requirements / Notes</h3>
                                <textarea
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary-500 outline-none h-24"
                                    placeholder="Add dimensions, specific frame types, or special instructions..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Footer / Submit */}
                        <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                            <div className="flex justify-between items-center text-gray-500 font-medium">
                                <span>Total Amount</span>
                                <span className="text-2xl font-black text-gray-900">₹{calculateTotal().toLocaleString()}</span>
                            </div>
                            <button
                                disabled={cart.length === 0 || submitting}
                                type="submit"
                                className={clsx(
                                    "w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95",
                                    cart.length === 0 || submitting
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-100"
                                )}
                            >
                                {submitting ? "Creating Order..." : "Create Order"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
