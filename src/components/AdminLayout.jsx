import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X, UserCircle, LayoutDashboard, PackageSearch, BarChart3 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLayout() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { userData } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-[var(--card-bg)] border-r border-[var(--color-border)] transition-all duration-300 hidden lg:block`}
      >

        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">

          <span className="text-xl font-bold text-[var(--color-primary)]">

            {isSidebarOpen ? "Admin Panel" : "AP"}

          </span>

          <button onClick={toggleSidebar} className="lg:hidden">

            {isSidebarOpen ? <X /> : <Menu />}

          </button>
          
        </div>

        <nav className="p-4 space-y-4">

          <Link to="/admin" className="flex items-center space-x-2 hover:text-[var(--color-primary)]">

            <LayoutDashboard size={20} />

            {isSidebarOpen && <span>Dashboard</span>}

          </Link>

          <Link to="/admin/manage-products" className="flex items-center space-x-2 hover:text-[var(--color-primary)]">

            <PackageSearch size={20} />

            {isSidebarOpen && <span>Manage Products</span>}

          </Link>

          <Link to="/admin/orders" className="flex items-center space-x-2 hover:text-[var(--color-primary)]">

            <BarChart3 size={20} />

            {isSidebarOpen && <span>Orders</span>}

          </Link>

        </nav>

      </aside>

      
      <div className="flex-1 flex flex-col">
        
        <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--card-bg)]">

          <div className="flex items-center space-x-4">

            <button onClick={toggleSidebar} className="lg:hidden">
              <Menu />
            </button>

            <h1 className="text-xl font-bold">Admin Dashboard</h1>

          </div>

          <div className="flex items-center space-x-2">

            <UserCircle />

            <span className="text-sm">{userData?.name || "Admin"}</span>

          </div>

        </header>

        
        <main className="p-6">

          <Outlet />
          
        </main>

      </div>
    </div>
  );
}