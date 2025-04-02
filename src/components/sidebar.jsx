import "../css/Sidebar.css"; // Import the CSS file
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function Sidebar() {

  const {logoutAdmin } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/products">Products</Link></li>
        <li><Link to="/admin/orders">Orders</Link></li>
        <li><Link to="/admin/customer">Customers</Link></li>
        <button onClick={()=>logoutAdmin()}>Logout</button>
      </ul>
    </div>
  );
}
