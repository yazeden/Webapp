// src/pages/ContactPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#F5EEDE] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 p-10 bg-white rounded-xl shadow-xl border border-gray-200 text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Contact Us</h2>
        <p className="text-lg text-gray-600">
          Have questions about greenhouse installation or need support?
          We're here to help!
        </p>
        <div className="space-y-4">
          <p className="text-gray-700">
            You can reach us via:
          </p>
          <ul className="list-disc list-inside text-gray-600">
            <li>Email: <a href="mailto:support@gbb.com" className="text-gray-900 hover:underline">support@gbb.com</a></li>
            <li>Phone: <a href="tel:+1234567890" className="text-gray-900 hover:underline">+1 (234) 567-890</a></li>
          </ul>
          {/* Optional: Add a contact form here */}
        </div>
        <Link to="/" className="font-bold text-gray-900 hover:text-gray-700 transition-colors mt-8 inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;