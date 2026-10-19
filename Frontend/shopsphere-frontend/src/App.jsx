import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import useSessionActivity from "./hooks/useSessionActivity";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("shopsphere_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useSessionActivity();

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />

          <Route path="/products/:id" element={<ProductDetails />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />

          <Route path="/register" element={<Register />} />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>

      {!isAdminRoute && (
        <div className="mt-auto">
          <Footer />
        </div>
      )}
    </div>
  );
}



function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
