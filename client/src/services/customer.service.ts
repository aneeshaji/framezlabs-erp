import api from './api';

export interface Customer {
    _id?: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    totalSpent: number;
    orderCount: number;
    notes?: string;
    lastPurchaseDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

const customerService = {
    getCustomers: async (): Promise<Customer[]> => {
        const response = await api.get('/customers');
        return response.data;
    },

    getCustomer: async (id: string): Promise<Customer> => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },

    createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
        const response = await api.post('/customers', customerData);
        return response.data;
    },

    updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
        const response = await api.patch(`/customers/${id}`, customerData);
        return response.data;
    },

    deleteCustomer: async (id: string): Promise<void> => {
        await api.delete(`/customers/${id}`);
    }
};

export default customerService;
