
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  PackageCheck,
  CalendarDays,
  CreditCard,
} from "lucide-react";

import "../styles/order-success.css";

function OrderSuccess() {
  const location = useLocation();

  const order =
    location.state?.order ||
    (() => {
      try {
        return JSON.parse(
          localStorage.getItem("shopsphere_last_order")
        );
      } catch {
        return null;
      }
    })();

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (!order) {
    return (
      <main className="order-success-page">
        <div className="container-fluid px-3 px-lg-4 py-5 text-center">
          <ShoppingBag size={55} color="#ff6b00" />
          <h2 className="fw-bold mt-3">No Recent Order Found</h2>
          <p className="text-secondary">
            Start shopping to place your first order.
          </p>
          <Link to="/products" className="order-success-btn">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-success-page py-5">
      <div className="container-fluid px-3 px-lg-4">
        <div className="order-success-wrapper">
          <div className="order-success-card">
            <div className="order-success-icon">
              <CheckCircle2 size={75} strokeWidth={1.6} />
            </div>

            <h1 className="fw-bold mt-3">
              Order Placed Successfully!
            </h1>

            <p className="text-secondary mt-2">
              Thank you, {order.customer?.fullName || "Customer"}!
              Your order has been placed successfully.
            </p>

            <div className="order-success-id">
              Order ID: <strong>{order.id}</strong>
            </div>

            <div className="order-success-details">
              <div>
                <PackageCheck size={21} />
                <span>Order Status</span>
                <strong>{order.status || "Order Placed"}</strong>
              </div>

              <div>
                <CalendarDays size={21} />
                <span>Order Date</span>
                <strong>
                  {new Date(order.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>

              <div>
                <CreditCard size={21} />
                <span>Payment Method</span>
                <strong>
                  {order.paymentMethod?.toLowerCase() === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </strong>
              </div>
            </div>

            <div className="order-success-total">
              <span>Order Total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>

            <div className="order-success-actions">
              <Link to="/products" className="order-success-btn">
                Continue Shopping
                <ArrowRight size={18} />
              </Link>

              <Link to="/" className="order-home-btn">
                Back to Home
              </Link>
            </div>

            <p className="order-success-note">
              Your order has been recorded successfully.
              You can track its status in your account.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;
