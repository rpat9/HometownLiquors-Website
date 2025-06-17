import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Admin from "./pages/admin/Admin";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import ManageProducts from "./pages/admin/ManageProducts";
import ViewOrders from "./pages/admin/ViewOrders";
import Notifications from "./pages/admin/Notifications";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import Reports from "./pages/admin/Reports";

function App() {
  return (
    <Router>

      <div className="min-h-screen">

        <Routes>

          <Route element={<><Navbar /><div className="pt-20"><Outlet /></div></>}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Route>

          
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Admin />} />
            <Route path="manage-products" element={<ManageProducts />} />
            <Route path="orders" element={<ViewOrders />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

        </Routes>

      </div>

    </Router>
  );
}

export default App;