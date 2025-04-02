import { createContext, useState, useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, logout, getUserId } = useContext(AuthContext);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartDetails, setCartDetails] = useState([]);
  const [address, setAddress] = useState([]);
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (cart.length === 0) {
      setCartDetails([]);
      setTotalPrice(0);
      return;
    }
    const fetchCartDetails = async () => {
      try {
        const userId = getUserId();
        const productRequests = cart.map((item) =>
          axios.get(`http://localhost:8081/product/${item.id}`)
        );
        const response = await Promise.all(productRequests);
        const products = response.map((res, index) => ({
          ...res.data,
          qty: cart[index].qty,
          subtotal: res.data.price * cart[index].qty,
        }));
        setCartDetails(products);

        const newTotalPrice = products.reduce(
          (total, item) => total + item.subtotal,
          0
        );
        setTotalPrice(newTotalPrice);
      } catch (err) {
        console.log("Error fetching cart details:", err);
      }
    };
    fetchCartDetails();
  }, [cart]);

  const getAddress = async () => {
    if (!user) {
      console.log("user not logged in");
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8081/get-default-address/${user.id}`
      );
      if (res.data && Object.keys(res.data).length > 0) {
        console.log("Address fetched successfully:", res.data);
        setAddress(res.data);
      } else {
        console.log("No default address found.");
        setAddress(null);
      }
    } catch (err) {
      console.error("Failed to fetch address:", err);
      setAddress(null); // Set null in case of error
    }
  };

  // 🛒 Load Cart from Database when User Logs In
  useEffect(() => {
    if (user) {
      getAddress();
      axios
        .get(`http://localhost:8081/cart/${user.id}`)
        .then((res) => {
          const dbCart = res.data.cart || [];

          // If database cart is empty, use the local cart
          if (dbCart.length === 0) {
            saveCartToDatabase(cart); // Save localStorage cart to database
          } else {
            setCart(dbCart); // Use database cart
            localStorage.setItem("cart", JSON.stringify(dbCart));
          }
        })
        .catch((err) => console.error("Error fetching cart:", err));
    } else {
      setAddress(null);
    }
  }, [user]);

  // 🛒 Save Cart to LocalStorage & Database
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));

    if (user) {
      saveCartToDatabase(cart);
    }
  }, [cart, user]);

  // 🛒 Function to Save Cart to Database
  const saveCartToDatabase = (cart) => {
    if (!user) return;

    axios
      .post("http://localhost:8081/cart", { userId: user.id, cart })
      .catch((err) => console.error("Error saving cart:", err));
  };

  const addToCart = async (productId, qty = 1) => {
    try {
      const userId = getUserId(); // Get logged-in user ID
      const res = await axios.post("http://localhost:8081/cart/add", {
        userId,
        productId,
        qty,
      });
      const { success, product, cart, isGuest, totalPrice } = res.data;
      if (!success) {
        toast.error("Failed to add product to cart!", {
          position: "top-right",
          autoClose: 2000,
        });
        return;
      }

      let updatedCart;
      let productTitle;
      let popToast;

      if (isGuest) {
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === productId);
          const newQty = existingItem ? existingItem.qty + qty : qty;

          if (newQty > product.stock) {
            toast.error(`Only ${product.stock} items available!`, {
              position: "top-right",
              autoClose: 2000,
            });
            qty=0
            popToast = false;
            return prevCart;
          }

          if (existingItem) {
            updatedCart = prevCart.map((item) =>
              item.id === productId ? { ...item, qty: newQty } : item
            );
          } else {
            updatedCart = [...prevCart, { id: productId, qty }];
          }

          localStorage.setItem("cart", JSON.stringify(updatedCart)); // ✅ Save for guests
          productTitle = product.title;
          return updatedCart;
        });
      } else {
        // ✅ Handle logged-in users (fetch cart from backend)
        console.log(cartDetails)
        const findTitle = cartDetails.find((item) => item.id === productId);
        productTitle = findTitle.title;
        setCart(cart);
        popToast = true;
      }

      if (popToast) {
        toast.success(`${productTitle} added to cart!`, {
          position: "top-right",
          autoClose: 2000,
          console,
        });
        popToast = false;
      }
    } catch (err) {
      console.error("Error adding product to cart:", err);
      toast.error("Failed to add product to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const addQty = async (id) => {
    try {
      const { data: product } = await axios.get(
        `http://localhost:8081/product/${id}`
      );

      let stockExceeded = false;
      let newTotalPrice = 0; // Store total price calculation

      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) => {
          if (item.id === id) {
            if (item.qty < product.stock) {
              return { ...item, qty: item.qty + 1 };
            } else {
              stockExceeded = true;
            }
          }
          return item;
        });

        // ✅ Recalculate total price immediately
        newTotalPrice = updatedCart.reduce(
          (total, item) => total + item.qty * (item.price || 0),
          0
        );

        return updatedCart;
      });

      // ✅ Update total price immediately
      setTotalPrice(newTotalPrice);

      if (stockExceeded) {
        toast.error(`Only ${product.stock} items are available in stock!`, {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.info("Quantity increased!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Error fetching product stock:", err);
      toast.error("Failed to update quantity!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  // 🛒 Decrease Quantity
  const reduceQty = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: Math.max(0, item.qty - 1),
              subtotal: item.price * Math.max(0, item.qty - 1),
            }
          : item
      );

      const filteredCart = updatedCart.filter((item) => item.qty > 0);

      return filteredCart;
    });

    toast.info("Quantity decreased!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const clearCart = () => {
    setCart([]);
    setCartDetails([]);
    setTotalPrice(0);
    localStorage.removeItem("cart");

    if (logout) {
      localStorage.removeItem("cart");
    } else if (user) {
      saveCartToDatabase([]); // Clear cart in database
    }

    toast.warn("Cart cleared!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const AddAddress = async (editableAddress) => {
    if (!user) {
      alert("Please log in to continue to checkout");
      return;
    }

    if (
      !editableAddress.street ||
      !editableAddress.city ||
      !editableAddress.state ||
      !editableAddress.postcode ||
      !editableAddress.country
    ) {
      alert("Please enter an address before updating");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8081/add-address", {
        userId: user.id,
        ...editableAddress,
      });

      toast.success("Address updated successfully", {
        position: "top-right",
        autoClose: 2000,
      });

      return true;
    } catch (err) {
      console.error("Failed to update address:", err);
      toast.error("Address update failed", {
        position: "top-right",
        autoClose: 2000,
      });
      return false;
    }
  };

  const checkout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const productRequests = cart.map((item) =>
        axios.get(`http://localhost:8081/product/${item.id}`)
      );

      const response = await Promise.all(productRequests);

      const updatedCartDetails = cart.map((item, index) => ({
        ...item,
        price: response[index].data.price, // Update price to latest
        subtotal: response[index].data.price * item.qty, // Recalculate subtotal
      }));

      setCartDetails(updatedCartDetails);

      const res = await axios.post("http://localhost:8081/checkout", {
        userId: user.id,
        cartItems: updatedCartDetails,
        totalPrice: updatedCartDetails.reduce(
          (total, item) => total + item.subtotal,
          0
        ),
      });

      toast.success("Order Placed Successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
      clearCart(); // Clear cart after successful order
    } catch (err) {
      setCartDetails(cartDetails);
      console.error("Checkout failed:", err);
      toast.warn("Checkout Failed!", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        clearCart,
        cartCount,
        reduceQty,
        addQty,
        totalPrice,
        checkout,
        cartDetails,
        address,
        AddAddress,
      }}
    >
      {children}
      <ToastContainer />
    </CartContext.Provider>
  );
}
