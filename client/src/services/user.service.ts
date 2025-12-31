import api from './api';

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
}

export interface Role {
    _id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem: boolean;
}

const userService = {
    getUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    createUser: async (userData: Partial<User> & { password?: string }): Promise<User> => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateUser: async (id: string, userData: Partial<User> & { password?: string }): Promise<User> => {
        const response = await api.patch(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    getRoles: async (): Promise<Role[]> => {
        const response = await api.get('/users/roles');
        return response.data;
    },

    createRole: async (roleData: Partial<Role>): Promise<Role> => {
        const response = await api.post('/users/roles', roleData);
        return response.data;
    },

    updateRole: async (id: string, roleData: Partial<Role>): Promise<Role> => {
        const response = await api.patch(`/users/roles/${id}`, roleData);
        return response.data;
    },

    deleteRole: async (id: string): Promise<void> => {
        await api.delete(`/users/roles/${id}`);
    }
};

export default userService;
