import { useState } from 'react';
import Logo from "./Logo";
import { motion } from "framer-motion"; // Correct import for motion
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom"; // Correct import for Link

const Header = () => {
  const navItems = ["Home", "About Us", "Contact"];
  const buttons = ["Login", "Sign Up"];

  const[isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen)

  const [desktopButtonsVisible, setDesktopButtonsVisible] = useState(false);
  const [mobileButtonsVisible, setMobileButtonsVisible] = useState(false);

  return (
    <header className='absolute w-full z-50 transition-all duration-300'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20'>

        {/* logo and name - wrapped in Link to go to home */}
        <Link to="/"> 
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 25,
                delay: 0.3,
                duration: 1.2,
              }}
              className='flex items-center'>
              <div>
                <Logo className="h-10" />
              </div>
              <span className='text-xl font-bold ml-2'>
                GBB
              </span>
            </motion.div>
        </Link>

        {/* desktop navigation */}
        <nav className='lg:flex hidden space-x-8'>
          {navItems.map((item, index) => (
            // Use 'motion(Link)' as a function call, then treat the result as a component
            // Or define a MotionLink component once
            <MotionLink // <--- CHANGE THIS LINE! This is the fix.
              key={item}
              to={item === "Home" ? "/" : item === "About Us" ? "/about" : item === "Contact" ? "/contact" : "#"}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.7 + index * 0.2,
              }}
              className="relative text-black hover:text-gray-600 font-medium transition-colors duration-300 group"
            >
              {item}
              <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-gray-600 group-hover:w-full transition-all duration-300'></span>
            </MotionLink> 
          ))}
        </nav>

        {/* buttons login signup desktop */}
        <div className="hidden lg:flex space-x-2 ml-4">
          {buttons.map((label, index) => (
            <Link
              key={label}
              to={label === "Login" ? "/login" : "/signup"}
            >
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 1.6 + index * 0.2,
                  duration: 0.5,
                }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-xl bg-[#D9D9D9] text-black font-bold
                  hover:bg-black hover:text-white transition-all duration-500
                  ${desktopButtonsVisible ? 'visible' : 'invisible'} 
                `}
                onAnimationComplete={() => {
                    if (index === buttons.length - 1) {
                        setDesktopButtonsVisible(true); 
                    }
                }}
              >
                {label}
              </motion.button>
            </Link>
          ))}
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
      className='md:hidden overflow-hidden bg-[#F5EEDE] shadow-lg px-4 py-5 space-y-5'>
        <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link 
                  onClick={toggleMenu} 
                  key={item} 
                  to={item === "Home" ? "/" : item === "Contact" ? "/contact" : "#"} 
                  className="text-black font-medium hover:text-gray-600 transition-colors">
                  {item}
                </Link>
              ))}
            </nav>
            <div className='pt-4 border-t border-gray-200 mt-6'>
              <div className='flex justify-between space-x-3'>
                {buttons.map((label, index) => (
                  <Link
                    key={label}
                    to={label === "Login" ? "/login" : "/signup"}
                    onClick={toggleMenu}
                    className={`flex-1 px-4 py-2 rounded-xl bg-[#D9D9D9] text-black font-bold hover:bg-black hover:text-white transition-all duration-300
                    ${mobileButtonsVisible ? 'visible' : 'invisible'} 
                    `}
                    onAnimationComplete={() => {
                        if (index === buttons.length - 1) {
                            setMobileButtonsVisible(true); 
                        }
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
      </motion.div>
    </header>
  );
};

// Define MotionLink component outside Header (or as a memoized variable)
const MotionLink = motion(Link); // <--- ADD THIS LINE!

export default Header;