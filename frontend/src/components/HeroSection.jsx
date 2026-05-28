import { motion } from "framer-motion";
import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className='min-h-screen bg-[#F5EEDE] flex lg:flex-row flex-col-reverse items-center
                 justify-center px-8 lg:px-24 relative overflow-x-hidden
                 pt-20 sm:pt-24 md:pt-28 lg:pt-24'
    >
      {/* left side - text */}
      <div className="z-40 lg:mb-0 mb-10 lg:mr-20 lg:flex-1 text-center lg:text-left px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 25,
            delay: 0.4,
            duration: 1.2,
          }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold z-10 mb-4"
        >
          GBB's Smart Greenhouse
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 25,
            delay: 0.6,
            duration: 1.2,
          }}
          className="text-2xl sm:text-3xl lg:text-4xl font-bold z-10 mb-4"
        >
          Where Technology Meets Nature
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 25,
            delay: 0.8,
            duration: 1.2,
          }}
          className="text-base sm:text-lg text-[#7D7D7D] max-w-xl mx-auto lg:mx-0 mb-8"
        >
          At GBB, we believe in sustainable innovation. Our smart greenhouse
          system is designed to help you monitor and optimize plant growth
          using real-time environmental data. Whether you're a hobby gardener
          or a tech enthusiast, this solution gives you full control over your
          greenhouse environment. With sensors that track moisture,
          temperature, and humidity, and systems that respond automatically to
          changing conditions, you'll never have to wonder if your plants are
          getting what they need. The GBB Smart Greenhouse gives you the
          confidence and control to grow smarter — not harder.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 25,
            delay: 1.0,
            duration: 1.2,
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
        >
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-all duration-300"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/about')}
            className="px-8 py-3 rounded-xl bg-[#D9D9D9] text-black font-bold hover:bg-gray-300 transition-all duration-300"
          >
            Learn More
          </button>
        </motion.div>
      </div>

      {/* right side - spline */}
      <motion.div
        initial={{ opacity: 0, x: 150 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          type: "spring",
          stiffness: 40,
          damping: 15,
          delay: 0.2,
          duration: 1.5,
        }}
        className="relative
                   w-full
                   lg:w-1/2 lg:max-w-none

                   h-[360px] sm:h-[420px] md:h-[480px] lg:h-[620px]

                   flex items-center justify-center
                   overflow-hidden z-30 mb-8 lg:mb-0"
      >
        <Spline
          className="absolute inset-0 w-full h-full"
          scene="https://prod.spline.design/2f4b9FmBHkViaE1M/scene.splinecode"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
