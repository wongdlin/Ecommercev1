import "../css/product.css";
import { useContext } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Product() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const productId = Number(params.get("id"));

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch("http://localhost:8081/product")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const productinfo = data.find((item) => item.id === productId);

  if (loading) return <p>Loading product...</p>;

  if (error) return <p>Failed to load product. Please try again later.</p>;

  if (!productinfo) return <p>Product not found! ❌</p>;

  return (
    <div className="product-box">
      <img src={productinfo.image} alt={productinfo.title}></img>
      <div className="product-info-container">
        <h5>Product :{productinfo.title}</h5>
        <h5>Price:{productinfo.price}</h5>
        <h5>
          Qty:
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          ></input>
        </h5>
        {productinfo.stock === 0 ? (
          <button disabled className="Inactive-button">
            Out Of Stock
          </button>
        ) : (
          <button onClick={() => addToCart(productinfo.id, qty)}>
            Add To Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default Product;
