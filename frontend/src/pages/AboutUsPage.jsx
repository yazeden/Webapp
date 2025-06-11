import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutUsPage = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
        staggerChildren: 0.2, 
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl w-full space-y-8 p-10 bg-white rounded-xl shadow-xl border border-gray-200 text-center"
      >
        <motion.h2 variants={itemVariants} className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">
          About GBB's Smart Greenhouse
        </motion.h2>

        <motion.p variants={itemVariants} className="text-lg text-gray-700 leading-relaxed">
          At GBB, we're passionate about bridging the gap between cutting-edge technology and sustainable agriculture. Our mission is to empower individuals, from hobby gardeners to aspiring tech farmers, with the tools they need to cultivate healthier plants and optimize their growing environments.
        </motion.p>

        <motion.p variants={itemVariants} className="text-lg text-gray-700 leading-relaxed">
          Founded on the principles of innovation and environmental stewardship, GBB develops intelligent solutions that make smart farming accessible to everyone. We believe that by providing real-time data and automated controls, we can significantly reduce waste, conserve resources, and simplify the art of growing.
        </motion.p>

        <motion.p variants={itemVariants} className="text-lg text-gray-700 leading-relaxed">
          Our Smart Greenhouse system is the culmination of dedicated research and development, designed to offer unparalleled control over vital environmental factors like moisture, temperature, and humidity. Join us on our journey to grow smarter, not harder, and experience the future of gardening today.
        </motion.p>

        <motion.div variants={itemVariants} className="pt-6">
          <Link 
            to="/" 
            className="font-bold text-gray-900 hover:text-gray-700 transition-colors mt-8 inline-block text-lg"
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutUsPage;