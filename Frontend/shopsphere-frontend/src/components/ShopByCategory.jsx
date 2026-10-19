import { Link } from "react-router-dom";
import "../styles/home.css";

const categories = [
  {
    name: "Mobiles",
    image: "/images/category-mobiles.png",
  },
  {
    name: "Laptops",
    image: "/images/category-laptops.png",
  },
  {
    name: "Electronics",
    image: "/images/category-electronics.png",
  },
  {
    name: "Home Appliances",
    image: "/images/category-home-appliances.png",
  },
  {
    name: "Fashion",
    image: "/images/category-fashion.png",
  },
  {
    name: "Accessories",
    image: "/images/category-accessories.png",
  },
];

function ShopByCategory() {
  return (
    <section className="shop-categories pt-5 pb-3">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="home-section-title mb-0">
            Shop by Category
          </h2>

          <Link to="/products" className="category-view-all">
            View All →
          </Link>
        </div>

        <div className="row row-cols-3 row-cols-md-3 row-cols-lg-6 g-2">
          {categories.map((category) => (
            <div className="col" key={category.name}>
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <div className="category-image">
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />
                </div>

                <h3>{category.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShopByCategory;