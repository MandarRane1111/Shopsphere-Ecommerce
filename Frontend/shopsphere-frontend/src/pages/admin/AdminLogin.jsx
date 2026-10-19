import API_BASE_URL from "../../services/apiConfig";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import "./admin-login.css";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const nextErrors = {};
    const email = form.email.trim();

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (email.length > 254) {
      nextErrors.email = "Email address is too long.";
    } else if (
      !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+$/i.test(
        email
      )
    ) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    } else if (form.password.length > 128) {
      nextErrors.password = "Password cannot exceed 128 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (loading || !validateForm()) return;

    setLoading(true);

    try {
      const response = await authApi.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      const data = response.data;
      const role = String(data?.role || "").toUpperCase();

      if (role !== "ADMIN") {
        setServerError(
          "Access denied. These credentials do not belong to an administrator."
        );
        return;
      }

      if (!data?.token) {
        setServerError(
          "Login succeeded, but the server did not return an authentication token."
        );
        return;
      }

      // Store only the admin JWT. No admin session is created.
      localStorage.setItem("shopsphere_admin_token", data.token);

      // Store the admin profile for display only, not as proof of authorization.
      localStorage.setItem(
        "shopsphere_admin_user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role,
        })
      );

      navigate("/admin", { replace: true });
    } catch (error) {
      if (error.response?.status === 401 ||
          error.response?.status === 403) {
        setServerError("Invalid email or password.");
      } else {
        setServerError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Unable to sign in. Check that the backend is running and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand-panel">
        <Link to="/" className="admin-login-brand">
          <span>Shop</span>Sphere
        </Link>

        <div className="admin-login-brand-content">
          <div className="admin-login-shield">
            <ShieldCheck size={35} />
          </div>

          <h1>Manage your store with confidence.</h1>
          <p>
            Manage products, track customer orders, and keep your
            ShopSphere store running smoothly from one place.
          </p>

          <div className="admin-login-feature">
            <ShieldCheck size={18} />
            <span>Administrator-only access</span>
          </div>
          <div className="admin-login-feature">
            <LockKeyhole size={18} />
            <span>Token-based authentication</span>
          </div>
        </div>

        <p className="admin-login-copyright">
          © 2026 ShopSphere. All rights reserved.
        </p>
      </section>

      <section className="admin-login-form-panel">
        <div className="admin-login-card">
          <div className="admin-login-mobile-brand">
            <Link to="/" className="admin-login-brand">
              <span>Shop</span>Sphere
            </Link>
          </div>

          <div className="admin-login-heading">
            <div className="admin-login-heading-icon">
              <ShieldCheck size={24} />
            </div>
            <span className="admin-login-eyebrow">ADMIN PORTAL</span>
            <h2>Welcome back</h2>
            <p>Sign in with your administrator account.</p>
          </div>

          {serverError && (
            <div className="admin-login-server-error" role="alert">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="admin-login-field">
              <label htmlFor="admin-login-email">Email Address</label>
              <div
                className={`admin-login-input-wrap ${
                  errors.email ? "invalid" : ""
                }`}
              >
                <Mail size={18} />
                <input
                  id="admin-login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={254}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "admin-email-error" : undefined
                  }
                />
              </div>
              {errors.email && (
                <small id="admin-email-error" className="admin-login-field-error">
                  {errors.email}
                </small>
              )}
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-login-password">Password</label>
              <div
                className={`admin-login-input-wrap ${
                  errors.password ? "invalid" : ""
                }`}
              >
                <LockKeyhole size={18} />
                <input
                  id="admin-login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  maxLength={128}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "admin-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="admin-login-toggle-password"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <small
                  id="admin-password-error"
                  className="admin-login-field-error"
                >
                  {errors.password}
                </small>
              )}
            </div>

            <button
              type="submit"
              className="admin-login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to Admin Portal"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="admin-login-security-note">
            <LockKeyhole size={15} />
            <span>Protected administrator access</span>
          </div>

          
<Link to="/" className="admin-login-back-link">
  Back to ShopSphere Store
</Link>

<div className="admin-customer-login-link">
  <span>Are you a customer?</span>
  <Link to="/login">Customer Login</Link>
</div>

        </div>
      </section>
    </main>
  );
}
