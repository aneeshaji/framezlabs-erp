import api from './api';

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  _id?: string;         // normalized from Laravel's numeric `id`
  id?: number | string; // raw Laravel id
  items: TransactionItem[];
  totalAmount: number;
  profit?: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  shippingAmount?: number;
  shipping_amount?: number;
  notes?: string;
  createdAt?: string;   // normalized from Laravel's `created_at`
  created_at?: string;  // raw Laravel timestamp
  saleDate?: string;    // user-selected sale date (YYYY-MM-DD)
  isPaid?: boolean;     // payment status — true = PAID, false = UNPAID
}

const createTransaction = async (transactionData: Partial<Transaction>): Promise<Transaction> => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

const getTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get('/transactions');
  const data = response.data;
  const list: Transaction[] = Array.isArray(data) ? data : (data?.data || []);

  // Normalize Laravel's field names to what the frontend expects:
  // `id` (integer) → `_id` (string), `created_at` → `createdAt`
  return list.map((t: any) => ({
    ...t,
    _id: t._id ?? String(t.id ?? ''),
    createdAt: t.createdAt ?? t.created_at ?? '',
  }));
};

const posService = {
  createTransaction,
  getTransactions,
};

export default posService;
