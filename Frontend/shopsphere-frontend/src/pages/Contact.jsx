import { useState } from "react";
import { Mail, MessageSquare, Send, Headphones } from "lucide-react";
import "../styles/contact.css";
import API_BASE_URL from "../services/apiConfig";

function Contact() {

    const faqs = [
  {
    question: "How do I place an order on ShopSphere?",
    answer:
      "Browse our products, select the items you want, add them to your cart, and proceed to checkout. Choose your delivery address and preferred payment method to place your order.",
  },
  {
    question: "What payment methods are available?",
    answer:
      "ShopSphere supports Cash on Delivery (COD) and online payments through Razorpay.",
  },
  {
    question: "How can I check my order details?",
    answer:
      "Log in to your ShopSphere account and visit the My Account section to view your order history and details.",
  },
  {
    question: "Can I change my delivery address?",
    answer:
      "You can manage your saved addresses in your ShopSphere account and select the appropriate address during checkout.",
  },
  {
    question: "Is online payment secure?",
    answer:
      "Online payments are processed through Razorpay. Always verify your order details before completing payment.",
  },
  {
    question: "What should I do if my payment fails?",
    answer:
      "Check whether the payment was deducted from your account. If the payment failed or your order was not confirmed, contact our support team using the form below.",
  },
  {
    question: "How can I contact ShopSphere support?",
    answer:
      "Fill out the Contact Us form below with your name, email address, subject, and message. Our team can review your inquiry.",
  },
];
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));

    setSuccess("");
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
  newErrors.name = "Name is required";
} else if (!/^[a-zA-Z ]+$/.test(form.name.trim())) {
  newErrors.name = "Full Name must contain only letters and spaces";
} else if (form.name.trim().length > 100) {
  newErrors.name = "Name cannot exceed 100 characters";
}

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.subject.trim()) {
  newErrors.subject = "Subject is required";
} else if (/^\d+$/.test(form.subject.replace(/\s/g, ""))) {
  newErrors.subject = "Subject cannot contain only numbers";
} else if (form.subject.trim().length > 200) {
  newErrors.subject = "Subject cannot exceed 200 characters";
}

    if (!form.message.trim()) {
  newErrors.message = "Message is required";
} else if (/^\d+$/.test(form.message.replace(/\s/g, ""))) {
  newErrors.message = "Message cannot contain only numbers";
} else if (form.message.trim().length > 2000) {
  newErrors.message = "Message cannot exceed 2000 characters";
}

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccess("");
    setServerError("");

    try {
      fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit message");
      }

      setSuccess("Your message has been submitted successfully!");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Contact form error:", error);
      setServerError(
        "Unable to send your message. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: "#f8fafc", minHeight: "80vh" }}>
      <section
        className="text-center text-white py-5"
        style={{ background: "#14213d" }}
      >
        <div className="container-fluid py-3">
          <Headphones size={42} color="#ff922b" />

          <h1 className="fw-bold mt-3">Contact Us</h1>

          <p className="text-white-50 mb-0">
            Have a question or suggestion? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="container-fluid py-5">

  {/* FREQUENTLY ASKED QUESTIONS */}
  <div className="mb-5">
    <div className="text-center mb-4">
      <span
        className="fw-bold text-uppercase"
        style={{ color: "#f97316", letterSpacing: "1px" }}
      >
        Help Center
      </span>

      <h2 className="fw-bold mt-2">
        Frequently Asked Questions
      </h2>

      <p className="text-secondary">
        Find quick answers to common questions about ShopSphere.
      </p>
    </div>

    <div className="contact-faq-list" id="contactFaqAccordion">
  {faqs.map((faq, index) => (
    <div className="contact-faq-item" key={index}>

      <h3 className="contact-faq-heading">
        <button
          className="contact-faq-question collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#faq-collapse-${index}`}
          aria-expanded="false"
          aria-controls={`faq-collapse-${index}`}
        >
          <span>{faq.question}</span>

          <span
            className="contact-faq-icon"
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        id={`faq-collapse-${index}`}
        className="collapse"
        data-bs-parent="#contactFaqAccordion"
      >
        <div className="contact-faq-answer">
          {faq.answer}
        </div>
      </div>

    </div>
  ))}
</div>
  </div>

  {/* EXISTING CONTACT CARDS */}
  <div className="row g-4 justify-content-center">
          <div className="col-lg-4">
            <div className="bg-white rounded-4 shadow-sm p-4 h-100">
              <h3 className="fw-bold mb-4">Get in Touch</h3>

              <div className="d-flex gap-3 mb-4">
                <Mail size={26} color="#f97316" />

                <div>
                  <h6 className="fw-bold">Email Support</h6>
                  <p className="text-secondary mb-0">
                    Send us your questions using the contact form.
                  </p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <MessageSquare size={26} color="#f97316" />

                <div>
                  <h6 className="fw-bold">Customer Assistance</h6>
                  <p className="text-secondary mb-0">
                    Contact us for product inquiries, feedback,
                    and shopping-related questions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
              <h3 className="fw-bold mb-2">Send Us a Message</h3>

              <p className="text-secondary mb-4">
                Fill out the form below to submit your inquiry.
              </p>

              {success && (
                <div className="alert alert-success" role="status">
                  {success}
                </div>
              )}

              {serverError && (
                <div className="alert alert-danger" role="alert">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="contact-name" className="form-label fw-semibold">
                      Full Name
                    </label>

                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                    />

                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="contact-email" className="form-label fw-semibold">
                      Email Address
                    </label>

                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                    />

                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="contact-subject" className="form-label fw-semibold">
                      Subject
                    </label>

                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                      placeholder="What is your inquiry about?"
                      value={form.subject}
                      onChange={handleChange}
                      maxLength={200}
                    />

                    {errors.subject && (
                      <div className="invalid-feedback">{errors.subject}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="contact-message" className="form-label fw-semibold">
                      Message
                    </label>

                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      className={`form-control ${errors.message ? "is-invalid" : ""}`}
                      placeholder="Write your message here..."
                      value={form.message}
                      onChange={handleChange}
                      maxLength={2000}
                    />

                    {errors.message && (
                      <div className="invalid-feedback">{errors.message}</div>
                    )}
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn w-100 text-white fw-semibold py-3"
                      style={{ background: "#f97316" }}
                      disabled={loading}
                    >
                      <Send size={18} className="me-2" />
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;