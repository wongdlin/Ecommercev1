import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar (Fixed Width) */}
      <div style={{ width: "200px", background: "#333", color: "#fff", padding: "20px" }}>
        <Sidebar />
      </div>

      {/* Main Content (Takes Remaining Space) */}
      <div style={{ flex: 1, padding: "20px", overflowX: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}
