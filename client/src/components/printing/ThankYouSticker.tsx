import { forwardRef } from 'react';


const ThankYouSticker = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <div
            ref={ref}
            className="inline-flex flex-col items-center justify-center p-6 bg-white border-2 border-primary-600 rounded-[3rem] shadow-sm overflow-hidden relative"
            style={{ width: '300px', height: '300px' }}
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4F46E5 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative z-10 text-center space-y-4">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary-50/50 overflow-hidden">
                    <img src="/logo-icon.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>

                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Thank You!</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">For choosing FramezLabs</p>
                </div>

                <div className="pt-4 border-t border-gray-100 w-32 mx-auto">
                    <p className="text-[11px] font-bold text-gray-500 italic">Your support means the world to us.</p>
                </div>

                <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Share your joy</p>
                    <p className="text-[10px] font-bold text-primary-600">@framezlabs.store</p>
                </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-[6px] font-black uppercase tracking-[0.4em] text-gray-300">www.framezlabs.store</p>
            </div>
        </div>
    );
});

ThankYouSticker.displayName = 'ThankYouSticker';

export default ThankYouSticker;
