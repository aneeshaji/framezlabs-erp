import api from './api';

// Interface for Product data
export interface Product {
  id?: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  supplier?: string;
  price: number;
  costPrice: number;
  stockLevel: number;
  minStockLevel: number;
  status: 'Active' | 'Out of Stock' | 'Discontinued';
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  const data = response.data;
  return Array.isArray(data) ? data : (data?.data || []);
};

const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await api.post('/products', productData);
  return response.data;
};

const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, productData);
  return response.data;
};

const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

const importProducts = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const inventoryService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
};

export default inventoryService;
