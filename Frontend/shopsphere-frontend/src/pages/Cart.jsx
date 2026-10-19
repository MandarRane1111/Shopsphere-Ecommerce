
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../styles/cart.css";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
  } = useCart();

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <main className="cart-page py-4">
      <div className="container-fluid px-3 px-lg-4">
        <div className="mb-4">
          <h1 className="fw-bold cart-page-title">
            Shopping Cart
          </h1>
          <p className="text-secondary mb-0">
            {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty bg-white border rounded-3 text-center">
            <ShoppingCart size={60} color="#ff6b00" />
            <h3 className="fw-bold mt-3">Your cart is empty</h3>
            <p className="text-secondary">
              Discover products and add something you love.
            </p>
            <Link to="/products" className="cart-shop-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* Cart items */}
            <div className="col-12 col-lg-8">
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="cart-item bg-white border rounded-3"
                  >
                    <div className="row g-3 align-items-center">
                      <div className="col-4 col-sm-3">
                        <Link to={`/products/${item.id}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="cart-item-image"
                          />
                        </Link>
                      </div>

                      <div className="col-8 col-sm-9">
                        <Link
                          to={`/products/${item.id}`}
                          className="cart-item-name"
                        >
                          {item.name}
                        </Link>

                        <p className="cart-item-price mt-2 mb-2">
                          {formatPrice(item.price)}
                        </p>

                        <p className="text-success small mb-3">
                          FREE Delivery
                        </p>

                        <div className="d-flex flex-wrap align-items-center gap-3">
                          <div className="cart-quantity">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus size={16} />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-remove-btn"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/products"
                className="cart-continue-shopping mt-4 d-inline-flex align-items-center gap-2"
              >
                <ArrowLeft size={17} />
                Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="col-12 col-lg-4">
              <div className="cart-summary bg-white border rounded-3">
                <h4 className="fw-bold mb-4">Order Summary</h4>

                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Delivery</span>
                  <span className="text-success fw-semibold">
                    FREE
                  </span>
                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="cart-summary-total">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <Link to="/checkout" className="cart-checkout-btn">
                  Proceed to Checkout
                </Link>

                <div className="d-flex justify-content-center align-items-center gap-2 mt-3 text-secondary small">
                  <ShieldCheck size={17} />
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
