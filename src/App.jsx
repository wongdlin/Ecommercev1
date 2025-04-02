import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom"; // Import useLocation
import "./css/App.css";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import Footer from "./components/footer";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/login";
import Register from "./components/register";
import AdminLayout from "./pages/AdminLayout";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerList from "./pages/CustomerList";
import AdminProducts from "./pages/Adminproducts";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminProductEdit from "./pages/AdminProductEdit";
import ProtectedAdminRoute from "./components/protectedAdminRoute";
import AdminLogin from "./pages/AdminLogin";

function App() {
  const [data, setData] = useState([]);
  const location = useLocation(); // Get the current route
  const isAdminPage = location.pathname.startsWith("/admin"); // Check if the route is an admin page

  useEffect(() => {
    fetch("http://localhost:8081/product")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminPage && <Navbar />} {/* Hide Navbar on Admin pages */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ProductList" element={<ProductList />} />
            <Route path="/Product" element={<Product />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/admin/AdminLogin" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedAdminRoute />}>
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />{" "}
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customer" element={<CustomerList />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/edit" element={<AdminProductEdit />} />
                <Route path="add-product" element={<AdminAddProduct />} />
              </Route>
            </Route>
          </Routes>
        </main>
        {!isAdminPage && <Footer />} {/* Hide Footer on Admin pages */}
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
