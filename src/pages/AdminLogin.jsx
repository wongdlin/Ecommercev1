import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify"; // Assuming you're using toast notifications for isAdmin feedback


function AdminLogin() {
  const { isAdmin, loginAdmin, logoutAdmin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // To track loading state
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  if (isAdmin) {
    console.log("isAdmin:",isAdmin)
    navigate("/admin/dashboard"); // Redirect to admin dashboard if already logged in
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      await loginAdmin(email, password);
      toast.success("Admin login successful!");
      console.log("isadmin",isAdmin)
      navigate("/admin/dashboard"); // Redirect to the admin dashboard after successful login
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false); // Stop loading after login attempt
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    toast.info("Logged out successfully");
    navigate("/admin/AdminLogin", { replace: true });
  };

  return (
    <div className="admin-login-container">
        {console.log("admin",isAdmin)}
      <h2>{isAdmin ? `Welcome, ${isAdmin.name}` : "Admin Login"}</h2>
      
      {/* Show login form if isAdmin is not logged in */}
      {!isAdmin ? (
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          
          <button type="submit" disabled={isLoading}>
            Login
          </button>
        </form>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      
    </div>
  );
}

export default AdminLogin;
