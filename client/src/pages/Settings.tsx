import { useState, useEffect } from 'react';
import {
    Store,
    Image as ImageIcon,
    MapPin,
    Phone,
    Mail,
    Globe,
    Hash,
    Type,
    Save,
    FileText,
    CheckCircle2
} from 'lucide-react';
import settingsService, { BusinessSettings } from '../services/settings.service';

export default function Settings() {
    const [settings, setSettings] = useState<BusinessSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setSaving(true);
        try {
            await settingsService.updateSettings(settings);
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 3000);
        } catch (error) {
            console.error('Failed to update settings', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Business Settings</h1>
                <p className="text-gray-500 font-medium">Configure your store's branding and invoice details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Store Identity */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                            <Store className="w-5 h-5 text-primary-600" /> Store Identity
                        </h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Store Name</label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-bold"
                                    value={settings?.storeName}
                                    onChange={e => setSettings(s => s ? { ...s, storeName: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Logo URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    placeholder="/logo.png"
                                    value={settings?.logoUrl}
                                    onChange={e => setSettings(s => s ? { ...s, logoUrl: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tagline</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    placeholder="Your custom frames destination"
                                    value={settings?.tagline}
                                    onChange={e => setSettings(s => s ? { ...s, tagline: e.target.value } : null)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                            <Phone className="w-5 h-5 text-primary-600" /> Contact Details
                        </h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    value={settings?.phone}
                                    onChange={e => setSettings(s => s ? { ...s, phone: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    value={settings?.email}
                                    onChange={e => setSettings(s => s ? { ...s, email: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Physical Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                                <textarea
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium resize-none"
                                    rows={3}
                                    value={settings?.address}
                                    onChange={e => setSettings(s => s ? { ...s, address: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Website URL</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="url"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    value={settings?.website}
                                    onChange={e => setSettings(s => s ? { ...s, website: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">GST Number</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    placeholder="27AAAAA0000A1Z5"
                                    value={settings?.gstNumber}
                                    onChange={e => setSettings(s => s ? { ...s, gstNumber: e.target.value } : null)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing & Defaults */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5 text-primary-600" /> Billing Config
                        </h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Invoice Prefix</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    value={settings?.invoicePrefix}
                                    onChange={e => setSettings(s => s ? { ...s, invoicePrefix: e.target.value } : null)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Currency Symbol</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium"
                                    value={settings?.currency}
                                    onChange={e => setSettings(s => s ? { ...s, currency: e.target.value } : null)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-md sticky bottom-6 z-10">
                    <div className="flex items-center gap-3">
                        {successMessage && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-left-4">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold text-sm">Settings Saved Successfully</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                Update Branding
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
