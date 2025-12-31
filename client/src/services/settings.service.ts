import api from './api';

export interface BusinessSettings {
    storeName: string;
    logoUrl: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    gstNumber: string;
    invoicePrefix: string;
    currency: string;
    tagline: string;
}

const settingsService = {
    getSettings: async (): Promise<BusinessSettings> => {
        const response = await api.get('/settings');
        return response.data;
    },

    updateSettings: async (settings: Partial<BusinessSettings>): Promise<BusinessSettings> => {
        const response = await api.patch('/settings', settings);
        return response.data;
    }
};

export default settingsService;
