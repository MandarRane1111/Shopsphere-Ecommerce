import API_BASE_URL from "../services/apiConfig";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    UserRound,
    Mail,
    Phone,
    LockKeyhole,
    Eye,
    EyeOff,
    UserPlus,
    ShoppingBag,
    ShieldCheck,
    Truck,
    BadgePercent,
} from "lucide-react";

import "../styles/auth.css";
import axios from "axios";

function Register() {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name, value, values = formData) => {
        switch (name) {
            case "name": {
                const fullName = value.trim();

                if (!fullName) return "Full name is required";

                if (!/^[A-Za-z ]+$/.test(fullName)) {
                    return "Full name can only contain letters. Numbers and special characters are not accepted.";
                }

                if (fullName.replace(/\s/g, "").length < 3) {
                    return "Full name must contain at least 3 letters";
                }

                if (fullName.length > 50) {
                    return "Full name cannot exceed 50 characters";
                }

                return "";
            }

            case "email":
                if (!value.trim()) return "Email address is required";

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    return "Enter a valid email address";
                }

                return "";

            case "phone":
                if (!value.trim()) return "Mobile number is required";

                if (!/^[6-9]\d{9}$/.test(value.trim())) {
                    return "Enter a valid 10-digit mobile number";
                }

                return "";

            case "password":
                if (!value) return "Password is required";

                if (value.length < 8) {
                    return "Password must be at least 8 characters long";
                }

                if (value.length > 16) {
                    return "Password cannot exceed 16 characters";
                }

                if (/\s/.test(value)) {
                    return "Password must not contain spaces";
                }

                if (!/[A-Z]/.test(value)) {
                    return "Password must contain at least one uppercase letter";
                }

                if (!/[a-z]/.test(value)) {
                    return "Password must contain at least one lowercase letter";
                }

                if (!/[0-9]/.test(value)) {
                    return "Password must contain at least one number";
                }

                if (!/[^A-Za-z0-9\s]/.test(value)) {
                    return "Password must contain at least one special character";
                }

                return "";

            case "confirmPassword":
                if (!value) return "Please confirm your password";

                if (value !== values.password) {
                    return "Passwords do not match";
                }

                return "";

            case "terms":
                return value ? "" : "Please accept the Terms & Conditions";

            default:
                return "";
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        const updatedData = {
            ...formData,
            [name]: newValue,
        };

        setFormData(updatedData);
        setSuccessMessage("");

        setErrors((prev) => ({
    ...prev,
    register: "",
}));

        // Revalidate fields that have already been visited.
        setErrors((prev) => {
            const updatedErrors = { ...prev };

            if (touched[name]) {
                updatedErrors[name] = validateField(
                    name,
                    newValue,
                    updatedData
                );
            }

            // Update password matching when the original password changes.
            if (name === "password" && touched.confirmPassword) {
                updatedErrors.confirmPassword = validateField(
                    "confirmPassword",
                    updatedData.confirmPassword,
                    updatedData
                );
            }

            return updatedErrors;
        });
    };

    const handleBlur = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;

        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, newValue),
        }));
    };

    const getPasswordStrength = (password) => {
        if (!password) return { label: "", level: 0 };

        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9\s]/.test(password)) score++;

        if (score <= 2) return { label: "Weak", level: 1 };
        if (score <= 4) return { label: "Medium", level: 2 };

        return { label: "Strong", level: 3 };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    
const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const newErrors = {};

    Object.keys(formData).forEach((field) => {
        const error = validateField(
            field,
            formData[field],
            formData
        );

        if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    setTouched(
        Object.fromEntries(
            Object.keys(formData).map((field) => [field, true])
        )
    );

    setSuccessMessage("");

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    try {
        await axios.post(
            `${API_BASE_URL}/auth/register`,
            {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
            }
        );

        setSuccessMessage(
            "Account created successfully! You can now sign in."
        );

        setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            terms: false,
        });

        setErrors({});
        setTouched({});

    } catch (error) {
        console.error("Registration failed:", error);

        const status = error.response?.status;
        const serverMessage = error.response?.data?.message;

        setErrors((prev) => ({
            ...prev,
            register:
                status === 409
                    ? "An account with this email already exists."
                    : status === 400
                    ? serverMessage || "Please check your registration details."
                    : "Unable to create your account. Please try again.",
        }));

    } finally {
        setIsSubmitting(false);
    }
};



    return (
        <main className="auth-page">
            <div className="container-fluid px-3 px-lg-4">
                <div className="auth-layout">

                    {/* Left promotional panel */}
                    <div className="auth-promo">
                        <div className="auth-promo-content">
                            <div className="auth-promo-icon">
                                <ShoppingBag size={34} />
                            </div>

                            <h2>
                                Join the <span>ShopSphere</span> Family!
                            </h2>

                            <p>
                                Create your account and explore amazing
                                products, exclusive offers, and a seamless
                                shopping experience.
                            </p>

                            <div className="auth-benefits">
                                <div>
                                    <Truck size={22} />
                                    <span>Fast & Reliable Delivery</span>
                                </div>

                                <div>
                                    <ShieldCheck size={22} />
                                    <span>Safe & Secure Shopping</span>
                                </div>

                                <div>
                                    <BadgePercent size={22} />
                                    <span>Exclusive Offers & Deals</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration form */}
                    <div className="auth-form-panel">
                        <div className="auth-form-container">

                            <div className="auth-heading">
                                <div className="auth-mobile-icon">
                                    <ShoppingBag size={25} />
                                </div>

                                <h1>Create Account</h1>
                                <p>
                                    Join ShopSphere and start shopping today.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>

                                {/* Full Name */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="register-name"
                                        className="auth-label"
                                    >
                                        Full Name
                                    </label>

                                    <div className="auth-input-wrapper">
                                        <UserRound size={19} />

                                        <input
                                            id="register-name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            autoComplete="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                    {errors.name && <p className="auth-error">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="register-email"
                                        className="auth-label"
                                    >
                                        Email Address
                                    </label>

                                    <div className="auth-input-wrapper">
                                        <Mail size={19} />

                                        <input
                                            id="register-email"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email address"
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                    {errors.email && <p className="auth-error">{errors.email}</p>}
                                </div>

                                {/* Mobile Number */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="register-phone"
                                        className="auth-label"
                                    >
                                        Mobile Number
                                    </label>

                                    <div className="auth-input-wrapper">
                                        <Phone size={19} />

                                        <input
                                            id="register-phone"
                                            name="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            placeholder="Enter your mobile number"
                                            autoComplete="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                    </div>
                                    {errors.phone && <p className="auth-error">{errors.phone}</p>}
                                </div>

                                {/* Password */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="register-password"
                                        className="auth-label"
                                    >
                                        Password
                                    </label>

                                    <div className="auth-input-wrapper">
                                        <LockKeyhole size={19} />

                                        <input
                                            id="register-password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a password"
                                            autoComplete="new-password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />

                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="auth-error">{errors.password}</p>
                                    )}


                                    {formData.password && (
                                        <div className="auth-password-strength">
                                            <div className="auth-strength-bars">
                                                {[1, 2, 3].map((level) => (
                                                    <span
                                                        key={level}
                                                        className={
                                                            level <= passwordStrength.level
                                                                ? `active strength-${passwordStrength.level}`
                                                                : ""
                                                        }
                                                    />
                                                ))}
                                            </div>

                                            <p className={`strength-text strength-${passwordStrength.level}`}>
                                                Password Strength: {passwordStrength.label}
                                            </p>
                                        </div>
                                    )}

                                </div>

                                {/* Confirm Password */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="register-confirm-password"
                                        className="auth-label"
                                    >
                                        Confirm Password
                                    </label>

                                    <div className="auth-input-wrapper">
                                        <LockKeyhole size={19} />

                                        <input
                                            id="register-confirm-password"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />

                                        <button
                                            type="button"
                                            className="auth-password-toggle"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>
                                    </div>

                                    {errors.confirmPassword && (
                                        <p className="auth-error">{errors.confirmPassword}</p>
                                    )}


                                    {formData.confirmPassword &&
                                        formData.password === formData.confirmPassword &&
                                        !errors.confirmPassword && (
                                            <p className="auth-match-success">
                                                Passwords match
                                            </p>
                                        )}

                                </div>

                                {/* Terms */}
                                <div className="auth-register-terms">
                                    <input
                                        type="checkbox"
                                        id="register-terms"
                                        name="terms"
                                        checked={formData.terms}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />

                                    <label htmlFor="register-terms">
                                        I agree to the Terms & Conditions
                                        and Privacy Policy.
                                    </label>
                                </div>

                                {errors.terms && (
                                    <p className="auth-error">{errors.terms}</p>
                                )}

                                {errors.register && (
    <p className="auth-error" role="alert">
        {errors.register}
    </p>
)}    
                                {/* Submit */}

                                <button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={isSubmitting}
                                >
                                    <UserPlus size={19} />
                                    {isSubmitting ? "Creating Account..." : "Create Account"}
                                </button>

                            </form>

                            {successMessage && (
                                <p className="auth-success">{successMessage}</p>
                            )}

                            <div className="auth-divider">
                                <span>Already have an account?</span>
                            </div>

                            <Link
                                to="/login"
                                className="auth-secondary-btn"
                            >
                                Sign In
                            </Link>

                            <p className="auth-bottom-note">
                                <ShieldCheck size={15} />
                                Your information is safe with us
                            </p>

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default Register;
