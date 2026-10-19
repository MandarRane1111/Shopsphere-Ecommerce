import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
    CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  Wallet,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import "../styles/checkout.css";
import {
  saveDeliveryAddress,
  placeCodOrder,
  placeBuyNowCodOrder,
  getMyAddresses,
  createOnlineOrder,
  verifyOnlinePayment,
} from "../services/checkoutApi";


const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};


function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

// Check whether customer arrived through Buy Now
const buyNowProduct = location.state?.buyNowProduct || null;

const buyNowQuantity = Math.max(
  1,
  Number(location.state?.buyNowQuantity) || 1
);

const isBuyNow = Boolean(buyNowProduct);

// Prepare selected product for checkout
const buyNowItems = buyNowProduct
  ? [
      {
        id: buyNowProduct.id,
        name: buyNowProduct.name,
        image: buyNowProduct.image,
        price: Number(buyNowProduct.price),
        quantity: buyNowQuantity,
      },
    ]

    
  : [];
  const {
  cartItems,
  cartCount,
  cartTotal,
  refreshCart,
} = useCart();

// Use Buy Now product or normal cart products
const checkoutItems = isBuyNow ? buyNowItems : cartItems;

const checkoutCount = isBuyNow
  ? buyNowQuantity
  : cartCount;

const checkoutTotal = isBuyNow
  ? buyNowItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  : cartTotal;

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  
const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((previous) => ({
    ...previous,
    [name]: value,
  }));

  setFormErrors((previous) => ({
    ...previous,
    [name]: "",
  }));
};


  useEffect(() => {
  let active = true;

  const loadSavedAddress = async () => {
    const token = sessionStorage.getItem("shopsphere_token");

    if (!token) return;

    // Auto-fill email from logged-in customer
try {
  const savedUser = JSON.parse(
    sessionStorage.getItem("shopsphere_user") || "null"
  );

  if (savedUser?.email) {
    setForm((previous) => ({
      ...previous,
      email: savedUser.email,
    }));
  }
} catch (error) {
  console.error("Unable to load customer email:", error);
}

    try {
      const addresses = await getMyAddresses();

      if (!active || !Array.isArray(addresses) || addresses.length === 0) {
        return;
      }

      // Use the most recently saved address.
      const savedAddress = [...addresses].sort(
        (a, b) => Number(b.id) - Number(a.id)
      )[0];

      setForm((previous) => ({
        ...previous,
        fullName: savedAddress.fullName || "",
        phone: savedAddress.phone || "",
        address: [
          savedAddress.addressLine1,
          savedAddress.addressLine2,
        ]
          .filter(Boolean)
          .join(", "),
        city: savedAddress.city || "",
        state: savedAddress.state || "",
        pincode: savedAddress.pincode || "",
      }));
    } catch (error) {
      console.error("Unable to load saved address:", error);
    }
  };

  loadSavedAddress();

  return () => {
    active = false;
  };
}, []);

  
const handleOnlinePayment = async (savedAddress) => {
  const loaded = await loadRazorpayScript();

  if (!loaded || !window.Razorpay) {
    throw new Error("Unable to load Razorpay Checkout.");
  }

  // Create order through Spring Boot
  const paymentOrder = isBuyNow
    ? await createOnlineOrder(
        savedAddress.id,
        buyNowProduct.id,
        buyNowQuantity
      )
    : await createOnlineOrder(savedAddress.id);

  const options = {
    key: paymentOrder.keyId,
    amount: paymentOrder.amount,
    currency: paymentOrder.currency,
    name: "ShopSphere",
    description: "Online Shopping Payment",
    order_id: paymentOrder.razorpayOrderId,

    prefill: {
      name: form.fullName,
      email: form.email,
      contact: form.phone,
    },

    theme: {
      color: "#FF6B00",
    },

    handler: async (response) => {
      try {
        // Verify payment with Spring Boot
        const verifiedOrder = await verifyOnlinePayment(
          paymentOrder.orderId,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        const order = {
          id: verifiedOrder.orderId,
          customer: { ...form },
          items: [...checkoutItems],
          total: verifiedOrder.totalAmount,
          paymentMethod: verifiedOrder.paymentMethod,
          status: verifiedOrder.orderStatus,
          createdAt: verifiedOrder.orderDate,
        };

        localStorage.setItem(
          "shopsphere_last_order",
          JSON.stringify(order)
        );

        if (!isBuyNow) {
          await refreshCart();
        }

        navigate("/order-success", {
          state: { order },
        });
      } catch (error) {
        console.error("Payment verification failed:", error);
        alert(
          "Payment may have succeeded, but order confirmation is pending. " +
          "Please check your order history before trying again."
        );
      } finally {
        setPlacingOrder(false);
      }
    },

    modal: {
      ondismiss: () => {
        setPlacingOrder(false);
      },
    },
  };

  const razorpay = new window.Razorpay(options);

  razorpay.on("payment.failed", (response) => {
    console.error("Razorpay payment failed:", response.error);
    alert("Payment failed. Please try again.");
    setPlacingOrder(false);
  });

  razorpay.open();
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (checkoutItems.length === 0 || placingOrder) return;

  
const {
  fullName,
  phone,
  email,
  address,
  city,
  state,
  pincode,
} = form;

const newErrors = {};

if (!fullName.trim()) {
  newErrors.fullName = "Full Name is required";
} else if (!/^[A-Za-z\s]+$/.test(fullName.trim())) {
  newErrors.fullName = "Full Name should contain only characters or alphabets";
}

if (!phone.trim()) {
  newErrors.phone = "Phone Number is required";
} else if (!/^[0-9]{10}$/.test(phone.trim())) {
  newErrors.phone = "Enter a valid 10-digit phone number";
}

if (!email.trim()) {
  newErrors.email = "Email Address is required";
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
  newErrors.email = "Enter a valid email address";
}

if (!address.trim()) {
  newErrors.address = "Complete Address is required";
}

if (!city.trim()) {
  newErrors.city = "City is required";
} else if (!/^[A-Za-z\s]+$/.test(city.trim())) {
  newErrors.city = "City should contain only characters or alphabets";
}

if (!state.trim()) {
  newErrors.state = "State is required";
} else if (!/^[A-Za-z\s]+$/.test(state.trim())) {
  newErrors.state = "State should contain only characters or alphabets";
}

if (!pincode.trim()) {
  newErrors.pincode = "PIN Code is required";
} else if (!/^\d{6}$/.test(pincode.trim())) {
  newErrors.pincode = "PIN Code must contain exactly 6 digits";
}

setFormErrors(newErrors);

if (Object.keys(newErrors).length > 0) {
  return;
}


  

  const token = sessionStorage.getItem("shopsphere_token");

  if (!token) {
    alert("Please log in to place your order.");
    navigate("/login");
    return;
  }

  setPlacingOrder(true);

  try {
    // Step 1: Save delivery address in MySQL
    const savedAddress = await saveDeliveryAddress(form);

    // Open Razorpay for all online payment methods
if (paymentMethod !== "cod") {
  await handleOnlinePayment(savedAddress);
  return;
}

    // Step 2: Place COD order using saved address ID
    // Step 2: Place Buy Now or normal cart COD order
const savedOrder = isBuyNow
  ? await placeBuyNowCodOrder(
      savedAddress.id,
      buyNowProduct.id,
      buyNowQuantity
    )
  : await placeCodOrder(savedAddress.id);

    // Step 3: Prepare order confirmation details
    const order = {
      id: savedOrder.orderId,
      customer: { ...form },
      items: [...checkoutItems],
      total: savedOrder.totalAmount,
      paymentMethod: savedOrder.paymentMethod,
      status: savedOrder.orderStatus,
      createdAt: savedOrder.orderDate,
    };

    localStorage.setItem(
      "shopsphere_last_order",
      JSON.stringify(order)
    );

    // The backend should clear the purchased items.
    // Refresh the frontend cart from MySQL.
    // Normal checkout changes the cart.
// Buy Now leaves existing cart products untouched.
if (!isBuyNow) {
  await refreshCart();
}

    navigate("/order-success", {
      state: { order },
    });
  } catch (error) {
    console.error("Order placement failed:", error);
    setPlacingOrder(false);

    alert(
      error.response?.data?.message ||
        "Unable to place your order. Please try again."
    );
  } finally {
  if (paymentMethod === "cod") {
    setPlacingOrder(false);
  }
}
};

  if (checkoutItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="container-fluid px-3 px-lg-4 py-5 text-center">
          <h2 className="fw-bold">Your cart is empty</h2>
          <p className="text-secondary">
            Add products before proceeding to checkout.
          </p>
          <Link to="/products" className="checkout-primary-btn">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page py-4">
      <div className="container-fluid px-3 px-lg-4">
        <h1 className="fw-bold checkout-title mb-4">
          Secure Checkout
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <section className="checkout-card mb-4">
                <h4 className="checkout-section-title">
                  <MapPin size={22} />
                  Delivery Information
                </h4>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.fullName && (
  <small className="text-danger d-block mt-1">
    {formErrors.fullName}
  </small>
)}
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-control"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      title="Enter a 10-digit mobile number"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.phone && (
  <small className="text-danger d-block mt-1">
    {formErrors.phone}
  </small>
)}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-control"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.email && (
  <small className="text-danger d-block mt-1">
    {formErrors.email}
  </small>
)}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Complete Address</label>
                    <textarea
                      className="form-control"
                      name="address"
                      rows={3}
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.address && (
  <small className="text-danger d-block mt-1">
    {formErrors.address}
  </small>
)}
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">City</label>
                    <input
                      className="form-control"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.city && (
  <small className="text-danger d-block mt-1">
    {formErrors.city}
  </small>
)}
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">State</label>
                    <input
                      className="form-control"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.state && (
  <small className="text-danger d-block mt-1">
    {formErrors.state}
  </small>
)}
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">PIN Code</label>
                    <input
                      className="form-control"
                      name="pincode"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      title="Enter a 6-digit PIN code"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.pincode && (
  <small className="text-danger d-block mt-1">
    {formErrors.pincode}
  </small>
)}
                  </div>
                </div>
              </section>

              <section className="checkout-card">
                <h4 className="checkout-section-title">
                  <CreditCard size={22} />
                  Payment Method
                </h4>

                <label className="checkout-payment-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <Banknote size={21} />
                  <span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives</small>
                  </span>
                </label>

                

<label className="checkout-payment-option">
  <input
    type="radio"
    name="payment"
    checked={paymentMethod === "online"}
    onChange={() => setPaymentMethod("online")}
  />

  <CreditCard size={21} />

  <span>
    <strong>Online Payment</strong>
    <small>
      Pay securely using UPI, Cards, Net Banking or Wallets
    </small>
  </span>
</label>


              </section>
            </div>

            <div className="col-12 col-lg-4">
              <section className="checkout-card checkout-summary">
                <h4 className="fw-bold mb-4">Order Summary</h4>

                {checkoutItems.map((item) => (
                  <div
                    key={item.id}
                    className="checkout-summary-item"
                  >
                    <img src={item.image} alt={item.name} />
                    <div className="flex-grow-1">
                      <p className="fw-semibold small mb-1">
                        {item.name}
                      </p>
                      <small className="text-secondary">
                        Qty: {item.quantity}
                      </small>
                    </div>
                    <strong className="small">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}

                <hr />

                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal ({checkoutCount} items)</span>
<span>{formatPrice(checkoutTotal)}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Delivery</span>
                  <span className="text-success fw-semibold">
                    FREE
                  </span>
                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <strong className="fs-5">Total</strong>
                  <strong className="checkout-total">
  {formatPrice(checkoutTotal)}
</strong>
                </div>

                <button
  type="submit"
  className="checkout-primary-btn w-100"
  disabled={placingOrder}
>
  <CheckCircle2 size={19} />
  {placingOrder ? "Placing Order..." : "Place Order"}
</button>

                <p className="checkout-security mt-3">
                  <ShieldCheck size={17} />
                  Demo checkout — no real purchase or payment
                </p>
              </section>

              <Link
                to="/cart"
                className="checkout-back-link mt-3"
              >
                <ArrowLeft size={17} />
                Back to Cart
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
