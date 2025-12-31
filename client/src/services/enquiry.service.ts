import api from './api';

export interface Enquiry {
    _id: string;
    name: string;
    phone: string;
    message: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

const getEnquiries = async (): Promise<Enquiry[]> => {
    const response = await api.get('/enquiries');
    return response.data;
};

const getEnquiry = async (id: string): Promise<Enquiry> => {
    const response = await api.get(`/enquiries/${id}`);
    return response.data;
};

const deleteEnquiry = async (id: string): Promise<void> => {
    await api.delete(`/enquiries/${id}`);
};

const enquiryService = {
    getEnquiries,
    getEnquiry,
    deleteEnquiry,
};

export default enquiryService;
