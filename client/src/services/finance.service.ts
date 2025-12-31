import api from './api';

export interface Expense {
    _id?: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    posRevenue: number;
    orderRevenue: number;
    totalExpenses: number;
    netProfit: number;
    expenseBreakdown: Record<string, number>;
}

const financeService = {
    getSummary: async (): Promise<FinancialSummary> => {
        const response = await api.get('/finance/summary');
        return response.data;
    },

    getExpenses: async (): Promise<Expense[]> => {
        const response = await api.get('/finance/expenses');
        return response.data;
    },

    createExpense: async (expense: Expense): Promise<Expense> => {
        const response = await api.post('/finance/expenses', expense);
        return response.data;
    },

    deleteExpense: async (id: string): Promise<void> => {
        await api.delete(`/finance/expenses/${id}`);
    }
};

export default financeService;
