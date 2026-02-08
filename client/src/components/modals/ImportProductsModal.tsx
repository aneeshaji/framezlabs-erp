import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import inventoryService from '../../services/inventory.service';

interface ImportProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportProductsModal({ isOpen, onClose, onSuccess }: ImportProductsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ message: string; errors?: any[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        const validTypes = ['text/csv', 'application/vnd.ms-excel'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
            setError('Invalid file type. Please upload a CSV file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit.');
            return;
        }

        setFile(file);
        setError(null);
        setResult(null);
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/templates/products-import-template.csv';
        link.download = 'products-import-template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setResult(null);

        try {
            const response = await inventoryService.importProducts(file);
            setResult({ message: response.message || 'Products imported successfully' });

            // Delay success callback slightly to let user see success message
            setTimeout(() => {
                onSuccess();
                // Don't close immediately, let user choose to close
            }, 1500);
        } catch (err: any) {
            console.error('Import failed:', err);
            if (err.response && err.response.data) {
                if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
                    setResult({
                        message: err.response.data.message || 'Validation failed',
                        errors: err.response.data.errors
                    });
                } else {
                    setError(err.response.data.message || 'Failed to import products');
                }
            } else {
                setError('Failed to connect to server');
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        Import Products
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Result Success */}
                    {result && !result.errors && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">{result.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Result Errors */}
                    {result && result.errors && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 max-h-60 overflow-y-auto">
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-medium mb-2">{result.message}</p>
                                <ul className="text-sm list-disc pl-4 space-y-1">
                                    {result.errors.map((err: any, idx: number) => (
                                        <li key={idx}>
                                            Row {err.row}: {err.errors.join(', ')}
                                            {err.values && <span className="text-xs block text-gray-500">Values: {JSON.stringify(err.values)}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* General Error */}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!result?.message || result?.errors ? (
                        <>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileSpreadsheet className="w-12 h-12 text-green-600" />
                                        <span className="font-medium text-gray-900">{file.name}</span>
                                        <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                setError(null);
                                                setResult(null);
                                            }}
                                            className="text-sm text-red-500 hover:text-red-700 hover:underline mt-2"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <Upload className="w-12 h-12 text-gray-300" />
                                        <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                                        <p className="text-sm">CSV files only (max 5MB)</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Need a template?</span>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Sample CSV
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading || !!(result?.message && !result.errors)}
                        className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 font-medium transition-colors ${!file || isUploading || (result?.message && !result.errors)
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            'Import Products'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
