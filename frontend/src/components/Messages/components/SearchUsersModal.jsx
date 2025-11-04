import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Avatar from '../../UI/Avatar';
import Button from '../../UI/Button';

const SearchUsersModal = ({ isOpen, onClose, searchQuery, onSearchChange, searchResults, onSelectUser }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">New Message</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {searchResults.map(user => (
            <button
              key={user._id}
              onClick={() => onSelectUser(user)}
              className="w-full flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Avatar src={user.avatar} alt={user.username} size="sm" />
              <div className="ml-3">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">{user.fullName}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchUsersModal;