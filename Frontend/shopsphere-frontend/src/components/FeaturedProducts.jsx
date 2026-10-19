import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllProducts } from "../services/productApi";
import { useCart } from "../context/CartContext";
import { Heart, ShoppingCart, Star, ArrowRight } from "lucide-react";
import "../styles/home.css";



const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN").format(price);

function FeaturedProducts() {
  const [wishlist, setWishlist] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadFeaturedProducts = async () => {
      try {
        const products = await getAllProducts();

        if (active) {
          setFeaturedProducts(
            Array.isArray(products) ? products.slice(0, 4) : []
          );
        }
      } catch (error) {
        console.error("Unable to load featured products:", error);
      }
    };

    loadFeaturedProducts();

    return () => {
      active = false;
    };
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  return (
    <section className="featured-products py-1 py-lg-3">
      <div className="container-fluid px-3 px-lg-4">

        {/* Section Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="home-section-title mb-1">
              Featured Products
            </h2>
            <p className="text-secondary mb-0">
              Handpicked deals just for you
            </p>
          </div>

          <Link
            to="/products"
            className="category-view-all d-flex align-items-center gap-1"
          >
            View All
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2 g-lg-4">

          {featuredProducts.map((product) => {
            const discount =
              product.originalPrice > product.price
                ? Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                  100
                )
                : 0;

            const isWishlisted = wishlist.includes(product.id);

            return (
              <div className="col" key={product.id}>
                <div className="featured-card h-100">

                  {/* Product Image */}
                  <div className="featured-image">

                    {discount > 0 && (
                      <span className="featured-discount">
                        {discount}% OFF
                      </span>
                    )}

                    <button
                      type="button"
                      className={`featured-wishlist ${isWishlisted ? "active" : ""
                        }`}
                      onClick={() => toggleWishlist(product.id)}
                      aria-label={
                        isWishlisted
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                      aria-pressed={isWishlisted}
                    >
                      <Heart
                        size={19}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>

                  {/* Product Information */}
                  <div className="featured-info">

                    <span className="featured-category">
                      {product.category?.name || "Products"}
                    </span>

                    <h3 className="featured-name">
                      {product.name}
                    </h3>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Star
                        size={16}
                        fill="#f59e0b"
                        color="#f59e0b"
                      />

                      <span className="featured-rating">
                        {product.rating}
                      </span>

                      <span className="featured-reviews">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="featured-prices">
                      <span className="featured-price">
                        ₹{formatPrice(product.price)}
                      </span>

                      <span className="featured-original-price">
                        ₹{formatPrice(product.originalPrice)}
                      </span>
                    </div>

                    <div className="featured-actions">
                      <button
                        type="button"
                        className="featured-buy-btn"
                        disabled={product.stock <= 0}
                        onClick={() => {
  if (!sessionStorage.getItem("shopsphere_token")) {
    navigate("/login");
    return;
  }

  navigate("/checkout", {
    state: {
      buyNowProduct: {
        id: product.id,
        name: product.name,
        image: product.imageUrl,
        price: Number(product.price),
      },
      buyNowQuantity: 1,
    },
  });
}}
                      >
                        Buy Now
                      </button>

                      <button
                        type="button"
                        className="featured-cart-btn"
                        disabled={product.stock <= 0}
                        onClick={() =>
                          addToCart(
                            {
                              id: product.id,
                              name: product.name,
                              image: product.imageUrl,
                              price: Number(product.price),
                            },
                            1
                          )
                        }
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;