import { useState } from "react";
import API_BASE_URL from "../services/apiConfig";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
  ShoppingBag,
  ShieldCheck,
  Truck,
  BadgePercent,
} from "lucide-react";

import "../styles/auth.css";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import axios from "axios";

function Login() {

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const navigate = useNavigate();

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) {
          return "Email address is required";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Enter a valid email address";
        }

        return "";

      case "password":
        if (!value) {
          return "Password is required";
        }

        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      login: "",
    }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);

      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(
  `${API_BASE_URL}/auth/login`,
  {
    email: formData.email.trim(),
    password: formData.password,
  },
  {
    withCredentials: true,
  }
);

      const { token, userId, name, email, role } = response.data;

      if (!token) {
        throw new Error("Login response did not contain a token");
      }

      // Temporary client-side storage for the development demo.
      // We'll improve session security before deployment.
      sessionStorage.setItem("shopsphere_token", token);
      sessionStorage.setItem(
        "shopsphere_user",
        JSON.stringify({ userId, name, email, role })
      );
      window.dispatchEvent(new Event("shopsphere-auth-change"));
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Login request failed:", error);

      setErrors((prev) => ({
        ...prev,
        login:
          error.response?.status === 401 ||
            error.response?.status === 400
            ? "Invalid email or password"
            : error.response?.status === 403
              ? "Login request was denied by the server"
              : "Unable to sign in. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <main className="auth-page">
      <div className="container-fluid px-3 px-lg-4">
        <div className="auth-layout">

          {/* Left promotional panel */}
          <div className="auth-promo">
            <div className="auth-promo-content">
              <div className="auth-promo-icon">
                <ShoppingBag size={34} />
              </div>

              <h2>
                Welcome Back to <span>ShopSphere</span>
              </h2>

              <p>
                Your favorite products, amazing deals, and
                effortless shopping — all in one place.
              </p>

              <div className="auth-benefits">
                <div>
                  <Truck size={22} />
                  <span>Fast & Reliable Delivery</span>
                </div>

                <div>
                  <ShieldCheck size={22} />
                  <span>Safe & Secure Shopping</span>
                </div>

                <div>
                  <BadgePercent size={22} />
                  <span>Exclusive Offers & Deals</span>
                </div>
              </div>
            </div>
          </div>

          {/* Login form */}
          <div className="auth-form-panel">
            <div className="auth-form-container">

              <div className="auth-heading">
                <div className="auth-mobile-icon">
                  <ShoppingBag size={25} />
                </div>

                <h1>Welcome Back!</h1>
                <p>Sign in to continue shopping with ShopSphere.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="login-email"
                    className="auth-label"
                  >
                    Email Address
                  </label>

                  <div className="auth-input-wrapper">
                    <Mail size={19} />


                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                  </div>
                  {errors.email && (
                    <p className="auth-error">{errors.email}</p>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="login-password"
                    className="auth-label"
                  >
                    Password
                  </label>

                  <div className="auth-input-wrapper">
                    <LockKeyhole size={19} />


                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />


                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="auth-error">{errors.password}</p>
                  )}
                </div>

                <div className="auth-form-options">
                  <label className="auth-remember">
                    <input type="checkbox" />
                    Remember me
                  </label>
                </div>

                {errors.login && (
                  <p className="auth-error" role="alert">
                    {errors.login}
                  </p>
                )}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isSubmitting}
                >
                  <LogIn size={19} />
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>

              </form>

              <div className="auth-divider">
                <span>New to ShopSphere?</span>
              </div>

              <Link
                to="/register"
                className="auth-secondary-btn"
              >
                Create an Account
              </Link>

                <div className="admin-login-link">
  <span>Are you an administrator?</span>
  <a href="/admin/login">Admin Login</a>
</div>

              <p className="auth-bottom-note">
                <ShieldCheck size={15} />
                Your information is safe with us
              </p>

            </div>
          </div>

        </div>
      </div>

      {showSuccessModal && (
        <div
          className="login-success-overlay"
          role="presentation"
        >
          <div
            className="login-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-success-title"
          >
            <div className="login-success-icon">
              <Check size={36} strokeWidth={3} />
            </div>

            <h2 id="login-success-title">
              Login Successful!
            </h2>

            <p>
              Welcome back to ShopSphere!
              You're all set to explore your favorite products.
            </p>

            <button
              type="button"
              className="login-success-button"
              onClick={handleContinueShopping}
            >
              Continue Shopping
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

export default Login;