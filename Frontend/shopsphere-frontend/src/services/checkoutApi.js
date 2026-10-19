import axios from "axios";
import API_BASE_URL from "./apiConfig";

const checkoutApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

checkoutApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("shopsphere_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Save delivery address in MySQL
export const saveDeliveryAddress = async (form) => {
  const addressData = {
  fullName: form.fullName.trim(),
  phone: form.phone.trim(),
  addressLine1: form.address.trim(),
  addressLine2: (form.addressLine2 || "").trim(),
  landmark: (form.landmark || "").trim(),
  city: form.city.trim(),
  state: form.state.trim(),
  pincode: form.pincode.trim(),
};

  const normalize = (value) =>
    String(value ?? "").trim().toLowerCase();

  // Check whether the customer already saved this address.
  const response = await checkoutApi.get("/addresses");
  const addresses = Array.isArray(response.data) ? response.data : [];

  const existingAddress = addresses.find((address) =>
    Object.keys(addressData).every(
      (key) =>
        normalize(address[key]) === normalize(addressData[key])
    )
  );

  // Reuse the existing address ID.
  if (existingAddress) {
    return existingAddress;
  }

  // Save only when the address is new or has changed.
  const savedResponse = await checkoutApi.post(
    "/addresses",
    addressData
  );

  return savedResponse.data;
};

// Place Cash on Delivery order
export const placeCodOrder = async (addressId) => {
  const response = await checkoutApi.post("/orders/cod", {
    addressId,
  });

  return response.data;
};

export const placeBuyNowCodOrder = async (
  addressId,
  productId,
  quantity
) => {
  const response = await checkoutApi.post("/orders/buy-now/cod", {
    addressId,
    productId,
    quantity,
  });

  return response.data;
};

// Retrieve customer's order history
export const getMyOrders = async () => {
  const response = await checkoutApi.get("/orders/my");
  return response.data;
};

// Cancel an order belonging to the logged-in customer
export const cancelMyOrder = async (orderId) => {
  const response = await checkoutApi.put(
    `/orders/${orderId}/cancel`
  );

  return response.data;
};

// Retrieve logged-in customer's saved addresses
export const getMyAddresses = async () => {
  const response = await checkoutApi.get("/addresses");
  return response.data;
};

// Update an existing delivery address
export const updateDeliveryAddress = async (addressId, addressData) => {
  const response = await checkoutApi.put(
    `/addresses/${addressId}`,
    addressData
  );

  return response.data;
};

// Delete a saved delivery address
export const deleteDeliveryAddress = async (addressId) => {
  const response = await checkoutApi.delete(
    `/addresses/${addressId}`
  );

  return response.data;
};


 // Create Razorpay order for Cart or Buy Now
export const createOnlineOrder = async (
  addressId,
  productId = null,
  quantity = null
) => {
  const response = await checkoutApi.post("/orders/online", {
    addressId,
    ...(productId != null && { productId, quantity }),
  });

  return response.data;
};

// Verify Razorpay payment with Spring Boot
export const verifyOnlinePayment = async (
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  const response = await checkoutApi.post(
    "/orders/verify-payment",
    {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }
  );

  return response.data;
};



export const downloadInvoice = async (orderId) => {
  const response = await checkoutApi.get(
    `/invoices/${orderId}`,
    {
      responseType: "blob",
    }
  );

  const pdfBlob = new Blob([response.data], {
    type: "application/pdf",
  });

  const downloadUrl = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = `ShopSphere_Invoice_${orderId}.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);
};



export default checkoutApi;
