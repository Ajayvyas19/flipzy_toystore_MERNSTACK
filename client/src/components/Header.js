import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./home.css";
import { FaShoppingCart } from "react-icons/fa";
import { CartContext } from "../components/CartContext";
import logo from "../ecom.png";

const Header = ({ user, setUser }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Correct cart context
  const { cart } = useContext(CartContext);

  const handleCheckout = () => navigate("/checkout");

  // Sticky header effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const goToAdmin = () => {
    if (user?.role === "admin") navigate("/admin");
    else alert("❌ You are not authorized to access the admin panel.");
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`} id="header">
      {/* Logo */}
      <Link to="/" className="logo-container">
        <div className="logo">
          <img src={logo} alt="logo" className="logo-image" />
        </div>
        <div className="logo-text">Flipzy</div>
      </Link>

      {/* Navigation */}
      <nav className={`main-menu ${menuOpen ? "mobile-open" : ""}`}>
        <Link
          to="/"
          className={`menu-item ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>

        <Link
          to="/aboutpage"
          className={`menu-item ${
            location.pathname === "/aboutpage" ? "active" : ""
          }`}
        >
          About
        </Link>

        {/* Not Logged In */}
        {!user ? (
          <Link
            to="/register"
            className={`menu-item ${
              location.pathname === "/register" ? "active" : ""
            }`}
          >
            Sign Up
          </Link>
        ) : (
          <>
            <Link
              to="/user"
              className={`menu-item ${
                location.pathname === "/user" ? "active" : ""
              }`}
            >
              Shop
            </Link>

            {user.role === "admin" && (
              <button
                onClick={goToAdmin}
                className={`menu-item ${
                  location.pathname.startsWith("/admin") ? "active" : ""
                }`}
              >
                Admin
              </button>
            )}

            <button
              onClick={handleCheckout}
              className="menu-item relative flex items-center gap-1"
            >
              <FaShoppingCart size={16} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-1 rounded-full">
                {cart?.length || 0}
              </span>
              Checkout
            </button>

            <Link
              to="/profile"
              className={`menu-item ${
                location.pathname === "/profile" ? "active" : ""
              }`}
            >
              Profile
            </Link>
          </>
        )}
      </nav>

      {/* Mobile Toggle Button */}
      <div
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </div>
    </header>
  );
};

export default Header;
