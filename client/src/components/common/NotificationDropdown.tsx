import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { notifications, markAsRead, unreadCount } = useNotifications();

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-500">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            {unreadCount} New
                        </span>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={clsx(
                                        "p-4 hover:bg-gray-50 transition-colors group relative",
                                        !notification.read && "bg-blue-50/30"
                                    )}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={clsx("text-xs font-bold mb-0.5", !notification.read ? "text-gray-900" : "text-gray-600")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 leading-relaxed mb-1.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-300">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
