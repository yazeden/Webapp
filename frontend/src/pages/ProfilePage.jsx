import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/dashboard/ProfileDropdown'; 

const ProfilePage = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

  // user data and forms
  const [user, setUser] = useState({ username: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch profile.');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiUrl, navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const token = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to change password.');
      setSuccess(data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete account.');
      
      // logout and redirect
      localStorage.clear();
      navigate('/login', { state: { message: 'Your account has been successfully deleted.' } });

    } catch (err) {
      setError(err.message);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-400 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm";

  if (loading) {
    return <div className="min-h-screen bg-[#F5EEDE] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5EEDE]">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center p-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-800">Profile & Settings</h1>
          <ProfileDropdown />
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          {/* debug */}
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">{error}</div>}
          {success && <div className="p-3 bg-green-100 text-green-700 rounded-md text-center">{success}</div>}

          {/* user info */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">User Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Username</label>
                <input type="text" value={user.username} disabled className={`${inputClass} bg-gray-200 cursor-not-allowed`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <input type="email" value={user.email} disabled className={`${inputClass} bg-gray-200 cursor-not-allowed`} />
              </div>
            </div>
          </div>

          {/* change passsword */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Confirm New Password</label>
                <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required className={inputClass} />
              </div>
              <div className="text-right">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                  Update Password
                </motion.button>
              </div>
            </form>
          </div>

          {/* account deletion */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-300">
            <h2 className="text-xl font-semibold text-red-700 mb-4">Danger Zone</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">Delete your account</p>
                <p className="text-sm text-gray-600">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 transition-colors">
                Delete Account
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
