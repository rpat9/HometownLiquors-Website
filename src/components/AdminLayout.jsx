import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, UserCircle, LayoutDashboard, PackageSearch, BarChart3, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userData } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/manage-products", icon: PackageSearch, label: "Manage Products" },
    { path: "/admin/orders", icon: BarChart3, label: "Orders" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-25"
        } bg-[var(--card-bg)] border-r border-[var(--color-border)] transition-all duration-300 hidden lg:block shadow-md`}
      >
        
        <div className="flex items-center justify-between px-4 py-6.5 border-b border-[var(--color-border)]">

          <div className="flex items-center space-x-2">

            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">

              <span className="text-white font-bold text-sm">HL</span>

            </div>

            {isSidebarOpen && (

              <span className="text-lg font-bold text-[var(--color-primary)]">
                Admin Panel
              </span>

            )}

          </div>

          <button 
            onClick={toggleSidebar} 
            className="p-1 hover:bg-[var(--color-bg)] cursor-pointer rounded transition-colors"
          >

            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}

          </button>

        </div>

        
        <nav className="p-2 space-y-1">

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (

              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors w-full ${
                  active 
                    ? 'bg-[var(--color-primary)] text-white' 
                    : 'hover:bg-[var(--color-bg)] text-[var(--color-text-primary)]'
                }`}
              >

                <Icon size={20} />

                {isSidebarOpen && <span className="font-medium">{item.label}</span>}

              </Link>
            );

          })}

        </nav>

      </aside>

      
      <div className="flex-1 flex flex-col">
        
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--card-bg)] shadow-sm">

          <div className="flex items-center space-x-4">

            <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-[var(--color-bg)] rounded">
              <Menu size={20} />
            </button>

            <div>

              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Hometown Liquors Admin
              </h1>

              <p className="text-sm text-[var(--color-text-secondary)] opacity-70">
                Manage your store operations
              </p>

            </div>

          </div>

          <div className="flex items-center space-x-4">

            <button className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors relative cursor-pointer">

              <Bell size={20} />

              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-primary)] rounded-full"></span>

            </button>

            <div className="flex items-center space-x-3 pl-4 border-l border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg)]">

              <div className="text-right">

                <p className="text-sm font-medium">{userData?.name || "Admin"}</p>

                <p className="text-xs text-[var(--color-text-secondary)] opacity-70">Administrator</p>

              </div>

              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">

                <UserCircle className="text-white" size={18} />

              </div>

            </div>

          </div>

        </header>

        <main className="flex-1 p-6 bg-[var(--color-bg)]">

          <Outlet />

        </main>

      </div>
    </div>
  );
}