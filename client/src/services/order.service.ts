import api from './api';

export enum OrderStatus {
    PENDING = 'PENDING',
    IN_PRODUCTION = 'IN_PRODUCTION',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum OrderType {
    RETAIL = 'RETAIL',
    CUSTOM = 'CUSTOM',
}

export interface OrderItem {
    product: string;
    name: string;
    quantity: number;
    price: number;
    customNotes?: string;
    subtotal: number;
}

export interface Order {
    _id?: string;
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    orderType: OrderType;
    dueDate?: string;
    notes?: string;
    paymentMethod: string;
    isPaid: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const orderService = {
    getOrders: async (): Promise<Order[]> => {
        const response = await api.get('/orders');
        return response.data;
    },

    getOrder: async (id: string): Promise<Order> => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (orderData: Partial<Order>): Promise<Order> => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    updateOrder: async (id: string, orderData: Partial<Order>): Promise<Order> => {
        const response = await api.patch(`/orders/${id}`, orderData);
        return response.data;
    },

    updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    deleteOrder: async (id: string): Promise<void> => {
        await api.delete(`/orders/${id}`);
    }
};

export default orderService;
