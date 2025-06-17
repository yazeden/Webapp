import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft } from "react-icons/fi";

// components
import GreenhouseConditions from "../components/dashboard/GreenhouseConditions.jsx";
import PlantProfileSelector from "../components/dashboard/PlantProfileSelector.jsx"; 
import ProfileDropdown from "../components/dashboard/ProfileDropdown.jsx"; 

const GreenhouseDetailPage = () => {
  const { greenhouseId } = useParams(); 
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

  // --- data ---
  const [greenhouseDetails, setGreenhouseDetails] = useState(null);
  const [customPlantProfiles, setCustomPlantProfiles] = useState([]); 
  const [selectedPlantProfile, setSelectedPlantProfile] = useState(null);

  // --- ui ---
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingPlantProfiles, setLoadingPlantProfiles] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchGreenhouseDetails = async () => {
    setLoadingDetails(true);
    setFetchError("");
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) { navigate("/login"); return; }
      const response = await fetch(`${apiUrl}/api/user/greenhouses`, { 
          headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
          if (response.status === 401) { navigate("/login"); return; }
          throw new Error('Failed to fetch greenhouse list for details');
      }
      const allUserGreenhouses = await response.json();
      const currentGreenhouse = allUserGreenhouses.find(gh => gh.id === parseInt(greenhouseId));

      if (!currentGreenhouse) {
          setFetchError("Greenhouse not found or not linked to your account.");
          return;
      }
      setGreenhouseDetails(currentGreenhouse);
    } catch (error) {
      console.error("Error fetching greenhouse details:", error);
      setFetchError(error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchCustomPlantProfiles = async () => { /* (copy from DashboardPage.jsx) */
      setLoadingPlantProfiles(true);
      try {
          const token = localStorage.getItem('jwt_token');
          if (!token) { navigate('/login'); return; }
          const response = await fetch(`${apiUrl}/api/plants/custom_profiles`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) {
              const errData = await response.json().catch(() => ({message: "Failed to fetch custom plant profiles."}));
              throw new Error(errData.message || `HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setCustomPlantProfiles(data);
      } catch (error) {
          console.error("Error fetching custom plant profiles for details:", error);
      } finally {
          setLoadingPlantProfiles(false);
      }
  };

  useEffect(() => {
    if (greenhouseId) {
      fetchGreenhouseDetails();
      fetchCustomPlantProfiles(); 
    }
  }, [greenhouseId, navigate, apiUrl]); 

  // --- animation ---
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // --- jsx ---
  if (loadingDetails || loadingPlantProfiles) {
    return (
      <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading greenhouse details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center text-red-500 text-lg">
        Error: {fetchError}
        <button onClick={() => navigate('/dashboard')} className="ml-4 bg-gray-200 px-4 py-2 rounded-full">Back to Dashboard</button>
      </div>
    );
  }

  if (!greenhouseDetails) { 
      return (
        <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center text-gray-600 text-lg">
            Greenhouse not found or no ID provided.
            <button onClick={() => navigate('/dashboard')} className="ml-4 bg-gray-200 px-4 py-2 rounded-full">Back to Dashboard</button>
        </div>
      );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#F5EEDE] flex flex-col"
    >
      {/* dashboard header */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-semibold flex items-center space-x-2"
          >
            <FiChevronLeft /> <span>Back to Dashboard</span>
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-800">
            {greenhouseDetails.name} Details
          </h1>
          <ProfileDropdown />
        </div>
      </header>

      {/* main content */}
      <main className="container mx-auto p-6 flex-grow">
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="bg-[#D9D9D9] p-6 rounded-xl shadow-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Select Plant Profile
              </h2>
              <PlantProfileSelector
                plantProfiles={customPlantProfiles}
                onSelectPlantProfile={setSelectedPlantProfile}
                selectedPlantProfileId={selectedPlantProfile?.id}
                isLoading={loadingPlantProfiles}
              />
            </div>
          </div>

          {/* conditions display */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Current Conditions
            </h2>
            <GreenhouseConditions
              greenhouse={greenhouseDetails}
              plantProfile={selectedPlantProfile}
            />
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default GreenhouseDetailPage;