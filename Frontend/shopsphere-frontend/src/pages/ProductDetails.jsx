
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";

import { getAllProducts } from "../services/productApi";
import "../styles/product-details.css";
import { useCart } from "../context/CartContext";



function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

const handleBuyNow = () => {
  if (!sessionStorage.getItem("shopsphere_token")) {
  navigate("/login");
  return;
}
  if (!product || product.stock <= 0) return;

  navigate("/checkout", {
    state: {
      buyNowProduct: {
        id: product.id,
        name: product.name,
        image: product.imageUrl,
        price: Number(product.price),
      },
      buyNowQuantity: quantity,
    },
  });
};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const products = await getAllProducts();

        const foundProduct = products.find(
          (item) => String(item.id) === String(id)
        );

        if (active) {
          setProduct(foundProduct || null);
          setActiveImage(foundProduct?.imageUrl || "");
          setQuantity(1);
        }
      } catch (err) {
        console.error("Product details error:", err);

        if (active) {
          setError("Unable to load product details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN").format(Math.round(value));

  if (loading) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border"
          style={{ color: "#ff6b00" }}
          role="status"
        />
        <p className="mt-3 text-secondary">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-5 text-center">
        <h3>{error || "Product not found"}</h3>
        <Link to="/products" className="btn btn-outline-secondary mt-3">
          Back to Products
        </Link>
      </div>
    );
  }

  const price = Number(product.price) || 0;
const images = product.imageUrl ? [product.imageUrl] : [];

  return (
    <main className="product-details-page py-4">
      <div className="container-fluid px-3 px-lg-4">
        <Link
          to="/products"
          className="product-details-back d-inline-flex align-items-center gap-2 mb-4"
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>

        <div className="row g-4">
          {/* Product gallery */}
          <div className="col-12 col-lg-5 d-flex">
            <div className="product-details-gallery">
              <div className="product-details-main-image">
                <img
                  src={activeImage || product.imageUrl}
                  alt={product.name}
                />
              </div>

              {images.length > 1 && (
                <div className="product-details-thumbnails">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`product-details-thumbnail ${
                        activeImage === image ? "active" : ""
                      }`}
                      onClick={() => setActiveImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product information */}
          <div className="col-12 col-lg-4 d-flex">
            <div className="product-details-info">
              <p className="product-details-category">
                {product.category?.name}
              </p>

              <h1 className="product-details-title">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-secondary mb-2">
                  Brand: {product.brand}
                </p>
              )}

              

              <hr />


              <div className="product-details-price">
                ₹{formatPrice(price)}
              </div>

              

              <p className="product-details-tax">
                Inclusive of all taxes
              </p>

              <hr />

              <div className="row g-3 text-center my-2">
                <div className="col-4">
                  <Truck size={25} color="#ff6b00" />
                  <p className="small mt-2 mb-0">
                    Free Delivery
                  </p>
                </div>

                <div className="col-4">
                  <RotateCcw size={25} color="#ff6b00" />
                  <p className="small mt-2 mb-0">
                    Easy Returns
                  </p>
                </div>

                <div className="col-4">
                  <ShieldCheck size={25} color="#ff6b00" />
                  <p className="small mt-2 mb-0">
                    Secure Shopping
                  </p>
                </div>
              </div>

              <hr />

              <h5 className="fw-bold mb-3">About this item</h5>

              <p className="product-details-description">
                {product.description ||
                  "Explore this quality product at ShopSphere."}
              </p>
            </div>
          </div>

          {/* Purchase panel */}
          <div className="col-12 col-lg-3">
            <div className="product-details-purchase">
              <h3 className="product-details-purchase-price">
                ₹{formatPrice(price)}
              </h3>

              <p className="product-details-delivery">
                FREE Delivery
              </p>

              <p className="text-secondary small">
                Delivered to your address
              </p>

              <p className="text-success fw-semibold">
                {product.stock === 0
                  ? "Out of Stock"
                  : "In Stock"}
              </p>

              <label
                htmlFor="product-quantity"
                className="fw-semibold small mb-2"
              >
                Quantity
              </label>

              <div className="product-details-quantity mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => Math.max(1, prev - 1))
                  }
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span id="product-quantity">{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) =>
                      Math.min(prev + 1, product.stock)
                    )
                  }
                  disabled={
                    product.stock === 0 ||
                    quantity >= product.stock
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              

<div className="product-details-actions">
  <button
    type="button"
    className="product-details-buy-btn"
    disabled={product.stock <= 0}
    onClick={handleBuyNow}
  >
    Buy Now
  </button>

  <button
    type="button"
    className="product-details-cart-btn"
    disabled={product.stock <= 0}
    onClick={() =>
      addToCart(
        {
          id: product.id,
          name: product.name,
          image: product.imageUrl,
          price: price,
        },
        quantity
      )
    }
  >
    <ShoppingCart size={18} />
    Add to Cart
  </button>
</div>



              <p className="text-secondary small text-center mt-3 mb-0">
                Secure checkout with ShopSphere
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
