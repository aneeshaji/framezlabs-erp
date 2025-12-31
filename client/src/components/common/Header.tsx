import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import clsx from 'clsx';

export default function Header() {
    const { user } = useAuth();
    const { unreadCount } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    const displayName = user ? `${user.user.firstName} ${user.user.lastName}` : 'Guest User';
    const initial = user ? user.user.firstName.charAt(0).toUpperCase() : 'G';

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
            <div className="flex items-center">
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative">
                    <button
                        className={clsx(
                            "p-2 rounded-lg relative transition-all active:scale-95",
                            showNotifications ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>
                    <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                </div>

                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.user.role || 'Guest'}</p>
                    </div>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                        {initial}
                    </div>
                </div>
            </div>
        </header>
    );
}
