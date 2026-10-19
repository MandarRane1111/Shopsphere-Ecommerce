import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../styles/home.css";

function HomeAppliancesBanner() {
  return (
    <section className="appliances-section py-4 py-lg-3">
      <div className="container-fluid px-3 px-lg-4">
        <div className="appliances-banner">

          <div className="row align-items-center g-0">

            {/* Left: Promotional Text */}
            <div className="col-6">
              <div className="appliances-content">
                <span className="appliances-label">
                  HOME APPLIANCES
                </span>

                <h2 className="appliances-title">
                  Upgrade Your Home
                </h2>

                <p className="appliances-description">
                  Discover appliances for everyday living.
                </p>

                <Link
                  to="/products?category=Home%20Appliances"
                  className="btn appliances-btn d-inline-flex align-items-center gap-2"
                >
                  Shop Now
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right: Product Image */}
            <div className="col-6">
              <div className="appliances-image">
                <img
                  src="/images/home-appliances-banner.png"
                  alt="Home appliances collection"
                  loading="lazy"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeAppliancesBanner;