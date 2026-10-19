import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./../styles/navbar.css";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  CircleUserRound,
  Mail,
  UserRound,
  ShieldCheck,
  LogOut,
} from "lucide-react";

function Navbar() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();


  useEffect(() => {
    const syncAuth = () => {
      const token = sessionStorage.getItem("shopsphere_token");
      const savedUser = sessionStorage.getItem("shopsphere_user");

      if (!token || !savedUser) {
        setCurrentUser(null);
        return;
      }

      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        setCurrentUser(null);
      }
    };

    syncAuth();

    window.addEventListener("shopsphere-auth-change", syncAuth);

    return () => {
      window.removeEventListener("shopsphere-auth-change", syncAuth);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("shopsphere_token");
    sessionStorage.removeItem("shopsphere_user");

    setCurrentUser(null);
    setAccountOpen(false);
    setMenuOpen(false);

    window.dispatchEvent(new Event("shopsphere-auth-change"));

    navigate("/");
  };


  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/products?name=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="site-header">
      <div className="header-main">
        <Link to="/" className="brand-logo">
          <span>Shop</span>Sphere
        </Link>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search products, brands and more..."
            aria-label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
        </form>

        <div className="header-actions">

          <Link
            to="/cart"
            className="header-cart"
            aria-label={`Shopping cart, ${cartCount} items`}
            onClick={(e) => {
              if (!sessionStorage.getItem("shopsphere_token")) {
                e.preventDefault();
                window.location.assign("/login");
              }
            }}
          >
            <ShoppingCart size={24} strokeWidth={1.8} />

            {cartCount > 0 && (
              <span className="cart-count-badge">
                {cartCount}
              </span>
            )}
          </Link>



          {currentUser ? (
            <div className="header-account-wrapper">
              <Link
                to="/account"
                className="header-account-btn"
                aria-label="Go to My Account"
              >
                <CircleUserRound size={25} strokeWidth={1.8} />
              </Link>
            </div>
          ) : (
            <Link to="/login" className="header-login">
              Login
            </Link>
          )}


          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            type="button"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <nav className={`category-nav ${menuOpen ? "open" : ""}`}
        aria-label="Main navigation">
        <div className="category-nav-inner">

          {[
            ["Home", "/"],
            ["All Categories", "/products"],
            ["Mobiles", "/products?category=Mobiles"],
            ["Laptops", "/products?category=Laptops"],
            ["Electronics", "/products?category=Electronics"],
            ["Home Appliances", "/products?category=Home%20Appliances"],
            ["Fashion", "/products?category=Fashion"],
            ["Accessories", "/products?category=Accessories"],
            ["About Us", "/about"],
            ["Contact Us", "/contact"]
          ].map(([label, path]) => (

            <NavLink
              key={label}
              to={path}
              className={() => {
                const currentUrl = location.pathname + location.search;

                return currentUrl === path ? "active" : "";
              }}
              onClick={(e) => {
                setMenuOpen(false);

                if (
                  path === "/contact" &&
                  !sessionStorage.getItem("shopsphere_token")
                ) {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
