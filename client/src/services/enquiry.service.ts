import api from './api';

export interface Enquiry {
    id: number;
    name: string;
    phone: string;
    message: string;
    category: string;
    created_at: string;
    updated_at: string;
}

const getEnquiries = async (): Promise<Enquiry[]> => {
    const response = await api.get('/enquiries');
    return response.data;
};

const getEnquiry = async (id: number): Promise<Enquiry> => {
    const response = await api.get(`/enquiries/${id}`);
    return response.data;
};

const deleteEnquiry = async (id: number): Promise<void> => {
    await api.delete(`/enquiries/${id}`);
};

const enquiryService = {
    getEnquiries,
    getEnquiry,
    deleteEnquiry,
};

export default enquiryService;
