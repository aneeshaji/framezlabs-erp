import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';

interface AuthContextType {
    user: any;
    login: (email: string, pass: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedUser = authService.getCurrentUser();
            if (savedUser) {
                // Set saved user first for immediate UI responsiveness
                setUser(savedUser);
                try {
                    // Sync with latest profile data from server
                    const profile = await authService.getProfile();
                    const updatedUser = { ...savedUser, user: profile };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                } catch (error) {
                    console.error('Failed to sync profile:', error);
                    // If profile fetch fails (e.g. token expired), we might want to logout
                    if ((error as any).response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, pass: string) => {
        const data = await authService.login(email, pass);
        setUser(data);
    };

    const register = async (userData: any) => {
        const data = await authService.register(userData);
        setUser(data);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
