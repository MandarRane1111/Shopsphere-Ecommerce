import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Mail,
    Phone,
    MapPin
} from "lucide-react";
import { FaFacebook, FaInstagramSquare, FaYoutubeSquare } from "react-icons/fa"

function Footer() {
    return (
        <footer
            className="bg-dark text-white pt-5"
            style={{ minHeight: "300px", backgroundColor: "red" }}
        >
            <div className="container-fluid px-3 px-lg-4">
                <div className="row g-4 pb-4">

                    {/* Brand */}
                    <div className="col-12 col-md-6 col-lg-4">
                        <h3 className="fw-bold mb-3">
                            <span className="text-warning">Shop</span>Sphere
                        </h3>

                        <p className="text-white-50">
                            Discover electronics, fashion, home appliances,
                            and more all in one place.
                        </p>

                        <div className="d-flex align-items-center gap-3 mt-3">
                            <FaFacebook size={22} />
                            <FaInstagramSquare size={22}/>
                            <FaYoutubeSquare size={22}/>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-6 col-md-3 col-lg-2">
                        <h6 className="fw-bold mb-3">Quick Links</h6>

                        <div className="d-flex flex-column gap-2">
                            <Link to="/" className="text-white-50 text-decoration-none">
                                Home
                            </Link>
                            <Link to="/products" className="text-white-50 text-decoration-none">
                                All Products
                            </Link>
                            <Link to="/cart" className="text-white-50 text-decoration-none">
                                Cart
                            </Link>
                            <Link to="/orders" className="text-white-50 text-decoration-none">
                                My Orders
                            </Link>
                        </div>
                    </div>

                    {/* Customer Support */}
                    <div className="col-6 col-md-3 col-lg-3">
                        <h6 className="fw-bold mb-3">Customer Support</h6>

                        <div className="d-flex flex-column gap-2">
                            <Link to="/contact" className="text-white-50 text-decoration-none">
                                Contact Us
                            </Link>
                            <Link to="/faq" className="text-white-50 text-decoration-none">
                                FAQs
                            </Link>
                            <Link to="/returns" className="text-white-50 text-decoration-none">
                                Returns & Refunds
                            </Link>
                            <Link to="/privacy" className="text-white-50 text-decoration-none">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="fw-bold mb-3">Get in Touch</h6>

                        <div className="d-flex align-items-center gap-2 mb-3 text-white-50">
                            <Mail size={18} />
                            <span>support@shopsphere.com</span>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-3 text-white-50">
                            <Phone size={18} />
                            <span>Contact number coming soon</span>
                        </div>

                        <div className="d-flex align-items-center gap-2 text-white-50">
                            <MapPin size={18} />
                            <span>India</span>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-top border-secondary py-4 text-center">
                    <small className="text-white-50">
                        © {new Date().getFullYear()} ShopSphere. All rights reserved.
                    </small>
                </div>
            </div>
        </footer>
    );
}

export default Footer;