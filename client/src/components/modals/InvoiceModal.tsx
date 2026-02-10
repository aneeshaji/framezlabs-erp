import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer } from 'lucide-react';
import { Transaction } from '../../services/pos.service';

interface InvoiceModalProps {
    transaction: Transaction;
    isOpen: boolean;
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, isOpen, onClose }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `Invoice_${transaction?._id?.slice(-8).toUpperCase() || 'NEW'}`,
    });

    if (!isOpen || !transaction) return null;

    const subtotal = transaction.items.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl min-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">

                {/* Header Actions */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-gray-100 flex items-center justify-between z-10 rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            Invoice #{transaction._id?.slice(-8).toUpperCase() || 'DRAFT'}
                        </h2>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                            Standard
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePrint()}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 transition-all text-sm shadow-lg shadow-primary-100"
                        >
                            <Printer className="w-4 h-4" />
                            Print Invoice
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Invoice Body */}
                <div className="p-8 md:p-12 overflow-y-auto flex-1 bg-gray-50/30">
                    <div
                        ref={contentRef}
                        className="bg-white mx-auto shadow-sm p-[12mm] w-[210mm] text-gray-800 font-sans relative"
                        id="printable-invoice"
                    >
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-48">
                                <img src="/logo.png" alt="FramezLabs Logo" className="w-32 h-auto" />
                            </div>
                            <div className="text-right max-w-xs">
                                <h2 className="text-xl font-bold text-gray-900 leading-none mb-2 uppercase">FramezLabs</h2>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    Karunagappally,<br />
                                    Kollam, Kerala 690573
                                </p>
                                <div className="mt-4 text-[10px] text-gray-400 space-y-1 font-bold uppercase tracking-wider">
                                    <p>Contact: +91 9995064344</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-0.5 bg-gray-100 w-full mb-4"></div>

                        {/* Invoice Meta */}
                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 border-b-2 border-gray-100 pb-1 w-24">Invoiced To</p>
                                <div className="text-sm">
                                    <p className="font-black text-gray-900 text-lg mb-0.5">{transaction.customerName || 'Walk-in Customer'}</p>
                                    <p className="font-bold text-gray-600">{transaction.customerPhone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 border-b-2 border-gray-100 pb-1 w-32 ml-auto text-right">Invoice Details</p>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-end gap-4">
                                        <span className="text-gray-400 font-bold uppercase text-[10px]">Date:</span>
                                        <span className="font-black text-gray-800">{new Date(transaction.createdAt || new Date()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <span className="text-gray-400 font-bold uppercase text-[10px]">Payment:</span>
                                        <span className="font-black text-primary-600 uppercase italic">{transaction.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-6">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-900 text-white">
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest w-12 rounded-tl-lg">#</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Description</th>
                                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest w-24">Qty</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest w-32">Unit Price</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest w-32 rounded-tr-lg">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 border-x border-b border-gray-100 rounded-b-lg overflow-hidden">
                                    {transaction.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 text-xs font-bold text-gray-400">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-black text-gray-900 text-sm tracking-tight">{item.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-700 text-sm">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-700 text-sm">₹{item.price.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-black text-gray-900 text-sm italic">₹{item.subtotal.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Calculations */}
                        <div className="flex justify-between items-start">
                            <div className="w-1/2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 border-b-2 border-gray-100 pb-1 w-24">Notes</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed italic">{transaction.notes || 'No additional notes provided.'}</p>
                                <div className="mt-8">
                                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.3em] mb-4">Authorized Signatory</p>
                                    <div className="w-48 h-0.5 bg-gray-100"></div>
                                </div>
                            </div>
                            <div className="w-80">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Sub Total</span>
                                        <span className="font-black text-gray-900 tracking-tight">₹{subtotal.toLocaleString()}.00</span>
                                    </div>
                                    {transaction.discount > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Discount</span>
                                            <span className="font-black text-red-500 tracking-tight">- ₹{transaction.discount.toLocaleString()}.00</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Tax (GST)</span>
                                        <span className="font-black text-gray-900 tracking-tight">₹{transaction.tax.toLocaleString()}.00</span>
                                    </div>
                                    <div className="pt-4 border-t-2 border-gray-900 flex justify-between items-center">
                                        <span className="font-black text-gray-900 uppercase tracking-widest text-sm">Total Amount</span>
                                        <span className="text-2xl font-black text-gray-900 tracking-tight ring-offset-4 ring-primary-50 rounded-lg p-1">₹{transaction.totalAmount.toLocaleString()}.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center border-t border-gray-50 pt-4">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                                Thank you for choosing FramezLabs
                            </p>
                            <p className="text-[9px] text-gray-300 font-medium italic">
                                All prices are inclusive of GST. This is a computer-generated invoice.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Global Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @media print {
            @page {
              size: A4;
              margin: 0mm;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #printable-invoice {
              margin: 0 !important;
              padding: 15mm !important;
              width: 210mm !important;
              height: 297mm !important;
              box-shadow: none !important;
              position: static !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />
            </div>
        </div>
    );
};

export default InvoiceModal;
