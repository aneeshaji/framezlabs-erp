import { LayoutDashboard, Package, ShoppingCart, Users, UserCog, FileText, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Users, label: 'CRM', path: '/crm' },
    { icon: UserCog, label: 'HR & Employees', path: '/hr' },
    { icon: FileText, label: 'Finance', path: '/finance' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-primary-600">FramezLabs ERP</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary-50 text-primary-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5 mr-3", isActive ? "text-primary-600" : "text-gray-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
