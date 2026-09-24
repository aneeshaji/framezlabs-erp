import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, ShoppingCart, Trash2, Plus, Minus,
    CreditCard, Banknote, QrCode, User, Phone,
    Tag, Truck, X, ChevronRight, CheckCircle2, Calendar,
} from 'lucide-react';
import inventoryService, { Product } from '../services/inventory.service';
import posService, { TransactionItem, Transaction } from '../services/pos.service';
import customerService, { Customer } from '../services/customer.service';
import InvoiceModal from '../components/modals/InvoiceModal';
import clsx from 'clsx';

const fmt = (n: number) => n.toLocaleString('en-IN');

export default function POS() {
    const [products, setProducts] = useState<Product[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cart, setCart] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState(0);
    const [shippingCharge, setShippingCharge] = useState(0);
    const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [isPaid, setIsPaid] = useState(true);

    const searchRef = useRef<HTMLInputElement>(null);
    const customerBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (customerBoxRef.current && !customerBoxRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchCustomers = async () => {
        try { setAllCustomers(await customerService.getCustomers()); }
        catch (e) { console.error('Failed to fetch customers', e); }
    };

    const fetchProducts = async () => {
        try { setProducts(await inventoryService.getProducts()); }
        catch (e) { console.error('Failed to fetch products', e); }
        finally { setLoading(false); }
    };

    const addToCart = useCallback((product: Product) => {
        if (product.stockLevel <= 0) return;
        setCart(prev => {
            const ex = prev.find(i => i.productId === product.id);
            if (ex) {
                if (ex.quantity >= product.stockLevel) return prev;
                return prev.map(i => i.productId === product.id
                    ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
                    : i);
            }
            return [...prev, {
                productId: product.id!,
                name: product.name,
                quantity: 1,
                price: Number(product.price),
                subtotal: Number(product.price),
            }];
        });
    }, []);

    const updateQty = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId !== productId) return item;
            const newQty = Math.max(1, item.quantity + delta);
            const prod = products.find(p => p.id === productId);
            if (prod && newQty > prod.stockLevel && delta > 0) return item;
            return { ...item, quantity: newQty, subtotal: newQty * item.price };
        }));
    };

    const removeFromCart = (productId: string) =>
        setCart(prev => prev.filter(i => i.productId !== productId));

    const subtotal = cart.reduce((s, i) => s + Number(i.subtotal), 0);
    const discountAmt = discountType === 'percentage'
        ? subtotal * (discountValue / 100)
        : Math.min(discountValue, subtotal);
    const total = Math.max(0, subtotal - discountAmt + Number(shippingCharge));

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);
        try {
            const result = await posService.createTransaction({
                items: cart,
                totalAmount: total,
                paymentMethod,
                customerName,
                customerPhone,
                tax: 0,
                discount: discountAmt,
                shippingAmount: Number(shippingCharge),
                saleDate,
                isPaid,
            });
            setLastTransaction(result);
            setShowInvoice(true);
            setCart([]);
            setCustomerName(''); setCustomerPhone(''); setCustomerSearch('');
            setDiscountType('percentage'); setDiscountValue(0); setShippingCharge(0);
            setSaleDate(new Date().toISOString().slice(0, 10));
            setIsPaid(true);
            fetchProducts(); fetchCustomers();
        } catch (e) {
            console.error('Checkout failed', e);
            alert('Checkout failed. Please try again.');
        } finally { setSubmitting(false); }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCustomers = allCustomers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    const selectCustomer = (c: Customer) => {
        setCustomerName(c.name);
        setCustomerPhone(c.phone);
        setCustomerSearch('');
        setDropdownOpen(false);
    };

    const clearCustomer = () => {
        setCustomerName(''); setCustomerPhone(''); setCustomerSearch('');
        setDropdownOpen(false);
    };

    const paymentMethods = [
        { id: 'Cash', icon: Banknote, activeClass: 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200' },
        { id: 'Card', icon: CreditCard, activeClass: 'bg-blue-500 border-blue-500 text-white shadow-blue-200' },
        { id: 'UPI', icon: QrCode, activeClass: 'bg-violet-500 border-violet-500 text-white shadow-violet-200' },
    ];

    return (
        <div className="flex gap-5 bg-gray-50 -m-6 p-5 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>

            {/* LEFT panel */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
                <div className="relative flex-shrink-0 mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search by name or SKU... (Enter to add first result)"
                        className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && filteredProducts.length >= 1) {
                                addToCart(filteredProducts[0]);
                                setSearchTerm('');
                            }
                        }}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-10 h-10 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                            <Search className="w-10 h-10 text-gray-200" />
                            <p className="text-sm font-medium">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-2">
                            {filteredProducts.map(product => {
                                const inCart = cart.find(i => i.productId === product.id);
                                const outOfStock = product.stockLevel <= 0;
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        disabled={outOfStock}
                                        className={clsx(
                                            'relative p-4 bg-white rounded-xl border text-left flex flex-col justify-between h-36 shadow-sm transition-all duration-150 group',
                                            outOfStock ? 'opacity-40 grayscale cursor-not-allowed border-gray-100'
                                                : inCart ? 'border-sky-400 ring-1 ring-sky-400 shadow-md'
                                                    : 'border-gray-100 hover:border-sky-300 hover:shadow-md cursor-pointer'
                                        )}
                                    >
                                        {inCart && (
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">x{inCart.quantity}</span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[10px] font-mono text-gray-300 block mb-1">{product.sku}</span>
                                            <h3 className={clsx('font-semibold text-sm leading-snug line-clamp-2 transition-colors',
                                                outOfStock ? 'text-gray-400' : 'text-gray-900 group-hover:text-sky-600'
                                            )}>{product.name}</h3>
                                        </div>
                                        <div className="flex items-end justify-between mt-2">
                                            <span className="text-base font-black text-gray-900">Rs.{fmt(Number(product.price))}</span>
                                            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                                                product.stockLevel > 5 ? 'bg-green-50 text-green-600'
                                                    : product.stockLevel > 0 ? 'bg-amber-50 text-amber-600'
                                                        : 'bg-red-50 text-red-500'
                                            )}>
                                                {outOfStock ? 'Out' : `${product.stockLevel} left`}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT panel */}
            <div className="w-[390px] flex-shrink-0 flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-sky-600" />
                        <span className="font-bold text-gray-800 text-sm">Checkout</span>
                    </div>
                    {cart.length > 0 && (
                        <span className="bg-sky-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            {cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {/* Customer */}
                <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-100">
                    {customerName ? (
                        <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate">{customerName}</p>
                                {customerPhone && <p className="text-xs text-gray-500 truncate">{customerPhone}</p>}
                            </div>
                            <button onClick={clearCustomer} className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div ref={customerBoxRef} className="relative">
                            <div className={clsx(
                                'flex items-center gap-2 border rounded-xl px-3 py-2 transition-all bg-gray-50',
                                dropdownOpen ? 'border-sky-400 ring-1 ring-sky-400 bg-white' : 'border-gray-200'
                            )}>
                                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Customer name or phone..."
                                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                                    value={customerSearch}
                                    onChange={e => {
                                        setCustomerSearch(e.target.value);
                                        setDropdownOpen(true);
                                    }}
                                    onFocus={() => setDropdownOpen(true)}
                                />
                                {customerSearch ? (
                                    <button onMouseDown={e => { e.preventDefault(); setCustomerSearch(''); setDropdownOpen(false); }} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                ) : (
                                    <Search className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                )}
                            </div>

                            {dropdownOpen && (
                                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(c => (
                                            <button
                                                key={c._id}
                                                onMouseDown={e => { e.preventDefault(); selectCustomer(c); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sky-50 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs flex-shrink-0">
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-center">
                                            <p className="text-sm text-gray-400 font-medium">No customers found</p>
                                        </div>
                                    )}
                                    {customerSearch.trim().length > 0 && (
                                        <button
                                            onMouseDown={e => {
                                                e.preventDefault();
                                                setCustomerName(customerSearch.trim());
                                                setCustomerSearch('');
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left bg-gray-50 hover:bg-sky-50 border-t border-gray-100 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full border-2 border-dashed border-sky-300 flex items-center justify-center text-sky-500 flex-shrink-0">
                                                <Plus className="w-3.5 h-3.5" />
                                            </div>
                                            <p className="text-sm font-semibold text-sky-600">Use "{customerSearch.trim()}" as name</p>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {customerName && !customerPhone && (
                        <div className="flex items-center gap-2 mt-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400 focus-within:bg-white transition-all">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <input type="text" placeholder="Phone (optional)" className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                        </div>
                    )}
                </div>

                {/* Cart items - CRITICAL: flex-1 min-h-0 */}
                <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                                <ShoppingCart className="w-8 h-8 text-gray-200" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-400">Cart is empty</p>
                                <p className="text-xs text-gray-300 mt-0.5">Click a product to add it</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {cart.map(item => (
                                <div key={item.productId} className="px-4 py-3 hover:bg-gray-50/60 transition-colors">
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className="flex-1 text-sm font-semibold text-gray-800 leading-snug">{item.name}</span>
                                        <button onClick={() => removeFromCart(item.productId)} className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                            <button onClick={() => updateQty(item.productId, -1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-sky-50 hover:text-sky-600 transition-colors border-r border-gray-200">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-9 text-center text-sm font-bold text-gray-900 select-none">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.productId, 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-sky-50 hover:text-sky-600 transition-colors border-l border-gray-200">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] text-gray-400">Rs.{fmt(Number(item.price))} x {item.quantity}</p>
                                            <p className="text-sm font-black text-gray-900">Rs.{fmt(Number(item.subtotal))}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3">

                    {/* Paid / Unpaid toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPaid(true)}
                            className={clsx(
                                'flex-1 py-2 rounded-xl text-xs font-black transition-all border-2',
                                isPaid
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500'
                            )}
                        >
                            ✓ PAID
                        </button>
                        <button
                            onClick={() => setIsPaid(false)}
                            className={clsx(
                                'flex-1 py-2 rounded-xl text-xs font-black transition-all border-2',
                                !isPaid
                                    ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-100'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
                            )}
                        >
                            ✗ UNPAID
                        </button>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {paymentMethods.map(m => (
                                <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                                    className={clsx('flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-xs font-bold transition-all duration-150 shadow-sm',
                                        paymentMethod === m.id ? m.activeClass : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    )}>
                                    <m.icon className="w-3.5 h-3.5" />{m.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sale Date */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Sale Date
                        </p>
                        <input
                            type="date"
                            value={saleDate}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={e => setSaleDate(e.target.value)}
                            className="w-full h-8 px-2.5 text-sm font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Discount</p>
                            <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-transparent h-8">
                                <input type="number" min="0" max={discountType === 'percentage' ? 100 : subtotal} value={discountValue || ''} placeholder="0"
                                    onChange={e => setDiscountValue(Math.max(0, Number(e.target.value)))}
                                    className="flex-1 min-w-0 px-2 text-sm font-semibold text-gray-800 bg-transparent outline-none" />
                                <div className="flex border-l border-gray-200 flex-shrink-0">
                                    <button onClick={() => setDiscountType('percentage')} className={clsx('w-8 text-xs font-bold transition-colors', discountType === 'percentage' ? 'bg-sky-500 text-white' : 'bg-white text-gray-400 hover:text-gray-700')}>%</button>
                                    <button onClick={() => setDiscountType('fixed')} className={clsx('w-8 text-xs font-bold border-l border-gray-200 transition-colors', discountType === 'fixed' ? 'bg-sky-500 text-white' : 'bg-white text-gray-400 hover:text-gray-700')}>Rs</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</p>
                            <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-transparent h-8">
                                <span className="pl-2 text-gray-400 text-xs font-bold flex-shrink-0">Rs</span>
                                <input type="number" min="0" placeholder="0" value={shippingCharge || ''} onChange={e => setShippingCharge(Math.max(0, Number(e.target.value)))} className="flex-1 px-1.5 text-sm font-semibold text-gray-800 bg-transparent outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="px-3 py-2 space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-700">Rs.{fmt(subtotal)}</span>
                            </div>
                            {discountValue > 0 && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                                        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                            {discountType === 'percentage' ? `${discountValue}%` : `Rs.${discountValue}`}
                                        </span> Discount
                                    </span>
                                    <span className="font-bold text-emerald-600">-Rs.{fmt(discountAmt)}</span>
                                </div>
                            )}
                            {Number(shippingCharge) > 0 && (
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-gray-700">+Rs.{fmt(Number(shippingCharge))}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 bg-gray-900">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total</span>
                            <span className="text-2xl font-black text-white tracking-tight">Rs.{fmt(total)}</span>
                        </div>
                    </div>

                    <button
                        disabled={cart.length === 0 || submitting}
                        onClick={handleCheckout}
                        className={clsx('w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2',
                            cart.length === 0 || submitting
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                                : 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md hover:from-sky-700 hover:to-sky-600 hover:shadow-lg active:scale-[0.98]'
                        )}
                    >
                        {submitting ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                        ) : cart.length === 0 ? (
                            <><ShoppingCart className="w-4 h-4" />Add items to checkout</>
                        ) : (
                            <><CheckCircle2 className="w-4 h-4" />Checkout . Rs.{fmt(total)}</>
                        )}
                    </button>
                </div>
            </div>

            {lastTransaction && (
                <InvoiceModal
                    transaction={lastTransaction}
                    isOpen={showInvoice}
                    onClose={() => { setShowInvoice(false); setLastTransaction(null); }}
                />
            )}
        </div>
    );
}
