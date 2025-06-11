import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const PlantProfileSelector = ({
  plantProfiles,
  onSelectPlantProfile,
  selectedPlantProfileId,
  isLoading,
}) => {
  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading plant profiles...</p>;
  }

  if (!plantProfiles || plantProfiles.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No custom plant profiles created.
      </p>
    );
  }

  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      className="space-y-2"
    >
      <AnimatePresence>
        {plantProfiles.map((profile) => (
          <motion.li
            key={profile.id}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <button
              onClick={() => onSelectPlantProfile(profile)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors
                                ${
                                  selectedPlantProfileId === profile.id
                                    ? "bg-gray-700 text-white shadow-md"
                                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                                } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50`}
            >
              {profile.name}
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
};

export default PlantProfileSelector;