import "../css/cart.css";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function Cart() {
  const {
    cart,
    clearCart,
    totalPrice,
    addQty,
    reduceQty,
    checkout,
    cartDetails,
    address,
    AddAddress,
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);

  const [editableAddress, setEditableAddress] = useState({
    street: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
  });

  useEffect(() => {
    if (address) {
      setEditableAddress(address);
    }
  }, [address]);

  const handleAddressChange = (e) => {
    setEditableAddress({
      ...editableAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    const success = await AddAddress(editableAddress);
    if (success) {
      checkout();
    }
  };

  return (
    <>
      <div className="cart">
        Cart
        <div className="cart-item">
          <div className="cart-flex">
            {cart.length === 0 ? (
              <p>Cart is Empty</p>
            ) : (
              cartDetails.map((item) => (
                <div className="cart-item-list">
                  <img src={item.image} alt={item.title}></img>
                  <div className="cart-item-section">
                    <h4>Name:{item.title}</h4>
                    <h4>Price:{item.price}</h4>
                    <h4>Subtotal:{item.subtotal}</h4>
                  </div>
                  <h5 className="cart-item-qty">
                    <button onClick={() => reduceQty(item.id)}>-</button>qty:
                    {item.qty}
                    <button onClick={() => addQty(item.id)}>+</button>
                  </h5>
                </div>
              ))
            )}
          </div>
          <div className="summary">
            <h3>Summary</h3>
            <h3>Total:{totalPrice}</h3>
            {user ? (
              <>
                <h3>Shipping Address</h3>
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  value={editableAddress.street}
                  onChange={handleAddressChange}
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={editableAddress.city}
                  onChange={handleAddressChange}
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={editableAddress.state}
                  onChange={handleAddressChange}
                  required
                />
                <input
                  type="text"
                  name="postcode"
                  placeholder="Post Code"
                  value={editableAddress.postcode}
                  onChange={handleAddressChange}
                  required
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={editableAddress.country}
                  onChange={handleAddressChange}
                  required
                />
              </>
            ) : (
              <></>
            )}

            <div className="button-wrap">
              <button className="checkout-btn" onClick={() => handleSubmit()}>
                Checkout
              </button>
              <button className="checkout-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart;
