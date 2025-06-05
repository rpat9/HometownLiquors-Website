import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, TrendingUp, Bell, Settings, FileText, Wine, Search, Menu, X } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext"

export default function AdminLayout(){

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { userData } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin', exact: true },
    { id: 'manage-products', label: 'Manage Products', icon: Package, path: '/admin/manage-products' },
    { id: 'orders', label: 'View Orders', icon: ShoppingCart, path: '/admin/orders' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  const isActivePath = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const getPageTitle = () => {
    const current = navigationItems.find(item =>
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    return current ? current.label : 'Admin';
  };

  const getPageDescription = () => {

    const map = {
      '/admin': "Welcome back! Here's what's happening with your store.",
      '/admin/manage-products': 'Manage your liquor inventory, pricing, and product information.',
      '/admin/orders': 'Process orders, track shipments, and manage customer purchases.',
      '/admin/analytics': 'Track sales performance and trends.',
      '/admin/reports': 'Generate financial and business reports.',
      '/admin/notifications': 'View system alerts and updates.',
      '/admin/settings': 'Configure store settings and preferences.'
    };

    return map[location.pathname] || `Manage your ${getPageTitle().toLowerCase()} efficiently.`;
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      <aside className={`flex flex-col w-64 bg-[var(--card-bg)] shadow-md border-r border-[var(--color-border)] transform transition-transform duration-300 z-50 fixed lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 min-h-screen`}>
        
        
        <div className="flex items-center justify-between p-6 h-26 border-b border-[var(--color-border)]">

          <div className="flex items-center space-x-3">

            <div className="w-8 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Wine className="w-5 h-5 text-white" />
            </div>
        
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">HL Admin</h1>

          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        
        <nav className="flex-1 px-4 pt-4 space-y-2">
          {navigationItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 space-x-3 ${
                isActivePath(item.path, item.exact)
                  ? 'bg-[var(--color-primary)] bg-opacity-10 text-white font-medium border-r-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] hover:bg-opacity-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

      </aside>

      
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ">
        
        <header className="sticky top-0 z-40 bg-[var(--card-bg)] border-b border-[var(--color-border)] shadow-sm px-6 py-4 h-26">

          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-4">

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">{getPageDescription()}</p>
              </div>

            </div>

            <div className="flex items-center space-x-4">

              <div className="relative hidden lg:block">

                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-secondary)] w-4 h-4 cursor-pointer" />

                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]"
                />

              </div>

              <button className="relative p-2 hover:bg-[var(--color-bg)] rounded-lg text-[var(--color-text-secondary)] cursor-pointer">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="flex gap-2 cursor-default items-center">
                  <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {userData?.name.slice(0, 2).toUpperCase() || "A"}
                  </div>

                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Store Owner</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{userData?.name.toUpperCase() || "ADMIN"}</p>
                  </div>

              </div>

            </div>

          </div>
        </header>

        
        <main className="p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};