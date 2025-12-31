import { forwardRef } from 'react';

interface CustomProductLabelProps {
    text: string;
    price: string;
    description: string;
    showLogo?: boolean;
}

const CustomProductLabel = forwardRef<HTMLDivElement, CustomProductLabelProps>(({ text, price, description, showLogo }, ref) => {
    return (
        <div
            ref={ref}
            className="flex flex-col items-center justify-center p-4 bg-white border-4 border-gray-900 rounded-xl shadow-none overflow-hidden relative box-border"
            style={{ width: '250px', height: '150px' }}
        >
            <div className="z-10 text-center w-full space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 line-clamp-1">{description || 'Product Description'}</p>

                <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight line-clamp-2 uppercase">
                    {text || 'Product Name'}
                </h2>

                <div className="pt-2 mt-2 border-t-2 border-gray-900 w-1/2 mx-auto">
                    <p className="text-2xl font-black text-gray-900 tracking-tighter">
                        ₹{price || '0'}
                    </p>
                </div>
            </div>

            <div className="absolute bottom-1 right-2">
                {showLogo ? (
                    <img src="/logo-icon.png" alt="FramezLabs" className="w-4 h-4 opacity-50 grayscale" />
                ) : (
                    <p className="text-[6px] font-bold uppercase text-gray-300">FramezLabs</p>
                )}
            </div>
        </div>
    );
});

CustomProductLabel.displayName = 'CustomProductLabel';

export default CustomProductLabel;
