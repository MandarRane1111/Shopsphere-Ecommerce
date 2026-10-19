import { Star, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/product-list-item.css";
import { useCart } from "../context/CartContext";

function ProductListItem({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

const handleBuyNow = () => {
  if (!sessionStorage.getItem("shopsphere_token")) {
  navigate("/login");
  return;
}
  navigate("/checkout", {
    state: {
      buyNowProduct: product,
      buyNowQuantity: 1,
    },
  });
};

  const discount =
    product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) /
          product.originalPrice) *
        100
      )
      : 0;

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN").format(price);

  return (
    <article className="product-list-item bg-white border rounded-3">
      <div className="row g-0 align-items-center">

        {/* Product Image */}
        <div className="col-5 col-md-4 col-lg-3">
          <div className="product-list-image-wrapper">
            {discount > 0 && (
              <span className="product-list-discount">
                {discount}% OFF
              </span>
            )}


            <Link
              to={`/products/${product.id}`}
              className="product-list-image-link"
            >
              <img
                src={product.image}
                alt={product.name}
                className="product-list-image"
                loading="lazy"
              />
            </Link>

          </div>
        </div>

        {/* Product Details */}
        <div className="col-7 col-md-8 col-lg-9">
          <div className="product-list-details">

            <div className="d-flex justify-content-between gap-2">

              <Link
                to={`/products/${product.id}`}
                className="product-list-title-link"
              >
                <h3 className="product-list-title mb-2">
                  {product.name}
                </h3>
              </Link>


              <button
                type="button"
                className={`product-list-wishlist ${isWishlisted ? "active" : ""
                  }`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  size={19}
                  fill={isWishlisted ? "#ff6b00" : "none"}
                />
              </button>
            </div>

            <p className="product-list-category mb-2">
              {product.category}
            </p>

            {/* Rating */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <Star
                size={16}
                fill="#f59e0b"
                color="#f59e0b"
              />

              <span className="product-list-rating">
                {product.rating}
              </span>

              <span className="product-list-reviews">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="product-list-price mb-1">
              ₹{formatPrice(product.price)}
            </div>

            {product.originalPrice > product.price && (
              <div className="product-list-mrp mb-2">
                M.R.P.{" "}
                <del>
                  ${formatPrice(product.originalPrice)}
                </del>
              </div>
            )}

            <p className="product-list-delivery mb-3">
              FREE Delivery
            </p>

            {/* Cart integration comes later */}

            <div className="d-flex flex-wrap gap-2">
  <div className="product-list-actions">
  <button
    type="button"
    className="product-list-buy-btn"
    onClick={handleBuyNow}
  >
    Buy Now
  </button>

  <button
    type="button"
    className="product-list-cart-btn"
    onClick={() => addToCart(product, 1)}
  >
    <ShoppingCart size={16} />
    Add to Cart
  </button>
</div>
</div>


          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductListItem;
