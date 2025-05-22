import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20">
          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            
            <Route path="/cart" element={<PrivateRoute> <Cart /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute> <Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute> <Admin /></PrivateRoute>} />
            
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
