import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: ShoppingBag,
      title: "Wide Product Selection",
      description:
        "Explore mobiles, laptops, electronics, home appliances, fashion and accessories in one place.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Shopping",
      description:
        "Shop confidently with secure authentication and protected payment processing.",
    },
    {
      icon: Truck,
      title: "Convenient Shopping",
      description:
        "Enjoy a straightforward shopping experience, from product discovery to order placement.",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      description:
        "Choose between Cash on Delivery and supported online payment options.",
    },
  ];

  return (
    <main className="about-page">
      <section className="bg-dark text-white py-5">
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span
                className="fw-semibold text-uppercase"
                style={{ color: "#ff9b42", letterSpacing: "2px" }}
              >
                Welcome to ShopSphere
              </span>

              <h1 className="display-4 fw-bold mt-3 mb-4">
                Your World of Shopping,
                <span style={{ color: "#ff8c24" }}>
                  {" "}All in One Place.
                </span>
              </h1>

              <p className="lead text-white-50 mb-4">
                ShopSphere is an e-commerce platform designed to
                make online shopping simple, convenient and
                enjoyable. Discover products across multiple
                categories and shop with confidence.
              </p>

              <Link
                to="/products"
                className="btn btn-warning fw-semibold px-4 py-3"
              >
                Explore Products <ArrowRight size={18} className="ms-2" />
              </Link>
            </div>

            <div className="col-lg-5 text-center">
              <div
                className="rounded-4 p-5"
                style={{
                  background: "linear-gradient(135deg, #263b60, #14213d)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <ShoppingBag
                  size={100}
                  strokeWidth={1.2}
                  color="#ff9b42"
                />
                <h2 className="fw-bold mt-4">
                  Shop<span style={{ color: "#ff9b42" }}>Sphere</span>
                </h2>
                <p className="text-white-50 mb-0">
                  Discover. Shop. Enjoy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="text-warning fw-bold text-uppercase">
                Who We Are
              </span>

              <h2 className="fw-bold mt-3 mb-4">
                Making Online Shopping Easier
              </h2>

              <p className="text-secondary">
                ShopSphere brings together a variety of products
                through a single, easy-to-use shopping platform.
                Our goal is to simplify how customers browse,
                select and purchase products online.
              </p>

              <p className="text-secondary">
                From smartphones and laptops to everyday essentials,
                ShopSphere focuses on a smooth shopping journey
                with helpful features such as shopping carts,
                saved addresses, order tracking and multiple
                payment methods.
              </p>
            </div>

            <div className="col-lg-6">
              <div
                className="rounded-4 p-4 p-md-5"
                style={{ background: "#fff7ed" }}
              >
                <h3 className="fw-bold mb-4">Our Mission</h3>

                <p className="text-secondary">
                  To create a simple, accessible and reliable
                  digital shopping experience for everyone.
                </p>

                {[
                  "Easy product discovery",
                  "Simple and secure checkout",
                  "Convenient order management",
                  "Customer-focused experience",
                ].map((item) => (
                  <div
                    key={item}
                    className="d-flex align-items-center gap-3 mb-3"
                  >
                    <CheckCircle2 color="#f97316" size={22} />
                    <span className="fw-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: "#f8fafc" }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-warning fw-bold text-uppercase">
              Why ShopSphere
            </span>

            <h2 className="fw-bold mt-2">
              Why Choose Us?
            </h2>

            <p className="text-secondary">
              Features designed to make your shopping experience better.
            </p>
          </div>

          <div className="row g-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div className="col-md-6 col-lg-3" key={title}>
                <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                  <div
                    className="rounded-3 d-inline-flex p-3 mb-4"
                    style={{ background: "#fff0df" }}
                  >
                    <Icon color="#f97316" size={30} />
                  </div>

                  <h5 className="fw-bold mb-3">{title}</h5>
                  <p className="text-secondary mb-0">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container text-center py-4">
          <Headphones color="#f97316" size={42} />

          <h2 className="fw-bold mt-3">
            Have Questions?
          </h2>

          <p className="text-secondary mx-auto" style={{ maxWidth: 550 }}>
            Need assistance or want to learn more about ShopSphere?
            We're here to help.
          </p>

          <Link
  to="/contact"
  className="btn btn-dark px-4 py-3 fw-semibold"
  onClick={(e) => {
    if (!sessionStorage.getItem("shopsphere_token")) {
      e.preventDefault();
      navigate("/login");
    }
  }}
>
  Contact Us <ArrowRight size={18} className="ms-2" />
</Link>
        </div>
      </section>
    </main>
  );
}

export default About;