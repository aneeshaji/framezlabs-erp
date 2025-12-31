import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, QrCode, User, Phone } from 'lucide-react';
import inventoryService, { Product } from '../services/inventory.service';
import posService, { TransactionItem, Transaction } from '../services/pos.service';
import customerService, { Customer } from '../services/customer.service';
import InvoiceModal from '../components/modals/InvoiceModal';

import clsx from 'clsx';

export default function POS() {
    const [products, setProducts] = useState<Product[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerResults, setShowCustomerResults] = useState(false);
    const [cart, setCart] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await customerService.getCustomers();
            setAllCustomers(data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await inventoryService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        if (product.stockLevel <= 0) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product._id);
            if (existingItem) {
                if (existingItem.quantity >= product.stockLevel) return prevCart;
                return prevCart.map(item =>
                    item.productId === product._id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                );
            }
            return [...prevCart, {
                productId: product._id!,
                name: product.name,
                quantity: 1,
                price: product.price,
                subtotal: product.price
            }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.productId === productId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    const product = products.find(p => p._id === productId);
                    if (product && newQty > product.stockLevel && delta > 0) return item;
                    return { ...item, quantity: newQty, subtotal: newQty * item.price };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        try {
            const result = await posService.createTransaction({
                items: cart,
                totalAmount: calculateTotal(),
                paymentMethod,
                customerName,
                customerPhone,
                tax: 0,
                discount: 0
            });
            setLastTransaction(result);
            setShowInvoice(true);
            setCart([]);
            setCustomerName('');
            setCustomerPhone('');
            fetchProducts(); // Refresh stock levels
            fetchCustomers(); // Refresh customer data (totalSpent might have changed)
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Checkout failed. Please check stock levels or try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 bg-gray-50 -m-6 p-6 overflow-hidden">
            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products by name or SKU... (Press Enter to add)"
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && filteredProducts.length === 1) {
                                addToCart(filteredProducts[0]);
                                setSearchTerm('');
                            }
                        }}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <button
                                    key={product._id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.stockLevel <= 0}
                                    className={clsx(
                                        "p-4 bg-white rounded-xl border transition-all text-left flex flex-col justify-between group h-40 shadow-sm hover:shadow-md",
                                        product.stockLevel <= 0
                                            ? "opacity-50 grayscale cursor-not-allowed border-gray-200"
                                            : "border-gray-100 hover:border-primary-500 hover:ring-1 hover:ring-primary-500"
                                    )}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-mono text-gray-400">{product.sku}</span>
                                            <span className={clsx(
                                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                                                product.stockLevel > 5 ? "bg-green-50 text-green-600" :
                                                    product.stockLevel > 0 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {product.stockLevel} in stock
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight">
                                            {product.name}
                                        </h3>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-black text-gray-900">₹{product.price.toLocaleString()}</span>
                                        <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-96 flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {/* Customer Details */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Customer Details
                    </h3>
                    <div className="grid grid-cols-1 gap-2 relative">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                value={customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setShowCustomerResults(true);
                                }}
                                onFocus={() => setShowCustomerResults(true)}
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                            {/* Autocomplete Results */}
                            {showCustomerResults && customerSearch.length >= 2 && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {allCustomers
                                        .filter(c =>
                                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                            c.phone.includes(customerSearch)
                                        )
                                        .map(customer => (
                                            <button
                                                key={customer._id}
                                                className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-0 flex flex-col"
                                                onClick={() => {
                                                    setCustomerName(customer.name);
                                                    setCustomerPhone(customer.phone);
                                                    setCustomerSearch('');
                                                    setShowCustomerResults(false);
                                                }}
                                            >
                                                <span className="font-bold text-gray-900 text-sm uppercase tracking-tight">{customer.name}</span>
                                                <span className="text-xs text-gray-500">{customer.phone}</span>
                                            </button>
                                        ))
                                    }
                                    {allCustomers.filter(c =>
                                        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                        c.phone.includes(customerSearch)
                                    ).length === 0 && (
                                            <div className="px-4 py-3 text-xs text-gray-400 italic">No customers found. Continue typing to add new.</div>
                                        )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Phone"
                                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:outline-none"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                />
                                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-900">Cart</h2>
                    </div>
                    <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {cart.length} Items
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <ShoppingCart className="w-16 h-16 opacity-10" />
                            <p className="text-lg font-medium">Cart is empty</p>
                            <p className="text-sm">Add products to start a sale</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex flex-col p-3 rounded-lg bg-gray-50 border border-gray-100 group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900 text-sm line-clamp-1 flex-1 pr-2">{item.name}</span>
                                    <button
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => updateQuantity(item.productId, -1)}
                                            className="p-1 rounded-md bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 text-gray-500 transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, 1)}
                                            className="p-1 rounded-md bg-white border border-gray-200 hover:border-primary-500 hover:text-primary-600 text-gray-500 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-400">@ ₹{item.price}</div>
                                        <div className="font-bold text-gray-900">₹{item.subtotal.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'Cash', icon: Banknote },
                                { id: 'Card', icon: CreditCard },
                                { id: 'UPI', icon: QrCode }
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={clsx(
                                        "flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all",
                                        paymentMethod === method.id
                                            ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-200"
                                            : "bg-white border-gray-200 text-gray-500 hover:border-primary-300"
                                    )}
                                >
                                    <method.icon className="w-5 h-5 mb-1" />
                                    {method.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 font-medium text-lg">Grand Total</span>
                            <span className="text-3xl font-black text-gray-900">₹{calculateTotal().toLocaleString()}</span>
                        </div>
                        <button
                            disabled={cart.length === 0 || submitting}
                            onClick={handleCheckout}
                            className={clsx(
                                "w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg",
                                cart.length === 0 || submitting
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-primary-600 text-white hover:bg-primary-700 active:scale-95 shadow-primary-200"
                            )}
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <ShoppingCart className="w-6 h-6" />
                                    Checkout
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {lastTransaction && (
                <InvoiceModal
                    transaction={lastTransaction}
                    isOpen={showInvoice}
                    onClose={() => {
                        setShowInvoice(false);
                        setLastTransaction(null);
                    }}
                />
            )}
        </div>
    );
}
