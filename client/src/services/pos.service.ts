import api from './api';

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  _id?: string;
  items: TransactionItem[];
  totalAmount: number;
  profit?: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt?: string;
}

const createTransaction = async (transactionData: Partial<Transaction>): Promise<Transaction> => {
  const response = await api.post('/transactions', transactionData);
  return response.data;
};

const getTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get('/transactions');
  return response.data;
};

const posService = {
  createTransaction,
  getTransactions,
};

export default posService;
