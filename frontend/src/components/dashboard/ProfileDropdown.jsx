import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiChevronDown, FiLogOut, FiSettings } from "react-icons/fi"; 

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); 

  const userEmail = localStorage.getItem('user_email') || 'User'; 

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email"); 
    navigate("/login");
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scaleY: 0.8, originY: "top" },
    visible: { opacity: 1, y: 0, scaleY: 1, originY: "top", transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, scaleY: 0.8, originY: "top", transition: { duration: 0.2, ease: "easeIn" } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.1, ease: "easeOut" } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.1, ease: "easeIn" } },
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={toggleDropdown}
        className="flex items-center space-x-2 bg-[#D5D5D5] hover:bg-[#7D7D7D] text-black font-semibold py-2 px-3 rounded-full transition-colors duration-200 focus:outline-none 
        focus:ring-2 focus:ring-gray-300"
      >
        <FiUser className="h-5 w-5" /> 
        <span className="hidden md:inline">{userEmail}</span> 
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown className="h-4 w-4" /> 
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20 overflow-hidden border border-gray-200"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="list-none m-0 p-0"
            >
              {/* Optional: Profile Link */}
              <motion.li variants={listItemVariants}>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)} // Close dropdown on click
                  className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                >
                  <FiSettings className="h-4 w-4 text-gray-500" />
                  <span>Profile</span>
                </Link>
              </motion.li>
              {/* Other options could go here (e.g., Settings) */}

              {/* Logout Option */}
              <motion.li variants={listItemVariants}>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left transition-colors duration-150"
                >
                  <FiLogOut className="h-4 w-4 text-gray-500" />
                  <span>Logout</span>
                </button>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;