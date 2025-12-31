import { useState, useRef, useEffect } from 'react';
import { Printer, Heart, Layout, AlertCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ThankYouSticker from '../components/printing/ThankYouSticker';
import CustomProductLabel from '../components/printing/CustomProductLabel';
import clsx from 'clsx';

const TEMPLATES = [
    { id: 'thank-you', name: 'Thank You Sticker', icon: Heart, description: 'Circular premium branding sticker' },
    { id: 'product-label', name: 'Product Label', icon: Layout, description: 'Custom text and price label' },
];

export default function PrintCenter() {
    useEffect(() => {
        console.log('PrintCenter mounted');
    }, []);

    const [selectedTemplate, setSelectedTemplate] = useState('thank-you');
    const [quantity, setQuantity] = useState(6);
    const [isPrinting, setIsPrinting] = useState(false);

    // Custom Label State
    const [customText, setCustomText] = useState('');
    const [customPrice, setCustomPrice] = useState('');

    const [customDesc, setCustomDesc] = useState('');
    const [showLogo, setShowLogo] = useState(true);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Bulk_Printing_${selectedTemplate}`,
        onBeforePrint: () => {
            setIsPrinting(true);
            return Promise.resolve();
        },
        onAfterPrint: () => setIsPrinting(false),
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Print Center</h1>
                    <p className="text-gray-500 font-medium">Generate custom labels, stickers, and business materials.</p>
                </div>
                <button
                    onClick={() => handlePrint()}
                    disabled={isPrinting}
                    className="flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 active:scale-95 disabled:opacity-50"
                >
                    <Printer className="w-4 h-4" />
                    Print {quantity} Items
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Configuration Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Select Template</p>
                            <div className="space-y-2">
                                {TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => setSelectedTemplate(tmpl.id)}
                                        className={clsx(
                                            "w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                                            selectedTemplate === tmpl.id
                                                ? "border-primary-600 bg-primary-50/50"
                                                : "border-gray-50 hover:border-gray-200"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-2.5 rounded-xl transition-colors",
                                            selectedTemplate === tmpl.id ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                        )}>
                                            <tmpl.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={clsx("text-sm font-black uppercase tracking-tight", selectedTemplate === tmpl.id ? "text-primary-900" : "text-gray-900")}>{tmpl.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 leading-tight">{tmpl.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedTemplate === 'product-label' && (
                            <div className="space-y-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Label Details</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            value={customText}
                                            onChange={(e) => setCustomText(e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                                            placeholder="e.g. Vintage Frame"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={customPrice}
                                            onChange={(e) => setCustomPrice(e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                                            placeholder="e.g. 499"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={customDesc}
                                            onChange={(e) => setCustomDesc(e.target.value)}
                                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50"
                                            placeholder="e.g. 5x7 inch"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <label className="text-xs font-bold text-gray-700">Show Brand Logo</label>
                                        <button
                                            onClick={() => setShowLogo(!showLogo)}
                                            className={clsx(
                                                "w-10 h-6 rounded-full transition-colors relative",
                                                showLogo ? "bg-primary-600" : "bg-gray-200"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                                                showLogo ? "left-5" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Quantity</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 6, 12, 18].map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => setQuantity(q)}
                                        className={clsx(
                                            "py-2 rounded-xl text-xs font-black transition-all",
                                            quantity === q
                                                ? "bg-gray-900 text-white"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                            <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                                Tip: Ensure your printer is set to "Actual Size" and "Portrait" for best results.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-gray-100/50 rounded-[2.5rem] p-8 min-h-[600px] border-2 border-dashed border-gray-200 flex items-center justify-center overflow-auto">
                        <div className="bg-white shadow-2xl rounded-sm p-8 origin-top scale-75 xl:scale-100 transition-transform">
                            {/* The component that will be printed */}
                            <div ref={printRef} className="print-matrix">
                                <div className="grid grid-cols-2 gap-8 print:gap-4">
                                    {Array.from({ length: quantity }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-center p-4">
                                            {selectedTemplate === 'thank-you' ? (
                                                <ThankYouSticker />
                                            ) : (
                                                <CustomProductLabel
                                                    text={customText}
                                                    price={customPrice}
                                                    description={customDesc}
                                                    showLogo={showLogo}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Friendly Styles */}
            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: white !important;
                    }
                    .print-matrix {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
