import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedAdminRoute() {
    const { isAdmin, isAuthLoading } = useContext(AuthContext);

    if (isAuthLoading) {
      return <div>Loading...</div>; // ✅ Prevent redirect until auth is ready
    }

    if (!isAdmin) {
      return <Navigate to="/admin/AdminLogin" replace />;
    }

    return <Outlet />;
}
