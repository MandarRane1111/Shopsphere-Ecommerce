
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from "lucide-react";

import ProductListItem from "../components/ProductListItem";
import { getAllProducts } from "../services/productApi";

import "../styles/products.css";

const categories = [
  "All Categories",
  "Mobiles",
  "Laptops",
  "Electronics",
  "Home Appliances",
  "Fashion",
  "Accessories",
];

const PRODUCTS_PER_PAGE = 5;

function Products() {
  const [searchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "";

const normalizedCategory = categories.find(
  (category) =>
    category.toLowerCase() ===
    decodeURIComponent(categoryParam)
      .trim()
      .toLowerCase()
) || "All Categories";
  const searchQuery = (
    searchParams.get("name") ||
    searchParams.get("search") ||
    ""
  ).trim();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
  useState(normalizedCategory);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync category when clicking homepage/navbar category links.
  useEffect(() => {
  setSelectedCategory(normalizedCategory);
}, [normalizedCategory]);

  // Fetch products once.
  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllProducts();

        if (active) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Product API error:", err);

        if (active) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  // Normalize DummyJSON and curated products.
  
  // Normalize Spring Boot / MySQL products.
  const normalizedProducts = useMemo(() => {
    return products.map((product) => {
      const price = Number(product.price) || 0;

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || "Uncategorized",
        image: product.imageUrl || "",
        price,
        originalPrice: price,
        rating: 0,
        reviews: 0,
        stock: product.stock,
        brand: product.brand,
        description: product.description,
      };
    });
  }, [products]);


  // Category, search, price, rating, and sorting.
  const filteredProducts = useMemo(() => {
    let result = normalizedProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;

      
const query = searchQuery.toLowerCase();

const matchesSearch =
  !query ||
  product.name.toLowerCase().includes(query) ||
  product.category.toLowerCase().includes(query) ||
  (query === "mobile" && product.category === "Mobiles") ||
  (query === "phone" && product.category === "Mobiles") ||
  (query === "laptop" && product.category === "Laptops") ||
  (query === "appliance" &&
    product.category === "Home Appliances");


      const matchesMinPrice =
        minPrice === "" || product.price >= Number(minPrice);

      const matchesMaxPrice =
        maxPrice === "" || product.price <= Number(maxPrice);

      const matchesRating = product.rating >= minRating;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesRating
      );
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    normalizedProducts,
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
  ]);

  // Return to page 1 when filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
  ]);

  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;

  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  const resetFilters = () => {
    setSelectedCategory("All Categories");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setSortBy("featured");
    setCurrentPage(1);
  };

  const sortOptions = (
    <>
      <option value="featured">Featured</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </>
  );

  return (
    <main className="products-page py-4">
      <div className="container-fluid px-3 px-lg-4">
        <div className="mb-4">
          <h1 className="fw-bold products-page-title">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedCategory === "All Categories"
              ? "All Products"
              : selectedCategory}
          </h1>

          <p className="text-secondary mb-0">
            Explore our collection of amazing products.
          </p>
        </div>

        <div className="row g-3 g-lg-4">
          {/* Mobile filter and sort controls */}
          <div className="col-12 d-lg-none">
            <div className="row g-2">
              <div className="col-6">
                <button
                  type="button"
                  className="btn mobile-filter-btn w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                  data-bs-toggle="collapse"
                  data-bs-target="#mobileProductFilters"
                  aria-controls="mobileProductFilters"
                  aria-expanded="false"
                >
                  <SlidersHorizontal size={17} />
                  Filters
                </button>
              </div>

              <div className="col-6">
                <div className="mobile-sort-wrapper">
                  <ArrowUpDown size={16} />

                  <select
                    className="form-select"
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Filter sidebar */}
          <aside className="col-12 col-lg-3">
            <div
              id="mobileProductFilters"
              className="collapse d-lg-block products-filter-panel bg-white border rounded-3 p-3"
            >
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2">
                  <SlidersHorizontal size={19} color="#ff6b00" />
                  <h5 className="fw-bold mb-0">Filters</h5>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none"
                  style={{ color: "#ff6b00" }}
                  onClick={resetFilters}
                >
                  <RotateCcw size={14} className="me-1" />
                  Reset
                </button>
              </div>

              <hr />

              <h6 className="fw-semibold mb-3">Categories</h6>

              <div className="d-flex flex-column gap-3">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="d-flex align-items-center gap-2"
                  >
                    <input
                      type="radio"
                      name="category"
                      className="form-check-input mt-0"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                    />

                    <span>{category}</span>
                  </label>
                ))}
              </div>

              <hr />

              <h6 className="fw-semibold mb-3">Price Range (₹)</h6>

              <div className="d-flex gap-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min ₹"
                  aria-label="Minimum price"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />

                <input
                  type="number"
                  className="form-control"
                  placeholder="Max ₹"
                  aria-label="Maximum price"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <hr />

              <h6 className="fw-semibold mb-3">Customer Reviews</h6>

              <div className="d-flex flex-column gap-3">
                {[0, 4, 3, 2].map((rating) => (
                  <label
                    key={rating}
                    className="d-flex align-items-center gap-2"
                  >
                    <input
                      type="radio"
                      name="rating"
                      className="form-check-input mt-0"
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                    />

                    <span>
                      {rating === 0
                        ? "All Ratings"
                        : `${rating}★ & above`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product listings */}
          <div className="col-12 col-lg-9">
            <div className="bg-white border rounded-3 p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center gap-2">
                <span className="fw-semibold">
                  {loading
                    ? "Loading products..."
                    : `${filteredProducts.length} Products`}
                </span>

                <div className="d-none d-lg-flex align-items-center gap-2">
                  <span className="text-secondary small">
                    Sort by:
                  </span>

                  <select
                    className="form-select w-auto"
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border"
                  style={{ color: "#ff6b00" }}
                  role="status"
                >
                  <span className="visually-hidden">
                    Loading products...
                  </span>
                </div>

                <p className="text-secondary mt-3">
                  Loading products...
                </p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="bg-white border rounded-3 p-5 text-center">
                <h5 className="fw-semibold">No products found</h5>
                <p className="text-secondary mb-3">
                  Try changing your filters or search.
                </p>

                <button
                  className="btn mobile-filter-btn"
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="d-flex flex-column gap-3">
                  {visibleProducts.map((product) => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    className="products-pagination mt-4"
                    aria-label="Product pagination"
                  >
                    <p className="text-center text-secondary small mb-3">
                      Showing {startIndex + 1}–
                      {Math.min(
                        startIndex + PRODUCTS_PER_PAGE,
                        filteredProducts.length
                      )}{" "}
                      of {filteredProducts.length} products
                    </p>

                    <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={safePage === 1}
                        onClick={() =>
                          setCurrentPage(safePage - 1)
                        }
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          type="button"
                          key={page}
                          className={`pagination-btn ${
                            safePage === page ? "active" : ""
                          }`}
                          aria-current={
                            safePage === page ? "page" : undefined
                          }
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={safePage === totalPages}
                        onClick={() =>
                          setCurrentPage(safePage + 1)
                        }
                      >
                        Next
                      </button>
                    </div>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Products;
