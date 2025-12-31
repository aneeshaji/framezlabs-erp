import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Product } from '../../services/inventory.service';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Partial<Product>) => Promise<void>;
    onDelete?: () => Promise<void>;
    product?: Product;
}

export default function ProductModal({ isOpen, onClose, onSave, onDelete, product }: ProductModalProps) {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        sku: '',
        description: '',
        category: 'Frames',
        price: 0,
        costPrice: 0,
        stockLevel: 0,
        minStockLevel: 5,
        status: 'Active',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({
                name: '',
                sku: '',
                description: '',
                category: 'Frames',
                price: 0,
                costPrice: 0,
                stockLevel: 0,
                minStockLevel: 5,
                status: 'Active',
            });
        }
    }, [product, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save product', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <h3 className="text-lg leading-6 font-bold text-gray-900">
                                {product ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">SKU</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">Category</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Frames">Frames</option>
                                        <option value="Printing">Printing</option>
                                        <option value="Gift Items">Gift Items</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Supplier</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={formData.supplier || ''}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    placeholder="Optional"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">Cost Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.costPrice}
                                        onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">Selling Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">Stock Level</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.stockLevel}
                                        onChange={(e) => setFormData({ ...formData, stockLevel: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700">Low Stock Alert Level</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.minStockLevel}
                                        onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-3">
                                <div>
                                    {product && onDelete && (
                                        <button
                                            type="button"
                                            onClick={onDelete}
                                            className="inline-flex justify-center py-2 px-4 border border-red-200 shadow-sm text-sm font-bold rounded-lg text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Product
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 min-w-[100px]"
                                    >
                                        {submitting ? 'Saving...' : 'Save Product'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
