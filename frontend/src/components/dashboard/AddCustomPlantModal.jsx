import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AddCustomPlantModal = ({ isOpen, onClose, onPlantAdded }) => {
  const [plantData, setPlantData] = useState({
    name: "",
    ideal_temp_min: "",
    ideal_temp_max: "",
    ideal_groundmoisture: "",
    ideal_humidity: "",
    ideal_co2: "",
    ideal_light: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000'; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlantData((prev) => ({ ...prev, [name]: value === "" ? null : Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch(`${apiUrl}/api/plants/custom`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plantData),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add plant");
      }
      setSuccessMessage(responseData.message || "Plant profile created successfully!");
      if (onPlantAdded) { 
          onPlantAdded();
      }
    } catch (err) {
      console.error("Error adding plant profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // reset when closed
  useEffect(() => {
    if (!isOpen) {
      setPlantData({ 
        name: "", ideal_temp_min: "", ideal_temp_max: "",
        ideal_groundmoisture: "", ideal_humidity: "",
        ideal_co2: "", ideal_light: "",
      });
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
      originY: "top",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { y: "50vh", opacity: 0, scaleY: 0.8, originY: "top", transition: { duration: 0.3 } },
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-500 bg-[#7D7D7D] placeholder-gray-200 text-white rounded-full shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm";

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
            className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Add Custom Plant Profile
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Plant Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Plant Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={plantData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., Tomato"
                />
              </div>

              {/* Ideal Temperature Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ideal_temp_min" className="block text-sm font-medium text-gray-700">
                    Min Temp (°C)
                  </label>
                  <input type="number" name="ideal_temp_min" id="ideal_temp_min" value={plantData.ideal_temp_min || ''} onChange={handleChange} className={inputClass} placeholder="18" />
                </div>
                <div>
                  <label htmlFor="ideal_temp_max" className="block text-sm font-medium text-gray-700">
                    Max Temp (°C)
                  </label>
                  <input type="number" name="ideal_temp_max" id="ideal_temp_max" value={plantData.ideal_temp_max || ''} onChange={handleChange} className={inputClass} placeholder="25" />
                </div>
              </div>

              {/* Other Ideal Conditions */}
              <div>
                <label htmlFor="ideal_groundmoisture" className="block text-sm font-medium text-gray-700">
                  Ideal Ground Moisture (%)
                </label>
                <input type="number" name="ideal_groundmoisture" id="ideal_groundmoisture" value={plantData.ideal_groundmoisture || ''} onChange={handleChange} className={inputClass} placeholder="60" />
              </div>
              <div>
                <label htmlFor="ideal_humidity" className="block text-sm font-medium text-gray-700">
                  Ideal Humidity (%)
                </label>
                <input type="number" name="ideal_humidity" id="ideal_humidity" value={plantData.ideal_humidity || ''} onChange={handleChange} className={inputClass} placeholder="70" />
              </div>
              <div>
                <label htmlFor="ideal_co2" className="block text-sm font-medium text-gray-700">
                  Ideal CO2 (ppm)
                </label>
                <input type="number" name="ideal_co2" id="ideal_co2" value={plantData.ideal_co2 || ''} onChange={handleChange} className={inputClass} placeholder="400" />
              </div>
              <div>
                <label htmlFor="ideal_light" className="block text-sm font-medium text-gray-700">
                  Ideal Light (lux)
                </label>
                <input type="number" name="ideal_light" id="ideal_light" value={plantData.ideal_light || ''} onChange={handleChange} className={inputClass} placeholder="5000" />
              </div>


              {error && <p className="text-red-500 text-sm py-2 text-center">{error}</p>}
              {successMessage && <p className="text-green-600 text-sm py-2 text-center">{successMessage}</p>}

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  disabled={loading}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Plant"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCustomPlantModal;