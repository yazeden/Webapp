import { motion } from "framer-motion";
import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className='min-h-screen bg-[#F5EEDE] flex flex-col justify-center
                 px-8 lg:px-24 relative overflow-x-hidden pt-24 pb-12'
    >
      {/* full-width title at top */}
      <motion.h1
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 40, damping: 25, delay: 0.3, duration: 1.2 }}
        className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-center lg:text-left"
      >
        GBB's Smart Greenhouse
      </motion.h1>

      {/* content row: text left, spline right */}
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">

        {/* text + buttons — below spline on mobile, left on desktop */}
        <div className="order-2 lg:order-1 lg:flex-1 text-center lg:text-left">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 40, damping: 25, delay: 0.5, duration: 1.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
          >
            Where Technology Meets Nature
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 40, damping: 25, delay: 0.7, duration: 1.2 }}
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 40, damping: 25, delay: 0.9, duration: 1.2 }}
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

        {/* spline — above text on mobile, right on desktop */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.2, duration: 1.5 }}
          className="order-1 lg:order-2
                     relative w-full lg:w-1/2
                     h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px]
                     overflow-hidden z-30"
        >
          <Spline
            className="absolute inset-0 w-full h-full"
            scene="https://prod.spline.design/2f4b9FmBHkViaE1M/scene.splinecode"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
