import "../css/navbar.css";
import { CartContext } from "../context/CartContext";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const { cartCount } = useContext(CartContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="Logo"><Link to="/">Logo</Link></div>
      {/* Hamburger Menu */}
      <div className="hamburger" onClick={toggleMenu}>
        <i className="fa fa-bars"></i>
      </div>

      {/* Links (toggle visibility based on isMenuOpen state) */}
      <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
        <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
          Home
        </Link>
        <Link to="/ProductList" className="nav-link" onClick={() => setIsMenuOpen(false)}>
          Shop
        </Link>
        <Link to="/Login" onClick={() => setIsMenuOpen(false)}>
          Login
        </Link>
        
      </div>
      <Link to="/Cart" onClick={() => setIsMenuOpen(false)}>
          <i className="fa-solid fa-cart-shopping"></i>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
    </nav>
  );
}

export default Navbar;
