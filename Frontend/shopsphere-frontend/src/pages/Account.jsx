import axios from "axios";
import API_BASE_URL from "../services/apiConfig";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleUserRound,
  UserRound,
  Mail,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  Pencil,
  Plus,
  X,
  Home,
  MapPinned,
  Download,
  XCircle
} from "lucide-react";

import {
  getMyOrders,
  getMyAddresses,
  saveDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  cancelMyOrder,
  downloadInvoice,
} from "../services/checkoutApi";

import {
  getMyProfile,
  updateMyProfile,
} from "../services/authApi";

import "../styles/account.css";

const emptyAddressForm = {
  address: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressSaveError, setAddressSaveError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);



  // Load the logged-in user's profile.
  useEffect(() => {
    const token = sessionStorage.getItem("shopsphere_token");
    const savedUser = sessionStorage.getItem("shopsphere_user");

    if (!token || !savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const profile = await getMyProfile();

        if (!active) return;

        setUser(profile);
        setProfileForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
        });

        sessionStorage.setItem(
          "shopsphere_user",
          JSON.stringify(profile)
        );
      } catch (error) {
        console.error("Unable to load profile:", error);

        if (
          active &&
          (error.response?.status === 401 ||
            error.response?.status === 403)
        ) {
          sessionStorage.removeItem("shopsphere_token");
          sessionStorage.removeItem("shopsphere_user");
          navigate("/login", { replace: true });
          return;
        }

        if (active) {
          try {
            const cachedUser = JSON.parse(savedUser);
            setUser(cachedUser);
            setProfileForm({
              name: cachedUser.name || "",
              email: cachedUser.email || "",
              phone: cachedUser.phone || "",
            });
            setProfileError(
              "Unable to refresh your profile. Please try again."
            );
          } catch {
            navigate("/login", { replace: true });
          }
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Load orders.
  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const data = await getMyOrders();
        if (active) setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Unable to load orders:", error);
        if (active) setOrdersError("Unable to load your orders.");
      } finally {
        if (active) setOrdersLoading(false);
      }
    };

    if (sessionStorage.getItem("shopsphere_token")) {
      loadOrders();
    } else {
      setOrdersLoading(false);
    }

    return () => {
      active = false;
    };
  }, []);

  // Load and de-duplicate addresses.
  useEffect(() => {
    let active = true;

    const loadAddresses = async () => {
      try {
        const data = await getMyAddresses();
        if (!active) return;

        const uniqueAddresses = Array.isArray(data)
          ? data.filter((address, index, allAddresses) => {
              const key = (item) =>
                [
                  item.addressLine1,
                  item.addressLine2,
                  item.landmark,
                  item.city,
                  item.state,
                  item.pincode,
                ]
                  .map((value) =>
                    String(value ?? "").trim().toLowerCase()
                  )
                  .join("|");

              return (
                allAddresses.findIndex(
                  (item) => key(item) === key(address)
                ) === index
              );
            })
          : [];

        setAddresses(uniqueAddresses);
      } catch (error) {
        console.error("Unable to load addresses:", error);
        if (active) {
          setAddressesError("Unable to load your addresses.");
        }
      } finally {
        if (active) setAddressesLoading(false);
      }
    };

    if (sessionStorage.getItem("shopsphere_token")) {
      loadAddresses();
    } else {
      setAddressesLoading(false);
    }

    return () => {
      active = false;
    };
  }, []);

  
  // PROFILE
  const handleOpenProfile = () => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setProfileErrors({});
    setProfileError("");
    setProfileSuccess("");
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (profileSaving) return;

    const { name, email, phone } = profileForm;
    const errors = {};

    if (!name.trim()) {
      errors.name = "Full Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      errors.name = "Full Name should contain only letters";
    }

    if (!email.trim()) {
      errors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!phone.trim()) {
      errors.phone = "Phone Number is required";
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    setProfileErrors(errors);
    setProfileError("");

    if (Object.keys(errors).length > 0) return;

    setProfileSaving(true);
    setProfileSuccess("");

    try {
      const updatedProfile = await updateMyProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      if (updatedProfile.token) {
        sessionStorage.setItem(
          "shopsphere_token",
          updatedProfile.token
        );
      }

      const userForStorage = {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        role: updatedProfile.role,
      };

      sessionStorage.setItem(
        "shopsphere_user",
        JSON.stringify(userForStorage)
      );

      setUser(userForStorage);
      setProfileForm({
        name: updatedProfile.name || "",
        email: updatedProfile.email || "",
        phone: updatedProfile.phone || "",
      });

      setProfileErrors({});
      window.dispatchEvent(new Event("shopsphere-auth-change"));
      setProfileSuccess("Profile updated successfully!");
      setProfileModalOpen(false);
    } catch (error) {
      console.error("Unable to update profile:", error);
      setProfileError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // ADDRESS FORM
  
const handleAddressChange = (event) => {
  const { name, value } = event.target;

  // Keep PIN Code numeric and limit it to six digits.
  const nextValue =
    name === "pincode"
      ? value.replace(/\D/g, "").slice(0, 6)
      : value;

  setAddressForm((previous) => ({
    ...previous,
    [name]: nextValue,
  }));

  // Clear only the edited field's error.
  setAddressErrors((previous) => ({
    ...previous,
    [name]: "",
  }));

  setAddressSaveError("");
};


  const handleOpenAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({ ...emptyAddressForm });
    setAddressErrors({});
    setAddressSaveError("");
    setAddressModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);

    setAddressForm({
      address: address.addressLine1 || address.address || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });

    setAddressErrors({});
    setAddressSaveError("");
    setAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    if (addressSaving) return;

    setAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressForm({ ...emptyAddressForm });
    setAddressErrors({});
    setAddressSaveError("");
  };

  

const handleSaveAddress = async () => {
  if (addressSaving) return;

  const {
    address,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
  } = addressForm;

  const errors = {};

  // Address Line 1: required; must contain letters, not only numbers.
  if (!address.trim()) {
    errors.address = "Address Line 1 is required";
  } else if (address.trim().length < 5) {
    errors.address =
      "Address Line 1 must contain at least 5 characters";
  } else if (!/[A-Za-z]/.test(address.trim())) {
    errors.address =
      "Address Line 1 cannot contain only numbers";
  } else if (!/^[A-Za-z0-9\s,./#'-]+$/.test(address.trim())) {
    errors.address =
      "Address Line 1 contains invalid characters";
  }

  // Address Line 2: optional; if provided, require a combination
  // containing at least one letter.
  if (addressLine2.trim()) {
    if (addressLine2.trim().length < 3) {
      errors.addressLine2 =
        "Address Line 2 must contain at least 3 characters";
    } else if (!/[A-Za-z]/.test(addressLine2.trim())) {
      errors.addressLine2 =
        "Address Line 2 cannot contain only numbers";
    } else if (!/^[A-Za-z0-9\s,./#'-]+$/.test(addressLine2.trim())) {
      errors.addressLine2 =
        "Address Line 2 contains invalid characters";
    }
  }

  // Landmark: optional; if provided, require at least one letter.
  if (landmark.trim()) {
    if (landmark.trim().length < 3) {
      errors.landmark =
        "Landmark must contain at least 3 characters";
    } else if (!/[A-Za-z]/.test(landmark.trim())) {
      errors.landmark =
        "Landmark cannot contain only numbers";
    } else if (!/^[A-Za-z0-9\s,./#'-]+$/.test(landmark.trim())) {
      errors.landmark = "Landmark contains invalid characters";
    }
  }

  // City: letters and spaces only.
  if (!city.trim()) {
    errors.city = "City is required";
  } else if (!/^[A-Za-z\s]+$/.test(city.trim())) {
    errors.city = "City should contain only letters and spaces";
  } else if (city.trim().length < 2) {
    errors.city = "City must contain at least 2 characters";
  }

  // State: letters and spaces only.
  if (!state.trim()) {
    errors.state = "State is required";
  } else if (!/^[A-Za-z\s]+$/.test(state.trim())) {
    errors.state = "State should contain only letters and spaces";
  } else if (state.trim().length < 2) {
    errors.state = "State must contain at least 2 characters";
  }

  // PIN Code: exactly six digits, with no letters or symbols.
  if (!pincode.trim()) {
    errors.pincode = "PIN Code is required";
  } else if (!/^[0-9]{6}$/.test(pincode.trim())) {
    errors.pincode = "PIN Code must contain exactly 6 digits";
  }

  setAddressErrors(errors);
  setAddressSaveError("");

  // Prevent API submission when any field is invalid.
  if (Object.keys(errors).length > 0) return;

  setAddressSaving(true);

  try {
    const addressData = {
      fullName: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      address: address.trim(),
      addressLine1: address.trim(),
      addressLine2: addressLine2.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    if (editingAddressId !== null) {
      await updateDeliveryAddress(editingAddressId, {
        fullName: addressData.fullName,
        phone: addressData.phone,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        landmark: addressData.landmark,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
      });
    } else {
      await saveDeliveryAddress(addressData);
    }

    const updatedAddresses = await getMyAddresses();

    setAddresses(
      Array.isArray(updatedAddresses) ? updatedAddresses : []
    );

    setAddressesError("");
    setAddressModalOpen(false);
    setAddressForm({ ...emptyAddressForm });
    setAddressErrors({});
    setAddressSaveError("");
    setEditingAddressId(null);

    alert(
      editingAddressId !== null
        ? "Address updated successfully!"
        : "Address saved successfully!"
    );
  } catch (error) {
    console.error("Unable to save address:", error);

    setAddressSaveError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to save address. Please try again."
    );
  } finally {
    setAddressSaving(false);
  }
};



  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    try {
      await deleteDeliveryAddress(addressId);

      const updatedAddresses = await getMyAddresses();

      setAddresses(
        Array.isArray(updatedAddresses) ? updatedAddresses : []
      );

      setAddressesError("");
      alert("Address deleted successfully!");
    } catch (error) {
      console.error("Unable to delete address:", error);
      alert(
        error.response?.data?.message ||
          "Unable to delete address. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem("shopsphere_token");

    try {
      if (token) {
        await axios.post(
          `${API_BASE_URL}/session/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      sessionStorage.removeItem("shopsphere_token");
      sessionStorage.removeItem("shopsphere_user");
      window.dispatchEvent(new Event("shopsphere-auth-change"));
      window.location.replace("/login");
    }
  };

  

const handleDownloadInvoice = async (order) => {
  if (
    String(order.orderStatus || "").toUpperCase() !== "DELIVERED"
  ) {
    return;
  }

  try {
    await downloadInvoice(order.orderId);
  } catch (error) {
    console.error("Unable to download invoice:", error);
    window.alert(
      "Unable to download the backend invoice. Please try again."
    );
  }
};



const canCancelOrder = (order) => {
  const status = String(order.orderStatus || "").toUpperCase();
  const method = String(order.paymentMethod || "").toUpperCase();
  const paymentStatus = String(
    order.paymentStatus || ""
  ).toUpperCase();

  return (
    (method === "COD" && status === "CONFIRMED") ||
    (method === "ONLINE" &&
      status === "PENDING_PAYMENT" &&
      paymentStatus === "PENDING")
  );
};


  if (!user) return null;

  return (
    <main className="account-page">
      <div className="account-container">
        <div className="account-page-heading">
          <h1>My Account</h1>
          <p>Manage your ShopSphere account and shopping activity.</p>
        </div>

        <div className="account-profile-card">
          <div className="account-profile-avatar">
            <CircleUserRound size={44} strokeWidth={1.5} />
          </div>

          <div className="account-profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="account-role">
              <ShieldCheck size={14} />
              {user.role}
            </span>
          </div>
        </div>

        {profileSuccess && (
          <p className="text-success">{profileSuccess}</p>
        )}

        <div className="account-section-heading">
          <h2>Account Overview</h2>
          <p>Your personal details and shopping information.</p>
        </div>

        <div className="account-options-grid">
          {/* MY PROFILE */}
          <div className="account-option-card">
            <div className="account-option-icon">
              <UserRound size={24} />
            </div>

            <h3>My Profile</h3>

            <div className="account-profile-detail">
              <UserRound size={16} />
              <span>{user.name}</span>
            </div>

            <div className="account-profile-detail">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>

            {user.phone && (
              <div className="account-profile-detail">
                <span>{user.phone}</span>
              </div>
            )}

            <button
              type="button"
              className="btn text-white mt-3"
              style={{ backgroundColor: "#ff6b00" }}
              onClick={handleOpenProfile}
            >
              <Pencil size={15} className="me-2" />
              Edit Profile
            </button>
          </div>

          {/* MY ORDERS */}
          <div className="account-option-card">
            <div className="account-option-icon">
              <Package size={24} />
            </div>

            <h3>My Orders</h3>
            <p>View your purchases, track orders and check order history.</p>

            
{ordersLoading ? (
  <span className="text-secondary">Loading orders...</span>
) : ordersError ? (
  <span className="text-danger">{ordersError}</span>
) : (
  (() => {
    const activeOrders = orders
      .filter(
        (order) =>
          String(order.orderStatus || "").toUpperCase() !==
          "CANCELLED"
      )
      .sort(
        (a, b) =>
          new Date(b.orderDate).getTime() -
          new Date(a.orderDate).getTime()
      );

    const latestOrders = activeOrders.slice(0, 2);

    return activeOrders.length === 0 ? (
      <span className="text-secondary">
        No active orders found.
      </span>
    ) : (
      <div>
        <p className="fw-semibold mb-2">
          Total Orders: {activeOrders.length}
        </p>

        {latestOrders.map((order) => {
          const status = String(
            order.orderStatus || ""
          ).toUpperCase();

          return (
            <div
              key={order.orderId}
              className="border rounded p-2 mb-2"
            >
              <div className="d-flex justify-content-between gap-2">
                <strong>Order #{order.orderId}</strong>

                <span
                  className={`small ${
                    status === "DELIVERED"
                      ? "text-success"
                      : "text-primary"
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="small text-secondary mt-1">
                {order.orderDate
                  ? new Date(
                      order.orderDate
                    ).toLocaleDateString("en-IN")
                  : "Date unavailable"}
              </div>

              <div className="fw-semibold mt-1">
                ₹
                {Number(
                  order.totalAmount || 0
                ).toLocaleString("en-IN")}
              </div>

              <div className="small text-secondary mb-2">
                Payment: {order.paymentMethod}
              </div>

              <div className="d-flex flex-wrap gap-2">
                {canCancelOrder(order) && (
                  <button
                    type="button"
                    className="btn btn-sm d-inline-flex align-items-center gap-1"
                    style={{
                      backgroundColor: "#fff1f0",
                      color: "#c62828",
                      border: "1px solid #ffc9c5",
                      borderRadius: "7px",
                    }}
                    disabled={
                      cancellingOrderId === order.orderId
                    }
                    onClick={() => handleCancelOrder(order)}
                  >
                    <XCircle size={14} />

                    {cancellingOrderId === order.orderId
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}

                {status === "DELIVERED" && (
                  <button
                    type="button"
                    className="btn btn-sm d-inline-flex align-items-center gap-1"
                    style={{
                      backgroundColor: "#fff0df",
                      color: "#c65300",
                      border: "1px solid #ffd0a3",
                      borderRadius: "7px",
                    }}
                    onClick={() =>
                      handleDownloadInvoice(order)
                    }
                  >
                    <Download size={14} />
                    Download Invoice
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {activeOrders.length > 2 && (
          <button
            type="button"
            onClick={() => navigate("/orders")}
            style={{
              background: "none",
              border: "none",
              color: "#ff6b00",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "8px 0",
              marginTop: "8px",
            }}
          >
            See All Orders →
          </button>
        )}
      </div>
    );
  })()
)}

          </div>

          {/* MY ADDRESSES */}
          <div className="account-option-card">
            <div className="account-option-icon">
              <MapPin size={24} />
            </div>

            <h3>My Addresses</h3>
            <p>Manage your saved delivery addresses.</p>

            <button
              type="button"
              onClick={handleOpenAddressModal}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ff6b00",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              <Plus size={17} />
              Add New Address
            </button>

            {addressesLoading ? (
              <span className="text-secondary">
                Loading addresses...
              </span>
            ) : addressesError ? (
              <span className="text-danger">{addressesError}</span>
            ) : addresses.length === 0 ? (
              <div className="text-secondary">
                <MapPinned size={24} className="mb-2" />
                <p>No saved addresses yet.</p>
              </div>
            ) : (
              <div>
                <p className="fw-semibold mb-2">
                  Saved Addresses: {addresses.length}
                </p>

                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border rounded p-3 mb-3"
                    style={{
                      background: "#fff",
                      borderColor: "#dee2e6",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Home size={17} color="#ff6b00" />
                      <strong>Delivery Address</strong>
                    </div>

                    <div className="small text-secondary">
                      {[
                        address.addressLine1 || address.address,
                        address.addressLine2,
                        address.landmark
                          ? `Landmark: ${address.landmark}`
                          : "",
                        address.city,
                        address.state,
                        address.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>

                    <div className="d-flex gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-sm text-white"
                        style={{
                          backgroundColor: "#142b5f",
                          border: "none",
                        }}
                        onClick={() => handleEditAddress(address)}
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="account-logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          Logout
          <ChevronRight size={18} />
        </button>
      </div>

      {/* PROFILE MODAL */}
      {profileModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "500px", margin: "1rem auto" }}
          >
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit My Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setProfileModalOpen(false)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body">
                {profileError && (
                  <div className="alert alert-danger">
                    {profileError}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      profileErrors.name ? "is-invalid" : ""
                    }`}
                    value={profileForm.name}
                    onChange={(event) => {
                      setProfileForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }));
                      setProfileErrors((previous) => ({
                        ...previous,
                        name: "",
                      }));
                    }}
                  />
                  {profileErrors.name && (
                    <small className="text-danger d-block mt-1">
                      {profileErrors.name}
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      profileErrors.email ? "is-invalid" : ""
                    }`}
                    value={profileForm.email}
                    onChange={(event) => {
                      setProfileForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }));
                      setProfileErrors((previous) => ({
                        ...previous,
                        email: "",
                      }));
                    }}
                  />
                  {profileErrors.email && (
                    <small className="text-danger d-block mt-1">
                      {profileErrors.email}
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className={`form-control ${
                      profileErrors.phone ? "is-invalid" : ""
                    }`}
                    value={profileForm.phone}
                    onChange={(event) => {
                      setProfileForm((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }));
                      setProfileErrors((previous) => ({
                        ...previous,
                        phone: "",
                      }));
                    }}
                  />
                  {profileErrors.phone && (
                    <small className="text-danger d-block mt-1">
                      {profileErrors.phone}
                    </small>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setProfileModalOpen(false)}
                  disabled={profileSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn text-white"
                  style={{ backgroundColor: "#ff6b00" }}
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADDRESS MODAL */}
      {addressModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            overflowY: "auto",
            padding: "16px",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseAddressModal();
            }
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              maxWidth: "600px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px", overflow: "hidden" }}
            >
              <div
                className="modal-header"
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #edf0f4",
                }}
              >
                <div>
                  <h5 className="modal-title fw-bold mb-1">
                    {editingAddressId !== null
                      ? "Update Address"
                      : "Add New Address"}
                  </h5>
                  <p className="text-secondary small mb-0">
                    Enter your delivery location details.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn p-1"
                  onClick={handleCloseAddressModal}
                  disabled={addressSaving}
                  aria-label="Close"
                  style={{ border: "none", background: "transparent" }}
                >
                  <X size={23} />
                </button>
              </div>

              <div
                className="modal-body"
                style={{ padding: "24px" }}
              >
                {addressSaveError && (
                  <div className="alert alert-danger">
                    {addressSaveError}
                  </div>
                )}

                <div className="row g-3">
                  {/* ADDRESS LINE 1 */}
                  <div className="col-12">
                    <label
                      htmlFor="addressLine1"
                      className="form-label fw-semibold"
                    >
                      Address Line 1 <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="addressLine1"
                      name="address"
                      rows={2}
                      className={`form-control ${
                        addressErrors.address ? "is-invalid" : ""
                      }`}
                      placeholder="House number, building, street, area"
                      value={addressForm.address}
                      onChange={handleAddressChange}
                    />
                    {addressErrors.address && (
                      <small className="text-danger d-block mt-1">
                        {addressErrors.address}
                      </small>
                    )}
                  </div>

                  {/* ADDRESS LINE 2 */}
                  <div className="col-12">
                    <label
                      htmlFor="addressLine2"
                      className="form-label fw-semibold"
                    >
                      Address Line 2{" "}
                      <span className="text-secondary fw-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id="addressLine2"
                      type="text"
                      name="addressLine2"
                      className="form-control"
                      placeholder="Apartment, floor, block, etc."
                      value={addressForm.addressLine2}
                      onChange={handleAddressChange}
                    />
                    
{addressErrors.addressLine2 && (
  <small className="text-danger d-block mt-1">
    {addressErrors.addressLine2}
  </small>
)}

                  </div>

                  {/* LANDMARK */}
                  <div className="col-12">
                    <label
                      htmlFor="landmark"
                      className="form-label fw-semibold"
                    >
                      Landmark{" "}
                      <span className="text-secondary fw-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      id="landmark"
                      type="text"
                      name="landmark"
                      className="form-control"
                      placeholder="Nearby landmark"
                      value={addressForm.landmark}
                      onChange={handleAddressChange}
                    />
                    
{addressErrors.landmark && (
  <small className="text-danger d-block mt-1">
    {addressErrors.landmark}
  </small>
)}

                  </div>

                  {/* CITY */}
                  <div className="col-12 col-sm-6">
                    <label
                      htmlFor="city"
                      className="form-label fw-semibold"
                    >
                      City <span className="text-danger">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      className={`form-control ${
                        addressErrors.city ? "is-invalid" : ""
                      }`}
                      placeholder="Enter city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                    />
                    {addressErrors.city && (
                      <small className="text-danger d-block mt-1">
                        {addressErrors.city}
                      </small>
                    )}
                  </div>

                  {/* STATE */}
                  <div className="col-12 col-sm-6">
                    <label
                      htmlFor="state"
                      className="form-label fw-semibold"
                    >
                      State <span className="text-danger">*</span>
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      className={`form-control ${
                        addressErrors.state ? "is-invalid" : ""
                      }`}
                      placeholder="Enter state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                    />
                    {addressErrors.state && (
                      <small className="text-danger d-block mt-1">
                        {addressErrors.state}
                      </small>
                    )}
                  </div>

                  {/* PIN CODE */}
                  <div className="col-12 col-sm-6">
                    <label
                      htmlFor="pincode"
                      className="form-label fw-semibold"
                    >
                      PIN Code <span className="text-danger">*</span>
                    </label>
                    <input
                      id="pincode"
                      type="text"
                      name="pincode"
                      inputMode="numeric"
                      maxLength={6}
                      className={`form-control ${
                        addressErrors.pincode ? "is-invalid" : ""
                      }`}
                      placeholder="6-digit PIN code"
                      value={addressForm.pincode}
                      onChange={handleAddressChange}
                    />
                    {addressErrors.pincode && (
                      <small className="text-danger d-block mt-1">
                        {addressErrors.pincode}
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #edf0f4",
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCloseAddressModal}
                  disabled={addressSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn text-white"
                  style={{
                    backgroundColor: "#ff6b00",
                    borderRadius: "8px",
                    padding: "9px 20px",
                    fontWeight: "600",
                  }}
                  onClick={handleSaveAddress}
                  disabled={addressSaving}
                >
                  {addressSaving
                    ? "Saving..."
                    : editingAddressId !== null
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Account;
