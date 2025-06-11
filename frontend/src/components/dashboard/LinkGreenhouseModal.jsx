import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LinkGreenhouseModal = ({ isOpen, onClose, onSuccess }) => {
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!setupKey.trim()) {
      setError("Setup key cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch(`${apiUrl}/api/auth/link-greenhouse`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ setupKey: setupKey.trim() }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to link greenhouse.");
      }

      setSuccessMessage(responseData.message + (responseData.greenhouse ? ` (${responseData.greenhouse.name})` : ''));
      setSetupKey(""); 
      if (onSuccess) { 
        onSuccess();
      }
    } catch (err) {
      console.error("Error linking greenhouse:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setSetupKey("");
      setError("");
      setSuccessMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { y: "-50vh", opacity: 0, scaleY: 0.8, originY: "top" },
    visible: {
      y: "0",
      opacity: 1,
      scaleY: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { y: "50vh", opacity: 0, scaleY: 0.8, originY: "top", transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-black mb-6 text-center">
              Link Your Greenhouse
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="setupKey"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Enter Setup Key
                </label>
                <input
                  type="text"
                  name="setupKey"
                  id="setupKey"
                  required
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-500 bg-[#7D7D7D] placeholder-gray-300 text-white rounded-full shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent sm:text-sm"
                  placeholder="XXXX-1234-XXXX"
                />
              </div>

              {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}
              {successMessage && <p className="text-green-600 text-sm text-center py-2">{successMessage}</p>}

              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent
                             text-md font-bold rounded-full text-white bg-gray-700
                             hover:bg-gray-900 transition-colors duration-300 focus:outline-none
                             focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  {loading ? "Linking..." : "Link Greenhouse"}
                </motion.button>
              </div>
              <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-2 w-full flex justify-center py-2 px-4 border border-gray-400
                             text-sm font-medium rounded-full text-gray-700 bg-gray-100
                             hover:bg-gray-50 transition-colors duration-300 focus:outline-none
                             focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  disabled={loading}
                >
                  Cancel
                </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkGreenhouseModal;