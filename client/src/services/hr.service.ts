import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

export interface Employee {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    dateOfJoining: string;
    status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';
    user?: any;
}

export interface Attendance {
    _id: string;
    employee: string | Employee;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE' | 'HALF_DAY';
    note?: string;
}

const hrService = {
    // Employees
    getEmployees: async () => {
        const response = await axios.get(`${API_URL}/hr/employees`);
        return response.data;
    },

    createEmployee: async (data: any) => {
        const response = await axios.post(`${API_URL}/hr/employees`, data);
        return response.data;
    },

    updateEmployee: async (id: string, data: any) => {
        const response = await axios.patch(`${API_URL}/hr/employees/${id}`, data);
        return response.data;
    },

    deleteEmployee: async (id: string) => {
        const response = await axios.delete(`${API_URL}/hr/employees/${id}`);
        return response.data;
    },

    // Attendance
    logAttendance: async (data: any) => {
        const response = await axios.post(`${API_URL}/hr/attendance`, data);
        return response.data;
    },

    getAttendance: async (date?: string, employeeId?: string) => {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (employeeId) params.append('employeeId', employeeId);
        const response = await axios.get(`${API_URL}/hr/attendance?${params.toString()}`);
        return response.data;
    }
};

export default hrService;
