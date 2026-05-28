import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F5EEDE] border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* brand */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Logo className="h-8" />
            <span className="text-lg font-bold text-gray-900">GBB</span>
          </button>

          {/* links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors">Home</button>
            <button onClick={() => navigate('/about')} className="hover:text-gray-900 transition-colors">About Us</button>
            <button onClick={() => navigate('/contact')} className="hover:text-gray-900 transition-colors">Contact</button>
            <button onClick={() => navigate('/login')} className="hover:text-gray-900 transition-colors">Login</button>
            <button onClick={() => navigate('/signup')} className="hover:text-gray-900 transition-colors">Sign Up</button>
          </nav>

          {/* copyright */}
          <p className="text-sm text-gray-500">
            &copy; {year} GBB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
