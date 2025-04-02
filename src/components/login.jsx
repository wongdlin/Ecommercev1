import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function Login() {
  const {clearCart} = useContext(CartContext)
  const { user, loginUser, logoutUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      toast.success("Login successfully");
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  const handleLogout = () => {
    clearCart()
    logoutUser()
    toast.info("Logout successful")
  }

  return (
    <div>
      <h2>{user ? "Welcome, " + user.name : "Login"}</h2>
      {!user ? (
        <>
        <form onSubmit={handleLogin}>
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
          <button type="submit">Login</button>
        </form>
        Not a member yet? <Link to="Register">Sign up</Link> here 
        </>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
      
    </div>
  );
}
