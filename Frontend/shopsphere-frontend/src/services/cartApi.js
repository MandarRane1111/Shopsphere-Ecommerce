
import axios from "axios";
import API_BASE_URL from "./apiConfig";

const cartApi = axios.create({
  baseURL: `${API_BASE_URL}/cart`,
  withCredentials: true,
  timeout: 10000,
});

// Send JWT with every cart request
cartApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("shopsphere_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Get logged-in customer's cart
export const getCart = async () => {
  const response = await cartApi.get("");
  return response.data;
};

// Add product to MySQL cart
export const addCartItem = async (productId, quantity = 1) => {
  const response = await cartApi.post("/add", {
    productId,
    quantity,
  });

  return response.data;
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  const response = await cartApi.put(`/${itemId}`, {
    quantity,
  });

  return response.data;
};

// Remove item from cart
export const removeCartItem = async (itemId) => {
  await cartApi.delete(`/${itemId}`);
};

export default cartApi;
