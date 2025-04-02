import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [userToken, setUserToken] = useState(localStorage.getItem("userToken"));
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("adminToken")
  );
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      if (userToken) {
        try {
          const res = await axios.get("http://localhost:8081/dashboard", {
            headers: { Authorization: `Bearer ${userToken}` },
          });
          setUser(res.data.user);
        } catch (err) {
          logoutUser();
        }
      }

      if (adminToken) {
        try{
        const res = await axios.get("http://localhost:8081/dashboard", {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
          
            setIsAdmin(res.data.admin);
        }catch(err){
          logoutAdmin()
        }
          
      }
      setIsAuthLoading(false)
    };
    fetchAuthStatus()
  }, [userToken, adminToken]);

  // useEffect(() => {
  //   if (adminToken) {
  //     axios
  //       .get("http://localhost:8081/dashboard", {
  //         headers: { Authorization: `Bearer ${adminToken}` },
  //       })
  //       .then((res) => {
  //         setIsAdmin(res.data.admin);
  //       })
  //       .catch(() => logoutAdmin());
  //   }
  // }, [adminToken]);

  useEffect(() => {
    const savedUserToken = localStorage.getItem("userToken");
    const savedAdminToken = localStorage.getItem("adminToken");

    if (savedUserToken) {
      setUserToken(savedUserToken);
    }

    if (savedAdminToken) {
      setAdminToken(savedAdminToken);
    }
  }, []);

  const register = async (name, email, password) => {
    try {
      const res = await axios.post("http://localhost:8081/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("userToken", res.data.token);
      setUser(res.data.user);
      setUserToken(res.data.token);
    } catch (err) {
      console.error(
        "Registration failed:",
        err.response?.data?.error || err.message
      );
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8081/admin-login", {
        email,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);
      setIsAdmin(res.data.admin);
      setAdminToken(res.data.token);
    } catch (err) {
      console.error(
        "Admin login failed:",
        err.response?.data?.error || err.message
      );
    }
  };

  const loginUser = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:8081/login", {
        email,
        password,
      });

      console.log("Login Successful. Received Token:", res.data.token);

      localStorage.setItem("userToken", res.data.token);
      setUser(res.data.user);
      setUserToken(res.data.token);
    } catch (err) {
      console.error(
        "Suer login failed:",
        err.response?.data?.error || err.message
      );
    }
  };

  const getUserId = () => {
    const token = localStorage.getItem("userToken");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (err) {
      console.error("Invalid Token:", err);
      return null;
    }
  };

  const logoutUser = () => {
    console.log("Logging out...");
    localStorage.removeItem("userToken");
    setUser(null);
    setUserToken(null);
    clearCart();
  };

  const logoutAdmin = () => {
    console.log("Logging out...");
    localStorage.removeItem("adminToken");
    setIsAdmin(null);
    setAdminToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginUser,
        loginAdmin,
        logoutUser,
        logoutAdmin,
        register,
        getUserId,
        isAdmin,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
