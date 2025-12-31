import { forwardRef } from 'react';
import Barcode from 'react-barcode';

interface BarcodeLabelProps {
    product: {
        name: string;
        sku: string;
        price: number;
    };
}

const BarcodeLabel = forwardRef<HTMLDivElement, BarcodeLabelProps>(({ product }, ref) => {
    return (
        <div
            ref={ref}
            className="inline-block p-4 bg-white border border-gray-100 rounded-lg text-center"
            style={{ width: '250px', height: '150px' }}
        >
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-1 truncate px-2">
                {product.name}
            </h3>

            <div className="flex justify-center mb-1">
                <Barcode
                    value={product.sku}
                    width={1.2}
                    height={40}
                    fontSize={10}
                    margin={0}
                    background="transparent"
                />
            </div>

            <div className="flex justify-between items-center px-4 mt-1">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                    SKU: {product.sku}
                </span>
                <span className="text-xs font-black text-primary-600">
                    ₹{product.price.toLocaleString()}
                </span>
            </div>

            <div className="mt-2 text-[6px] font-black uppercase tracking-widest text-gray-300">
                FramezLabs / framezlabs.store
            </div>
        </div>
    );
});

BarcodeLabel.displayName = 'BarcodeLabel';

export default BarcodeLabel;
