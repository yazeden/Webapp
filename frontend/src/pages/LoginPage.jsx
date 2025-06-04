// Webapp/frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state during API call
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name] || errors.apiError) { // Clear general API error too
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
        apiError: null, 
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    const { email, password } = formData;
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email address is invalid.";
    if (!password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    if (validateForm()) {
      setIsLoading(true); // Set loading state
      try {
        // Use the VITE_FLASK_API_URL from your .env (passed by Docker Compose)
        // Fallback for local dev if not in Docker: http://localhost:5000
        const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000/api';

        const response = await fetch(`${apiUrl}/auth/login`, { // Target your Flask login endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe,
          }),
        });

        const data = await response.json();
        setIsLoading(false); // Reset loading state

        if (response.ok) { // Check if response status is 2xx
          console.log("Login successful from backend:", data);
          localStorage.setItem('jwt_token', data.token); // Store the JWT token
          localStorage.setItem('user_id', data.user_id); // Store user_id if returned
          setIsSubmitted(true); // Now this means actual success
          // Optionally navigate to a dashboard or home page
          // setTimeout(() => navigate('/dashboard'), 1500); // Example navigation
        } else {
          // Handle errors from the backend (e.g., invalid credentials)
          console.error("Login failed from backend:", data.message);
          setErrors({ apiError: data.message || "Login failed. Please check your credentials." });
          setIsSubmitted(false); // Keep form visible
        }
      } catch (error) {
        setIsLoading(false); // Reset loading state
        console.error("Network error during login:", error);
        setErrors({ apiError: "Network error or server unavailable. Please try again later." });
        setIsSubmitted(false); // Keep form visible
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
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={formVariant}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 p-10 bg-[#D9D9D9] rounded-xl shadow-xl border border-gray-200"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Login to your GBB account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center text-green-600 font-bold text-lg">
            Login successful! 👋
            <p className="text-sm text-gray-500 mt-2">
              Welcome back! {/* You can add a redirect or further actions here */}
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <motion.div variants={inputFieldVariant} initial="hidden" animate="visible">
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
                  <p className="text-red-500 text-xs mt-1 ml-4">{errors.email}</p>
                )}
              </motion.div>

              <motion.div variants={inputFieldVariant} initial="hidden" animate="visible">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
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
                  <p className="text-red-500 text-xs mt-1 ml-4">{errors.password}</p>
                )}
              </motion.div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>
            
            {errors.apiError && ( // Display API errors
              <p className="text-red-500 text-sm text-center py-2">{errors.apiError}</p>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading} // Disable button while loading
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent 
                         text-md font-bold rounded-full text-white bg-black 
                         hover:bg-[#7D7D7D] transition-colors duration-300 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                         ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </motion.button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-gray-900 hover:text-gray-700 transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;