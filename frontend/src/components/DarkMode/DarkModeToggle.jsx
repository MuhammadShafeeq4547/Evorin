// src/components/DarkMode/DarkModeToggle.jsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const DarkModeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-300 ${
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      } ${className}`}
      aria-label="Toggle dark mode"
    >
      <motion.div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
        animate={{
          x: isDark ? 28 : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-yellow-300" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
};

// Larger version for settings page
export const DarkModeToggleLarge = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Switch between light and dark themes
        </p>
      </div>
      
      <button
        onClick={toggleTheme}
        className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        }`}
        aria-label="Toggle dark mode"
      >
        <motion.div
          className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
          animate={{
            x: isDark ? 32 : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-600" />
          ) : (
            <Sun className="w-4 h-4 text-orange-500" />
          )}
        </motion.div>
      </button>
    </div>
  );
};

export default DarkModeToggle;