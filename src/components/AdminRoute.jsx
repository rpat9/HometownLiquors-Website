import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AdminRoute ({ children }) {
    
    const { currentUser, userData } = useAuth();

    if (!currentUser) return <Navigate to="/login" />;

    if (userData?.role !== "admin") return <Navigate to="/" />;

    return children;
    
}