// src/components/Settings/SettingsPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  Smartphone,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Save,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DarkModeToggleLarge } from '../DarkMode/DarkModeToggle';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Avatar from '../UI/Avatar';
import axios from 'axios';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'account' && <AccountSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'help' && <HelpSettings />}
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    website: user?.website || ''
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }

      const response = await axios.put('/users/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6">
          <Avatar src={preview} alt={user?.username} size="xl" />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
          </div>
        </div>

        <Input
          label="Full Name"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />

        <Input
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />

        <Input
          label="Bio"
          as="textarea"
          rows={4}
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          maxLength={150}
        />

        <Input
          label="Website"
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />

        <Button type="submit" loading={loading} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </form>
    </div>
  );
};

// Account Settings
const AccountSettings = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/users/email', { email });
      if (response.data.success) {
        alert('Verification email sent! Please check your inbox.');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h2>
      
      <div className="space-y-6">
        <form onSubmit={handleChangeEmail}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="mt-4">
            Update Email
          </Button>
        </form>

        <div className="pt-6 border-t dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Theme</h3>
          <DarkModeToggleLarge />
        </div>

        <div className="pt-6 border-t dark:border-gray-700">
          <h3 className="font-semibold mb-2 text-red-600">Danger Zone</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Once you delete your account, there is no going back.
          </p>
          <Button variant="danger">Delete Account</Button>
        </div>
      </div>
    </div>
  );
};

// Notification Settings
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailLikes: true,
    emailComments: true,
    emailFollows: true,
    emailMessages: true,
    pushLikes: true,
    pushComments: true,
    pushFollows: true,
    pushMessages: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Notifications</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Email Notifications</h3>
          <div className="space-y-3">
            {['Likes', 'Comments', 'Follows', 'Messages'].map((item) => (
              <div key={item} className="flex items-center justify-between py-2">
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[`email${item}`]}
                    onChange={() => handleToggle(`email${item}`)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Push Notifications</h3>
          <div className="space-y-3">
            {['Likes', 'Comments', 'Follows', 'Messages'].map((item) => (
              <div key={item} className="flex items-center justify-between py-2">
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[`push${item}`]}
                    onChange={() => handleToggle(`push${item}`)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Privacy Settings
const PrivacySettings = () => {
  const [privacy, setPrivacy] = useState({
    isPrivate: false,
    allowTagging: 'everyone',
    allowMessages: 'everyone',
    showActivityStatus: true
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Privacy</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Private Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Only approved followers can see your posts
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacy.isPrivate}
              onChange={(e) => setPrivacy({ ...privacy, isPrivate: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div>
          <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Who can tag you</h3>
          <select
            value={privacy.allowTagging}
            onChange={(e) => setPrivacy({ ...privacy, allowTagging: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="everyone">Everyone</option>
            <option value="followers">People I Follow</option>
            <option value="none">No One</option>
          </select>
        </div>

        <div>
          <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Who can message you</h3>
          <select
            value={privacy.allowMessages}
            onChange={(e) => setPrivacy({ ...privacy, allowMessages: e.target.value })}
            className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="everyone">Everyone</option>
            <option value="followers">People I Follow</option>
            <option value="none">No One</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Security Settings
const SecuritySettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Security</h2>
      
      <div className="space-y-6">
        <Link to="/settings/password" className="block p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your password</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <Link to="/settings/2fa" className="block p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add extra security</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <div className="p-4 border dark:border-gray-700 rounded-lg">
          <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Active Sessions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Manage devices where you're logged in
          </p>
          <Button variant="outline">View Devices</Button>
        </div>
      </div>
    </div>
  );
};

// Help Settings
const HelpSettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Help & Support</h2>
      
      <div className="space-y-4">
        <a href="#" className="block p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Help Center</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </a>

        <a href="#" className="block p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Privacy Policy</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </a>

        <a href="#" className="block p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">Terms of Service</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </a>

        <div className="pt-6 border-t dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;