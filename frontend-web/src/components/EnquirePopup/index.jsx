import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import apiClient from "../../api/apiClient";

const EnquirePopup = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    serviceType: "",
    message: "",
    refererUrl: window.location.href,
    submittedUrl: window.location.href,
  });
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [errors, setErrors] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    serviceType: "",
    message: "",
    recaptcha: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const serviceOptions = [
    { value: "localMove", label: "Local Move" },
    { value: "internationalMove", label: "International Move" },
    { value: "carExport", label: "Car Import and Export" },
    { value: "storageServices", label: "Storage Services" },
    { value: "logistics", label: "limitless Logistics" },
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRecaptcha = () => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action: "submit_enquiry" })
        .then((token) => {
          setRecaptchaToken(token);
          setErrors((prev) => ({ ...prev, recaptcha: "" }));
        })
        .catch((error) => {
          console.error("reCAPTCHA error:", error);
          setErrors((prev) => ({ ...prev, recaptcha: "reCAPTCHA verification failed. Please try again." }));
        });
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {
      fullName: "",
      phoneNumber: "",
      email: "",
      serviceType: "",
      message: "",
      recaptcha: "",
    };
    let hasError = false;

    if (!formData.fullName) {
      newErrors.fullName = "Please enter your full name.";
      hasError = true;
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Please enter your phone number.";
      hasError = true;
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid 10-digit phone number.";
      hasError = true;
    }
    if (!formData.email) {
      newErrors.email = "Please enter your email address.";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
      hasError = true;
    }
    if (!formData.serviceType) {
      newErrors.serviceType = "Please select a service type.";
      hasError = true;
    }
    if (!formData.message) {
      newErrors.message = "Please enter a message.";
      hasError = true;
    }
    if (!recaptchaToken) {
      newErrors.recaptcha = "Please complete the reCAPTCHA verification.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    apiClient
      .post("contacts/enquiries/", {
        ...formData,
        recaptchaToken,
      })
      .then((response) => {
        console.log("Enquiry submitted:", response.data);
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          serviceType: "",
          message: "",
          refererUrl: window.location.href,
          submittedUrl: window.location.href,
        });
        setRecaptchaToken("");
        setErrors({
          fullName: "",
          phoneNumber: "",
          email: "",
          serviceType: "",
          message: "",
          recaptcha: "",
        });
        setIsLoading(false);
        onClose();
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          navigate("/thank-you");
        }
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.error || "Form submission failed. Please try again.";
        setErrors((prev) => ({
          ...prev,
          recaptcha: errorMessage,
        }));
        setIsLoading(false);
        console.error("Form submission error:", error);
      });
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            variants={modalVariants}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes size={24} />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Left side - Image */}
              <div className="lg:w-1/2 p-6">
                <img
                  src="https://images.pexels.com/photos/4247693/pexels-photo-4247693.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Moving truck on highway"
                  className="w-full h-64 lg:h-full object-cover rounded-lg"
                />
              </div>

              {/* Right side - Content and Form */}
              <div className="lg:w-1/2 p-6 lg:p-8">
                <div className="text-left mb-6">
                  <p className="text-gray-600 text-sm mb-2">Before You Go...</p>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Ready for a <span className="text-yellow-400">Hassle-Free Move</span>?
                  </h2>
                  <p className="text-gray-700 text-lg">We'll take care of everything</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Name:"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full p-4 bg-purple-100 rounded-lg border-0 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                      required
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone Number:"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full p-4 bg-purple-100 rounded-lg border-0 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                      required
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email:"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-4 bg-purple-100 rounded-lg border-0 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full p-4 bg-purple-100 rounded-lg border-0 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                      required
                    >
                      <option value="" disabled>
                        Select Service Type
                      </option>
                      {serviceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.serviceType && (
                      <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>
                    )}
                  </div>

                  <div>
                    <textarea
                      name="message"
                      placeholder="Message:"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-4 bg-purple-100 rounded-lg border-0 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                      required
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                    )}
                  </div>

                  <div>
                    <div
                      className="g-recaptcha"
                      data-sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      data-size="invisible"
                      data-callback="onRecaptchaSuccess"
                    ></div>
                    <button
                      type="button"
                      onClick={handleRecaptcha}
                      className="text-gray-600 text-sm hover:underline"
                    >
                      Verify reCAPTCHA
                    </button>
                    {errors.recaptcha && (
                      <p className="text-red-500 text-xs mt-1">{errors.recaptcha}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-black text-white py-4 px-6 rounded-lg text-lg font-medium transition-colors ${
                        isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-gray-800"
                      }`}
                    >
                      {isLoading ? "Submitting..." : "Enquire Now"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnquirePopup;