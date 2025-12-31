import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    UserCog,
    FileText,
    Settings,
    LogOut,
    CreditCard,
    ReceiptText,
    Shield,
    Clock,
    Printer,
    BarChart3,
    Mail
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { icon: CreditCard, label: 'POS', path: '/pos', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { icon: ReceiptText, label: 'Sales History', path: '/sales', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { icon: Package, label: 'Inventory', path: '/inventory', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { icon: ShoppingCart, label: 'Orders', path: '/orders', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { icon: Users, label: 'CRM', path: '/crm', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { icon: Mail, label: 'Enquiries', path: '/enquiries', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['ADMIN', 'MANAGER'] },
    { icon: FileText, label: 'Finance', path: '/finance', roles: ['ADMIN'] },
];

const TOOLS_LINKS = [
    { path: '/print-center', icon: Printer, label: 'Print Center', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
];

const HR_LINKS = [
    { path: '/hr', icon: Users, label: 'Staff Directory', roles: ['ADMIN', 'MANAGER'] },
    { path: '/attendance', icon: Clock, label: 'Attendance', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
];

const ADMIN_LINKS = [
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['ADMIN'] },
    { icon: Shield, label: 'Manage Roles', path: '/roles', roles: ['ADMIN'] },
    { icon: UserCog, label: 'Manage Users', path: '/users', roles: ['ADMIN'] },
];

export default function Sidebar() {
    const location = useLocation();
    const { logout, user } = useAuth();

    const userRole = user?.user?.role || 'STAFF';
    const currentRole = userRole === 'user' ? 'STAFF' : userRole;

    const filteredMenu = menuItems.filter(item => {
        return item.roles.includes(currentRole as any);
    });

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-100 shrink-0">
                        <span className="text-white font-black text-xl">F</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-black text-gray-900 tracking-tighter uppercase">FramezLabs</span>
                        <span className="text-[10px] font-bold text-primary-600 tracking-[0.2em] uppercase">ERP System</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                {filteredMenu.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                                isActive
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5 mr-3", isActive ? "text-white" : "text-gray-400")} />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="px-4 py-2 mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 mb-2">Operation Tools</p>
                    <div className="space-y-1">
                        {TOOLS_LINKS.filter(link => link.roles.includes(currentRole as any)).map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                    location.pathname === link.path
                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200 translate-x-1"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <link.icon className={clsx(
                                    "w-5 h-5 transition-transform duration-300",
                                    location.pathname === link.path ? "scale-110" : "group-hover:scale-110"
                                )} />
                                <span className="text-xs font-black uppercase tracking-wider">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-2 mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 mb-2">HR Management</p>
                    <div className="space-y-1">
                        {HR_LINKS.filter(link => link.roles.includes(currentRole as any)).map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                    location.pathname === link.path
                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200 translate-x-1"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <link.icon className={clsx(
                                    "w-5 h-5 transition-transform duration-300",
                                    location.pathname === link.path ? "scale-110" : "group-hover:scale-110"
                                )} />
                                <span className="text-xs font-black uppercase tracking-wider">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-2 mt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 px-4 mb-2">System Access</p>
                    <div className="space-y-1">
                        {ADMIN_LINKS.filter(link => link.roles.includes(currentRole as any)).map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                    location.pathname === link.path
                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200 translate-x-1"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <link.icon className={clsx(
                                    "w-5 h-5 transition-transform duration-300",
                                    location.pathname === link.path ? "scale-110" : "group-hover:scale-110"
                                )} />
                                <span className="text-xs font-black uppercase tracking-wider">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 space-y-2">
                {user?.user && (
                    <div className="px-3 py-3 mb-2 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                        <p className="text-xs font-black text-gray-900 truncate">{user.user.firstName} {user.user.lastName}</p>
                        <div className="mt-1.5 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{user.user.role}</span>
                        </div>
                    </div>
                )}
                <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-all active:scale-95"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
