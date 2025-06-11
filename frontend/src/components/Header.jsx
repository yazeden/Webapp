import { useState } from 'react';
import Logo from "./Logo.jsx";
import { motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom"; 

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt_token');

  const navItems = ["Home", "About Us", "Contact"];
  const publicAuthButtons = ["Login", "Sign Up"];

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    console.log("Logged out, navigating to /login");
    navigate('/login');
  };

  // --- motion variants ---
  const linkVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  };

  const buttonVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  };

  const whileTapProps = { scale: 0.95 };
  const whileHoverProps = { scale: 1.05 };
  // --- end motion variants ---

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className='absolute w-full z-50 transition-all duration-300'
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20'>

        {/* logo and name  */}
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); console.log("Logo Home Clicked!"); }} className="flex items-center">
            <motion.div
              className='flex items-center'
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 25,
                delay: 0.3,
                duration: 1.2,
              }}
            >
              <div className='flex-shrink-0'>
                <Logo className="h-10" />
              </div>
              <span className='text-xl font-bold ml-2'>
                GBB
              </span>
            </motion.div>
        </a>

        {/* desktop navigation */}
        <nav className='lg:flex hidden space-x-8'>
          {navItems.map((item, index) => (
            <motion.div 
              key={item}
              variants={linkVariants} 
              initial="initial"
              animate="animate"
              transition={{ ...linkVariants.transition, delay: 0.7 + index * 0.2 }}
              whileHover={whileHoverProps} 
              whileTap={whileTapProps}    
              className="relative text-black font-medium transition-colors duration-300 group"
            >
              <a
                href={item === "Home" ? "/" : item === "About Us" ? "/about" : item === "Contact" ? "/contact" : "#"}
                onClick={(e) => { e.preventDefault(); navigate(e.currentTarget.href.replace(window.location.origin, '')); console.log(item + " Nav Clicked!"); }}
                className="block py-2 text-black hover:text-gray-600 font-medium transition-colors duration-300"
              >
                {item}
              </a>
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gray-600 group-hover:w-full transition-all duration-300'></span>
            </motion.div>
          ))}
          {token && ( 
            <>
              <motion.div
                variants={linkVariants} 
                initial="initial"
                animate="animate"
                transition={{ ...linkVariants.transition, delay: 0.7 + navItems.length * 0.2 }}
                whileHover={whileHoverProps} 
                whileTap={whileTapProps}    
                className="relative text-black font-medium transition-colors duration-300 group"
              >
                <a
                  href="/dashboard"
                  onClick={(e) => { e.preventDefault(); navigate("/dashboard"); console.log("Dashboard Nav Clicked!"); }}
                  className="block py-2 text-black hover:text-gray-600 font-medium transition-colors duration-300"
                >
                  Dashboard
                </a>
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gray-600 group-hover:w-full transition-all duration-300'></span>
              </motion.div>
              <motion.div
                variants={linkVariants} 
                initial="initial"
                animate="animate"
                transition={{ ...linkVariants.transition, delay: 0.7 + (navItems.length + 1) * 0.2 }}
                whileHover={whileHoverProps} 
                whileTap={whileTapProps}     
                className="relative text-black font-medium transition-colors duration-300 group"
              >
                <a
                  href="/profile"
                  onClick={(e) => { e.preventDefault(); navigate("/profile"); console.log("Profile Nav Clicked!"); }}
                  className="block py-2 text-black hover:text-gray-600 font-medium transition-colors duration-300"
                >
                  Profile
                </a>
                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gray-600 group-hover:w-full transition-all duration-300'></span>
              </motion.div>
            </>
          )}
        </nav>

        {/* buttons login signup desktop  */}
        <div className="hidden lg:flex space-x-2 ml-4">
          {!token ? (
            publicAuthButtons.map((label, index) => (
              <a
                key={label}
                href={label === "Login" ? "/login" : "/signup"}
                onClick={(e) => { e.preventDefault(); console.log(label + " Button Clicked!"); navigate(e.currentTarget.href.replace(window.location.origin, '')); }}
                className={`px-4 py-2 rounded-xl bg-[#D9D9D9] text-black font-bold
                  hover:bg-black hover:text-white transition-all duration-500
                `}
              >
                {label}
              </a>
            ))
          ) : ( 
            <motion.button
              variants={buttonVariants} 
              initial="initial"
              animate="animate"
              transition={{ ...buttonVariants.transition, delay: 1.6 }}
              whileTap={whileTapProps}    
              whileHover={whileHoverProps} 
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold
                hover:bg-red-700 transition-all duration-500"
            >
              Logout
            </motion.button>
          )}
        </div>

        {/* mobile menu button */}
        <div className='md:hidden flex item-center'>
          <motion.button
          whileTap={{ scale: 0.7 }}
          onClick={toggleMenu}
          className='text-black'>
            { isOpen ? <FiX className='h-6 w-6'/> : <FiMenu className='h-6 w-6'/>}
          </motion.button>
        </div>
      </div>

      {/* mobile menu */}
      <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: isOpen ? 1 : 0,
        height: isOpen ? "auto" : 0,
      }}
      transition={{ duration:0.5 }}
      className='md:hidden overflow-hidden bg-[#F5EEDE] shadow-lg px-4 py-5 space-y-5'
      style={{pointerEvents: isOpen ? 'auto' : 'none'}}
      >
        <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  onClick={(e) => { e.preventDefault(); toggleMenu(); navigate(item === "Home" ? "/" : item === "About Us" ? "/about" : item === "Contact" ? "/contact" : "#"); console.log(item + " Mobile Nav Clicked!"); }}
                  key={item}
                  href={item === "Home" ? "/" : item === "About Us" ? "/about" : item === "Contact" ? "/contact" : "#"}
                  className="text-black font-medium hover:text-gray-600 transition-colors">
                  {item}
                </a>
              ))}
              {token && ( 
                <>
                  <a
                    onClick={(e) => { e.preventDefault(); toggleMenu(); navigate("/dashboard"); console.log("Dashboard Mobile Nav Clicked!"); }}
                    href="/dashboard"
                    className="text-black font-medium hover:text-gray-600 transition-colors">
                    Dashboard
                  </a>
                  <a
                    onClick={(e) => { e.preventDefault(); toggleMenu(); navigate("/profile"); console.log("Profile Mobile Nav Clicked!"); }}
                    href="/profile"
                    className="text-black font-medium hover:text-gray-600 transition-colors">
                    Profile
                  </a>
                </>
              )}
            </nav>
            <div className='pt-4 border-t border-gray-200 mt-6'>
              <div className='flex justify-between space-x-3'>
                {!token ? ( 
                  publicAuthButtons.map((label, index) => (
                    <a
                      key={label}
                      href={label === "Login" ? "/login" : "/signup"}
                      onClick={(e) => { e.preventDefault(); toggleMenu(); navigate(e.currentTarget.href.replace(window.location.origin, '')); console.log(label + " Mobile Button Clicked!"); }}
                      className={`flex-1 px-4 py-2 rounded-xl bg-[#D9D9D9] text-black font-bold hover:bg-black hover:text-white transition-all duration-300
                      `}
                    >
                      {label}
                    </a>
                  ))
                ) : ( 
                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 1.6, duration: 0.5 }}
                    whileTap={whileTapProps}
                    whileHover={whileHoverProps}
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold
                      hover:bg-red-700 transition-all duration-300"
                  >
                    Logout
                  </motion.button>
                )}
              </div>
            </div>
      </motion.div>
    </motion.header>
  );
};


export default Header;