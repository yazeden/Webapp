import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ContactPage = () => { 
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
    <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center pt-24 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full space-y-8 p-10 bg-white rounded-xl shadow-xl border border-gray-200 text-center"
      >
        <motion.h2 variants={itemVariants} className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">
          Contact Us
        </motion.h2>

        <motion.p variants={itemVariants} className="text-lg text-gray-700 leading-relaxed">
          Have questions about greenhouse installation, need support with your GBB Smart Greenhouse, or just want to learn more? We're here to help!
        </motion.p>

        <motion.div variants={itemVariants} className="space-y-4">
          <p className="text-gray-700 text-lg">
            You can reach our dedicated support team via:
          </p>
          <ul className="list-none text-gray-600 space-y-2 text-lg"> 
            <li>
              <strong>Email:</strong> <a href="mailto:support@gbb.com" className="text-gray-900 hover:text-gray-700 hover:underline transition-colors">support@gbb.com</a>
            </li>
            <li>
              <strong>Phone:</strong> <a href="tel:+1234567890" className="text-gray-900 hover:text-gray-700 hover:underline transition-colors">+1 (234) 567-890</a>
            </li>
          </ul>
          <p className="text-gray-700 text-lg pt-4">
            Our team is available Monday to Friday, 9 AM - 5 PM CET.
          </p>
        </motion.div>

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

export default ContactPage;