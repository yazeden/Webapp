import React from 'react';
import { Routes, Route } from "react-router-dom"; 
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";
import HeroSection from './components/HeroSection';
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary"; 
import ContactPage from "./pages/ContactPage"; 
import AboutUsPage from "./pages/AboutUsPage"; // <--- NEW: Import AboutUsPage

const App = () => {
  return (
    <div>
      <Header />
      
      <ErrorBoundary> 
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/signup" element={<SignUpPage />} /> 
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contact" element={<ContactPage />} /> 
          <Route path="/about" element={<AboutUsPage />} /> {/* <--- NEW: Add AboutUs Route */}
        </Routes>
      </ErrorBoundary>

      <Footer /> 
    </div>
  );
}

export default App;