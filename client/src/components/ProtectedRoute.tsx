import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const rawRole = (user?.user?.role || (user as any)?.role || 'STAFF').toString();
    const roleUpper = rawRole.toUpperCase();
    const userRole = roleUpper === 'USER' || roleUpper === 'GUEST' ? 'STAFF' : roleUpper;

    if (allowedRoles && allowedRoles.length > 0) {
        const allowedUpper = allowedRoles.map(r => r.toUpperCase());
        if (!allowedUpper.includes(userRole)) {
            // Redirect to dashboard if trying to access restricted page
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
