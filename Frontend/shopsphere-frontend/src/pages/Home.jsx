import { Link } from "react-router-dom";
import "../styles/home.css";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import ShopByCategory from "../components/ShopByCategory";
import FeaturedProducts from "../components/FeaturedProducts";
import HomeAppliancesBanner from "../components/HomeAppliancesBanner";

const slides = [
  {
    id: 1,
    label: "LATEST SMARTPHONES",
    title: "Powerful Tech",
    subtitle: "For a Smarter You",
    description: "Top brands. Best prices. Trusted by thousands.",
    image: "/images/hero-phone.png",
    link: "/products?name=Samsung",
  },
  {
    id: 2,
    label: "PREMIUM LAPTOPS",
    title: "Work Smarter",
    subtitle: "Achieve More",
    description: "Discover powerful laptops for work and play.",
    image: "/images/hero-laptop.png",
    link: "/products?name=laptop",
  },
  {
    id: 3,
    label: "LATEST ELECTRONICS",
    title: "Experience",
    subtitle: "Better Sound",
    description: "Explore premium audio and electronics.",
    image: "/images/hero-headphones.png",
    link: "/products?name=headphones",
  },
];

function Home() {

  return (
    <main className="home-page">
      {/* BOOTSTRAP CAROUSEL */}
      <section
        className="shopsphere-carousel"
        aria-label="Featured offers"
      >
        <div
          id="shopsphereHeroCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="5000"
          data-bs-pause="hover"
        >

          <div className="carousel-indicators">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                data-bs-target="#shopsphereHeroCarousel"
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
                aria-current={index === 0 ? "true" : undefined}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="carousel-inner">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`carousel-item ${index === 0 ? "active" : ""
                  }`}
              >
                <div className="carousel-slide">
                  <div className="container-fluid h-100">
                    <div className="row align-items-center h-100">

                      <div className="col-7 col-md-6">
                        <div className="slide-content">
                          <span className="slide-label">
                            {slide.label}
                          </span>

                          <h1>
                            {slide.title}
                            <span>{slide.subtitle}</span>
                          </h1>

                          <p>{slide.description}</p>

                          <Link
                            to={slide.link}
                            className="slide-shop-btn"
                          >
                            Shop Now →
                          </Link>
                        </div>
                      </div>


                      
                        <div className="col-5 col-md-6">
                          <div className="slide-image">
                            <img
                              src={slide.image}
                              alt={slide.label}
                            />
                          </div>
                        </div>
                      


                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#shopsphereHeroCarousel"
            data-bs-slide="prev"
            aria-label="Previous slide"
          >
            <span className="carousel-control-prev-icon" />
          </button>

          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#shopsphereHeroCarousel"
            data-bs-slide="next"
            aria-label="Next slide"
          >
            <span className="carousel-control-next-icon" />
          </button>

        </div>
      </section>

      

{/* SHOPSPHERE BENEFITS */}
<section className="home-benefits py-2">
  <div className="container-fluid px-3 px-lg-4">
    <div className="row row-cols-2 row-cols-lg-4 g-3">

      <div className="col">
        <div className="benefit-item d-flex align-items-center justify-content-lg-center gap-3">
          <Truck className="benefit-icon" />
          <div>
            <h6 className="mb-1">Free Delivery</h6>
            <p className="mb-0">On orders above ₹499</p>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="benefit-item d-flex align-items-center justify-content-lg-center gap-3">
          <RotateCcw className="benefit-icon" />
          <div>
            <h6 className="mb-1">Easy Returns</h6>
            <p className="mb-0">7-day return policy</p>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="benefit-item d-flex align-items-center justify-content-lg-center gap-3">
          <ShieldCheck className="benefit-icon" />
          <div>
            <h6 className="mb-1">Secure Payments</h6>
            <p className="mb-0">100% safe & secure</p>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="benefit-item d-flex align-items-center justify-content-lg-center gap-3">
          <BadgeCheck className="benefit-icon" />
          <div>
            <h6 className="mb-1">Best Prices</h6>
            <p className="mb-0">Great deals always</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
<ShopByCategory />
<FeaturedProducts/>
<HomeAppliancesBanner/>
    </main>
  );
}

export default Home;
