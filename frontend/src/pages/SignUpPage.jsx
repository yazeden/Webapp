// Webapp/frontend/src/pages/SignUpPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; 

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name] || errors.apiError) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
        apiError: null,
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); 
    if (validateForm()) {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name, 
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        setIsLoading(false);

        if (response.ok) {
          console.log("Signup successful from backend:", data);
          setIsSubmitted(true); 
        } else {
          console.error("Signup failed from backend:", data.message);
          setErrors({
            apiError: data.message || "Signup failed. Please try again.",
          });
          setIsSubmitted(false); 
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Network error during signup:", error);
        setErrors({
          apiError:
            "Network error or server unavailable. Please try again later.",
        });
        setIsSubmitted(false); 
      }
    } else {
      console.log("Form has validation errors. Please fix them.");
    }
  };

  const formVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const inputFieldVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={formVariant}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 p-10 bg-[#D9D9D9] rounded-xl shadow-xl border border-[#D9D9D9]"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your GBB account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            After signing up, you can link your smart greenhouse using a unique
            setup key. Don't have a greenhouse yet?{" "}
            <Link
              to="/contact"
              className="font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Contact us
            </Link>{" "}
            for installation and configuration.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center text-green-600 font-bold text-lg">
            Account created successfully! 🎉
            <p className="text-sm text-gray-500 mt-2">
              You can now{" "}
              <Link
                to="/login"
                className="font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                log in
              </Link>{" "}
              with your new credentials.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <motion.div
                variants={inputFieldVariant}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`appearance-none relative block w-full px-4 py-3 border 
                  ${errors.name ? "border-red-500" : "border-gray-500"} 
                  bg-[#7D7D7D] placeholder-gray-200 text-white rounded-full focus:outline-none focus:ring-2 
                  focus:ring-gray-500 focus:border-transparent sm:text-sm`}
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.name}
                  </p>
                )}
              </motion.div>

              <motion.div
                variants={inputFieldVariant}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-4 py-3 border 
                  ${errors.email ? "border-red-500" : "border-gray-500"} 
                  bg-[#7D7D7D] placeholder-gray-200 text-white rounded-full focus:outline-none focus:ring-2 
                  focus:ring-gray-500 focus:border-transparent sm:text-sm`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.email}
                  </p>
                )}
              </motion.div>

              <motion.div
                variants={inputFieldVariant}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-4 py-3 border 
                  ${errors.password ? "border-red-500" : "border-gray-500"} 
                  bg-[#7D7D7D] placeholder-gray-200 text-white rounded-full focus:outline-none focus:ring-2 
                  focus:ring-gray-500 focus:border-transparent sm:text-sm`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.password}
                  </p>
                )}
              </motion.div>

              <motion.div
                variants={inputFieldVariant}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-4 py-3 border 
                  ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-500"
                  } 
                  bg-[#7D7D7D] placeholder-gray-200 text-white rounded-full focus:outline-none focus:ring-2 
                  focus:ring-gray-500 focus:border-transparent sm:text-sm`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 ml-4">
                    {errors.confirmPassword}
                  </p>
                )}
              </motion.div>
            </div>

            {errors.apiError && ( 
              <p className="text-red-500 text-sm text-center py-2">
                {errors.apiError}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading} 
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent 
                         text-md font-bold rounded-full text-white bg-black
                         hover:bg-[#7D7D7D] transition-colors duration-300 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                         ${
                           isLoading ? "opacity-50 cursor-not-allowed" : ""
                         }`}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </motion.button>
          </form>
        )}

        {/* link login */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;