
import axios from "axios";
import API_BASE_URL from "./apiConfig";

const productApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Fetch all products from Spring Boot / MySQL
export const getAllProducts = async () => {
  const response = await productApi.get("/products");
  return response.data;
};

export default productApi;
