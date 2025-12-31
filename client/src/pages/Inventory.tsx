import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Package, AlertCircle, Edit2, Trash2, Printer } from 'lucide-react';
import inventoryService, { Product } from '../services/inventory.service';
import ProductModal from '../components/inventory/ProductModal';
import BarcodeLabel from '../components/printing/BarcodeLabel';
import { useReactToPrint } from 'react-to-print';

export default function Inventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>();

    // For printing
    const [printProduct, setPrintProduct] = useState<Product | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Barcode_${printProduct?.sku || 'Label'}`,
        onAfterPrint: () => setPrintProduct(null),
    });

    useEffect(() => {
        if (printProduct) {
            handlePrint();
        }
    }, [printProduct, handlePrint]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await inventoryService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (productData: Partial<Product>) => {
        try {
            if (editingProduct?._id) {
                await inventoryService.updateProduct(editingProduct._id, productData);
            } else {
                await inventoryService.createProduct(productData);
            }
            fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save product', error);
            throw error; // Re-throw to handle in modal
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await inventoryService.deleteProduct(productId);
                fetchProducts();
                setIsModalOpen(false);
            } catch (error) {
                console.error('Failed to delete product', error);
                alert('Failed to delete product. Please try again.');
            }
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAddProduct = () => {
        setEditingProduct(undefined);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const skuMatch = product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesSearch = nameMatch || skuMatch;
        const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getStatusColor = (stock: number, minStock: number = 5) => {
        if (stock <= 0) return 'bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full text-[10px] uppercase';
        if (stock <= minStock) return 'bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded-full text-[10px] uppercase';
        return 'bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full text-[10px] uppercase';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory</h1>
                    <p className="text-gray-500 font-medium">Manage your product stock, categories, and pricing.</p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-100 transition-all active:scale-95 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    New Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-primary-50 rounded-2xl">
                        <Package className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Products</p>
                        <p className="text-2xl font-black text-gray-900">{products.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-amber-50 rounded-2xl">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Low Stock</p>
                        <p className="text-2xl font-black text-gray-900">
                            {products.filter(p => p.stockLevel > 0 && p.stockLevel <= (p.minStockLevel || 5)).length}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="p-4 bg-red-50 rounded-2xl">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Out of Stock</p>
                        <p className="text-2xl font-black text-gray-900">
                            {products.filter(p => p.stockLevel <= 0).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/30">
                    <div className="relative flex-1 group">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="bg-white pl-12 pr-4 py-3 border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-3 p-1.5 bg-gray-100 rounded-2xl">
                            <select
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-gray-500 focus:ring-0 cursor-pointer"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                <option value="Frames">Frames</option>
                                <option value="Printing">Printing</option>
                                <option value="Gift Items">Gift Items</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">SKU</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Price</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center space-y-4">
                                        <Package className="w-12 h-12 text-gray-200 mx-auto" />
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest">No products found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-[10px] text-gray-500 border border-gray-100">
                                                    {product.name?.[0] || 'P'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-black text-gray-900 uppercase tracking-tight">{product.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-mono font-bold text-gray-500">{product.sku}</td>
                                        <td className="px-8 py-5 text-sm font-black text-gray-900">₹{product.price.toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-700">{product.stockLevel} units</span>
                                                <span className={getStatusColor(product.stockLevel, product.minStockLevel)}>
                                                    {product.stockLevel <= 0 ? 'Out' : product.stockLevel <= (product.minStockLevel || 5) ? 'Low' : 'Stocked'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setPrintProduct(product)}
                                                    className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                    title="Print Barcode"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id!)}
                                                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                onDelete={editingProduct ? () => handleDeleteProduct(editingProduct._id!) : undefined}
                product={editingProduct}
            />

            {/* Hidden Printing Container */}
            <div className="hidden">
                <div ref={printRef}>
                    {printProduct && (
                        <div className="p-4 flex items-center justify-center min-h-screen">
                            <BarcodeLabel product={{
                                name: printProduct.name,
                                sku: printProduct.sku,
                                price: printProduct.price
                            }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
