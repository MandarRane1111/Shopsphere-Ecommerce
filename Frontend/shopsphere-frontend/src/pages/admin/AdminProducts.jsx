import { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../services/apiConfig";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  RefreshCw,
  ImageOff,
} from "lucide-react";
import axios from "axios";


const API = API_BASE_URL;

const productApi = axios.create({
  baseURL: API,
  timeout: 15000,
});

productApi.interceptors.request.use((config) => {
  // Stateless JWT authentication; no server-side admin session.
  const token = localStorage.getItem("shopsphere_admin_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  brand: "",
  categoryId: "",
};

function getErrorMessage(error) {
  if (error.response?.status === 401) {
    return "Authentication required. Please configure a valid admin JWT.";
  }

  if (error.response?.status === 403) {
    return "Access denied. Your JWT must belong to an administrator.";
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setPageError("");

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        productApi.get("/products"),
        productApi.get("/categories"),
      ]);

      setProducts(
        Array.isArray(productsResponse.data) ? productsResponse.data : []
      );

      setCategories(
        Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : []
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [
          product.name,
          product.brand,
          product.description,
          product.category?.name,
        ].some((value) => String(value || "").toLowerCase().includes(query));

      const matchesCategory =
        categoryFilter === "all" ||
        String(product.category?.id ?? "") === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setPageError("");
    setSuccessMessage("");
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      imageUrl: product.imageUrl || "",
      brand: product.brand || "",
      categoryId: String(product.category?.id ?? ""),
    });
    setErrors({});
    setPageError("");
    setSuccessMessage("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleChange = (event) => {
  const { name, value } = event.target;

  setForm((previous) => ({
    ...previous,
    [name]: value,
  }));

  // Clear only the edited field's error.
  setErrors((previous) => ({
    ...previous,
    [name]: "",
  }));
};

  
const validateForm = () => {
  const nextErrors = {};

  const name = form.name.trim();
  const brand = form.brand.trim();
  const description = form.description.trim();
  const priceText = form.price.trim();
  const stockText = form.stock.trim();

  // Product name: letters required; numbers and spaces are allowed.
  if (!name) {
    nextErrors.name = "Product name is required.";
  } else if (!/[a-zA-Z]/.test(name)) {
    nextErrors.name =
      "Product name should not contain only numbers.";
  } else if (name.length < 2) {
    nextErrors.name =
      "Product name must contain at least 2 characters.";
  }

  // Brand: optional, but when provided it must contain a letter.
  if (brand && !/[a-zA-Z]/.test(brand)) {
    nextErrors.brand =
      "Brand name should not contain only numbers.";
  } else if (brand.length > 100) {
    nextErrors.brand = "Brand cannot exceed 100 characters.";
  }

  // Description: letters required; numbers are allowed alongside text.
  if (!description) {
    nextErrors.description = "Description is required.";
  } else if (!/[a-zA-Z]/.test(description)) {
    nextErrors.description =
      "Description must contain at least one letter.";
  } else if (description.length < 10) {
    nextErrors.description =
      "Description must contain at least 10 characters.";
  } else if (description.length > 3000) {
    nextErrors.description =
      "Description cannot exceed 3000 characters.";
  }

  // Price: positive numeric value only.
  if (!priceText) {
    nextErrors.price = "Price is required.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(priceText)) {
    nextErrors.price =
      "Price must contain numbers only, with up to 2 decimal places.";
  } else if (!Number.isFinite(Number(priceText)) ||
             Number(priceText) <= 0) {
    nextErrors.price = "Price must be greater than zero.";
  }

  // Stock: whole number only; zero is allowed.
  if (!stockText) {
    nextErrors.stock = "Stock is required.";
  } else if (!/^\d+$/.test(stockText)) {
    nextErrors.stock =
      "Stock must contain whole numbers only.";
  } else if (!Number.isSafeInteger(Number(stockText))) {
    nextErrors.stock = "Enter a valid stock quantity.";
  }

  // Category is required.
  if (!form.categoryId) {
    nextErrors.categoryId = "Please select a category.";
  }

  // Image URL is optional. Allow local image paths and HTTP/HTTPS URLs.
if (form.imageUrl.trim()) {
  const imageUrl = form.imageUrl.trim();

  // Allow local paths such as /images/samsung-s24.png
  if (imageUrl.startsWith("/images/")) {
    // Valid local image path.
  } else {
    try {
      const url = new URL(imageUrl);

      if (!["http:", "https:"].includes(url.protocol)) {
        nextErrors.imageUrl =
          "Image URL must use HTTP or HTTPS.";
      }
    } catch {
      nextErrors.imageUrl = "Enter a valid image URL.";
    }
  }
}

  setErrors(nextErrors);

  return Object.keys(nextErrors).length === 0;
};


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setPageError("");

    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || null,
      brand: form.brand.trim() || null,
      category: {
        id: Number(form.categoryId),
      },
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await productApi.put(`/products/${editingId}`, payload);
        setSuccessMessage("Product updated successfully.");
      } else {
        await productApi.post("/products", payload);
        setSuccessMessage("Product added successfully.");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setErrors({});

      await loadData();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setPageError("");
    setSuccessMessage("");

    try {
      await productApi.delete(`/products/${product.id}`);
      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
      setSuccessMessage(`"${product.name}" was deleted successfully.`);
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <section className="ap-products">
      <div className="ap-heading">
        <div>
          <h2>Product Management</h2>
          <p>Add, update and manage products in your ShopSphere store.</p>
        </div>

        <button className="ap-primary-button" onClick={openAddModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="ap-summary">
        <div className="ap-summary-icon">
          <Package size={23} />
        </div>
        <div>
          <span>Total products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="ap-summary-divider" />
        <div>
          <span>Low stock (5 or less)</span>
          <strong>
            {products.filter(
              (product) => Number(product.stock) <= 5
            ).length}
          </strong>
        </div>
      </div>

      {pageError && (
        <div className="ap-alert ap-alert-error" role="alert">
          {pageError}
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setPageError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="ap-alert ap-alert-success" role="status">
          {successMessage}
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccessMessage("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="ap-toolbar">
        <div className="ap-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, brand or category..."
            aria-label="Search products"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
          className="ap-filter"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>

        <button
          className="ap-refresh-button"
          type="button"
          onClick={loadData}
          disabled={loading}
          title="Refresh products"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="ap-table-card">
        {loading ? (
          <div className="ap-state">
            <RefreshCw className="ap-spin" size={24} />
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="ap-state">
            <Package size={38} />
            <h3>No products found</h3>
            <p>
              {products.length === 0
                ? "Add your first product to get started."
                : "Try changing your search or category filter."}
            </p>
            {products.length === 0 && (
              <button className="ap-primary-button" onClick={openAddModal}>
                <Plus size={17} />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="ap-table-scroll">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Brand</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="ap-product-cell">
                        <div className="ap-product-image">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                                event.currentTarget.nextSibling.style.display =
                                  "grid";
                              }}
                            />
                          ) : null}
                          <div
                            className="ap-image-fallback"
                            style={{
                              display: product.imageUrl ? "none" : "grid",
                            }}
                          >
                            <ImageOff size={19} />
                          </div>
                        </div>
                        <div className="ap-product-info">
                          <strong>{product.name}</strong>
                          <span>SKU #{product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name || "Uncategorized"}</td>
                    <td className="ap-price">{formatPrice(product.price)}</td>
                    <td>
                      <span
                        className={`ap-stock ${
                          Number(product.stock) <= 5 ? "low" : "available"
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>
                    <td>{product.brand || "—"}</td>
                    <td>
                      <div className="ap-actions">
                        <button
                          type="button"
                          className="ap-edit-button"
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="ap-delete-button"
                          onClick={() => handleDelete(product)}
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="ap-table-footer">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="ap-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="ap-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ap-modal-title"
          >
            <div className="ap-modal-heading">
              <div>
                <h2 id="ap-modal-title">
                  {editingId !== null ? "Edit Product" : "Add New Product"}
                </h2>
                <p>Enter the product details below.</p>
              </div>
              <button
                type="button"
                className="ap-close-button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="ap-form-grid">
                <div className="ap-field ap-field-full">
                  <label htmlFor="ap-name">Product Name *</label>
                  <input
                    id="ap-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="e.g. Wireless Headphones"
                  />
                  {errors.name && <small>{errors.name}</small>}
                </div>

                <div className="ap-field">
                  <label htmlFor="ap-brand">Brand</label>
                  <input
                    id="ap-brand"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. Sony"
                  />
                  {errors.brand && <small>{errors.brand}</small>}
                </div>

                <div className="ap-field">
                  <label htmlFor="ap-category">Category *</label>
                  <select
                    id="ap-category"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <small>{errors.categoryId}</small>}
                </div>

                <div className="ap-field">
                  <label htmlFor="ap-price">Price (₹) *</label>
                  <input
                    id="ap-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="4999"
                  />
                  {errors.price && <small>{errors.price}</small>}
                </div>

                <div className="ap-field">
                  <label htmlFor="ap-stock">Stock Quantity *</label>
                  <input
                    id="ap-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="25"
                  />
                  {errors.stock && <small>{errors.stock}</small>}
                </div>

                <div className="ap-field ap-field-full">
                  <label htmlFor="ap-image">Image URL</label>
                  <input
                    id="ap-image"
                    name="imageUrl"
                    type="text"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/product.jpg"
                  />
                  {errors.imageUrl && <small>{errors.imageUrl}</small>}
                </div>

                <div className="ap-field ap-field-full">
                  <label htmlFor="ap-description">Description *</label>
                  <textarea
                    id="ap-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={3000}
                    placeholder="Describe the product and its features..."
                  />
                  <div className="ap-character-count">
                    {form.description.length}/3000
                  </div>
                  {errors.description && (
                    <small>{errors.description}</small>
                  )}
                </div>
              </div>

              <div className="ap-modal-actions">
                <button
                  type="button"
                  className="ap-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ap-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
