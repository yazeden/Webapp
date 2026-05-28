import React from 'react';
import { Outlet } from 'react-router-dom'; // <--- ADD THIS IMPORT
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { motion, AnimatePresence } from "framer-motion";

const PublicLayout = ({ children }) => { 
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;