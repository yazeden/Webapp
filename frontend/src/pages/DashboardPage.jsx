import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; 

// --- import components ---
import GreenhouseSelector from "../components/dashboard/GreenhouseSelector.jsx"; 
import AddCustomPlantModal from "../components/dashboard/AddCustomPlantModal.jsx"; 
import LinkGreenhouseModal from "../components/dashboard/LinkGreenhouseModal.jsx"; 
import ProfileDropdown from "../components/dashboard/ProfileDropdown.jsx"; 
import PlantProfileSelector from "../components/dashboard/PlantProfileSelector.jsx"; 


const DashboardPage = () => {
  const navigate = useNavigate();

  // apiurl
  const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

  // --- data management ---
  const [userGreenhouses, setUserGreenhouses] = useState([]); 
  const [customPlantProfiles, setCustomPlantProfiles] = useState([]); 
  
  // for detail page
  const [selectedGreenhouse, setSelectedGreenhouse] = useState(null); 
  const [selectedPlantProfile, setSelectedPlantProfile] = useState(null); 

  const [loadingGreenhouses, setLoadingGreenhouses] = useState(true); 
  const [loadingPlantProfiles, setLoadingPlantProfiles] = useState(true); 
  const [fetchError, setFetchError] = useState(""); 

  const [showLinkGreenhouseModal, setShowLinkGreenhouseModal] = useState(false); 
  const [showAddPlantModal, setShowAddPlantModal] = useState(false); 

  // --- api call ---
  const fetchUserGreenhouses = async () => {
    setLoadingGreenhouses(true);
    setFetchError(""); 
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) { 
        navigate("/login");
        return;
      }
      const response = await fetch(`${apiUrl}/api/user/greenhouses`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("user_id");
          localStorage.removeItem("user_email"); 
          navigate("/login");
          return;
        }
        const errData = await response.json().catch(() => ({message: "Failed to fetch greenhouses (could not parse error response).",}));
        throw new Error(errData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUserGreenhouses(data);
    } catch (error) {
      console.error("Error fetching user greenhouses:", error);
      setFetchError(error.message);
    } finally {
      setLoadingGreenhouses(false);
    }
  };

  const fetchCustomPlantProfiles = async () => {
      setLoadingPlantProfiles(true);
      try {
          const token = localStorage.getItem('jwt_token');
          if (!token) { navigate('/login'); return; }
          const response = await fetch(`${apiUrl}/api/plants/custom_profiles`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) {
              if (response.status === 401) {
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("user_id");
                localStorage.removeItem("user_email");
                navigate("/login");
                return;
              }
              const errData = await response.json().catch(() => ({message: "Failed to fetch custom plant profiles."}));
              throw new Error(errData.message || `HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setCustomPlantProfiles(data);
      } catch (error) {
          console.error("Error fetching custom plant profiles:", error);
      } finally {
          setLoadingPlantProfiles(false);
      }
  };

  useEffect(() => {
    fetchUserGreenhouses();
    fetchCustomPlantProfiles();
  }, []); 

  const handlePlantAdded = () => {
    fetchCustomPlantProfiles(); 
    setShowAddPlantModal(false); 
  };

  const handleGreenhouseLinked = () => {
    fetchUserGreenhouses(); 
    setShowLinkGreenhouseModal(false); 
  };

  const handleViewGreenhouseDetails = (greenhouse) => {
      navigate(`/dashboard/greenhouses/${greenhouse.id}`); 
  };


  // --- animation ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // --- jsx ---
  return (
    <div className="min-h-screen bg-[#F5EEDE] py-8 px-4 sm:px-6 lg:px-8">
      {/* dashboard header */}
      <header className="bg-white shadow-md p-4 mb-8"> 
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            GBB Dashboard
          </h1>
          <ProfileDropdown /> 
        </div>
      </header>

      {/* main content */}
      <motion.div
        className="container mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* error display */}
        {fetchError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            Error: {fetchError}
          </div>
        )}

        {/* --- row 1 tiles --- */}
        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* link greenhouse */}
          <motion.button 
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setShowLinkGreenhouseModal(true)} 
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center flex flex-col justify-center items-center h-full cursor-pointer"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Link a Greenhouse</h2>
            <p className="text-gray-600">Have a setup key? Add your existing GBB Smart Greenhouse to your account.</p>
          </motion.button>

          {/* profile tile */}
          <motion.button 
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setShowAddPlantModal(true)} 
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center flex flex-col justify-center items-center h-full cursor-pointer"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Add a Plant Profile</h2>
            <p className="text-gray-600">Create a new custom plant profile with your own ideal growing conditions.</p>
          </motion.button>
        </motion.section>

        {/* --- select greenhouse row 2 --- */}
        <motion.section variants={itemVariants} className="mb-10"> 
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Select a Greenhouse</h2>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <GreenhouseSelector
              greenhouses={userGreenhouses}
              onSelectGreenhouse={handleViewGreenhouseDetails} 
              selectedGreenhouseId={null} 
              isLoading={loadingGreenhouses}
            />
          </div>
        </motion.section>

      </motion.div> 

      {/* --- modals --- */}
      <AnimatePresence>
        {showAddPlantModal && (
          <AddCustomPlantModal
            isOpen={showAddPlantModal}
            onClose={() => setShowAddPlantModal(false)}
            onPlantAdded={handlePlantAdded}
          />
        )}

        {showLinkGreenhouseModal && (
          <LinkGreenhouseModal
            isOpen={showLinkGreenhouseModal}
            onClose={() => setShowLinkGreenhouseModal(false)}
            onSuccess={handleGreenhouseLinked}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;