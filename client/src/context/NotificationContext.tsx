import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    read: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();
    const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const response = await axios.get(`${API_URL}/notifications?limit=10`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`${API_URL}/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
