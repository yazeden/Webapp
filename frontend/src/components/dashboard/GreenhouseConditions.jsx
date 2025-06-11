import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiInfo } from "react-icons/fi"; 

const GreenhouseConditions = ({ greenhouse, plantProfile }) => {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000'; 

  useEffect(() => {
    if (!greenhouse || !greenhouse.id) {
      setConditions(null);
      setLoading(false);
      return;
    }

    const fetchConditions = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("jwt_token");
        const response = await fetch(
          `${apiUrl}/api/greenhouses/${greenhouse.id}/conditions`, 
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: "Failed to fetch conditions."}));
          throw new Error(errData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setConditions(data);
      } catch (err) {
        console.error("Error fetching conditions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConditions();
  }, [greenhouse, apiUrl]); 

  if (!greenhouse) {
    return (
      <p className="text-gray-600 text-center py-10">
        Please select a greenhouse to view its conditions.
      </p>
    );
  }

  if (loading) return <p className="text-gray-500">Loading conditions for {greenhouse.name}...</p>;
  if (error) return <p className="text-red-500 text-center py-4">Error: {error}</p>;
  if (!conditions || Object.keys(conditions).length === 0) {
    return <p className="text-gray-500">No condition data available for {greenhouse.name}.</p>;
  }

  // --- status determination ---
  const getConditionStatus = (type, value) => {
    if (!plantProfile) {
        return { status: "unknown", className: "text-gray-500", icon: <FiInfo /> }; 
    }

    const idealKeyMap = {
        temperature: { min: plantProfile.ideal_temp_min, max: plantProfile.ideal_temp_max, unit: "°C" },
        humidity: { min: plantProfile.ideal_humidity, max: plantProfile.ideal_humidity, unit: "%" },
        ground_moisture: { min: plantProfile.ideal_groundmoisture, max: plantProfile.ideal_groundmoisture, unit: "%" },
        co2: { min: plantProfile.ideal_co2, max: plantProfile.ideal_co2, unit: "ppm" },
        light: { min: plantProfile.ideal_light, max: plantProfile.ideal_light, unit: "lux" },
    };

    const idealRanges = idealKeyMap[type];

    if (!idealRanges || (idealRanges.min === null && idealRanges.max === null)) {
        return { status: "no_ideal", className: "text-gray-400", icon: <FiInfo /> }; // no ideal range
    }

    const { min, max } = idealRanges;

    // check if value within range
    const isGood = (min === null || value >= min) && (max === null || value <= max);
    const isLow = (min !== null && value < min);
    const isHigh = (max !== null && value > max);

    if (isGood) return { status: "good", className: "text-green-600", icon: <FiCheckCircle /> };
    if (isLow) return { status: "low", className: "text-blue-600", icon: <FiAlertCircle /> }; 
    if (isHigh) return { status: "high", className: "text-red-600", icon: <FiXCircle /> };   

    return { status: "unknown", className: "text-gray-500", icon: <FiInfo /> }; 
  };


  const conditionItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <div className="space-y-4">
      {!plantProfile && (
        <p className="text-yellow-600 p-3 bg-yellow-50 rounded-md border border-yellow-200">
          Select a plant profile to compare conditions with ideal values.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {Object.entries(conditions).map(([type, data]) => {
            const status = getConditionStatus(type, data.value);
            return (
              <motion.div
                key={type}
                variants={conditionItemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
                className={`p-4 rounded-lg border shadow-sm
                            ${status.status === "good" ? "border-green-300 bg-green-50" :
                              status.status === "low" ? "border-blue-300 bg-blue-50" :
                              status.status === "high" ? "border-red-300 bg-red-50" :
                              "border-gray-300 bg-white"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold text-gray-800 capitalize">
                    {type.replace(/_/g, " ")} 
                  </h3>
                  {status.icon && <span className={`text-xl ${status.className}`}>{status.icon}</span>}
                </div>
                <p className={`text-2xl font-bold ${status.className}`}>
                  {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}{' '}
                  <span className="text-lg text-gray-500">{data.unit}</span>
                </p>
                {plantProfile && status.status !== "no_ideal" && (
                    <p className="text-sm text-gray-500">
                        Ideal: {
                            status.idealRanges?.min !== null ? status.idealRanges.min : ''
                        }
                        {status.idealRanges?.min !== null && status.idealRanges?.max !== null && '-'}
                        {
                            status.idealRanges?.max !== null ? status.idealRanges.max : ''
                        }{' '}
                        {data.unit}
                    </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Last updated: {new Date(data.timestamp).toLocaleString()}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GreenhouseConditions;