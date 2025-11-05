import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../UI/Avatar';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Search, label: 'Explore' },
    { path: '/create', icon: PlusSquare, label: 'Create' },
    { path: '/notifications', icon: Heart, label: 'Activity' },
    { path: `/profile/${user?.username}`, icon: User, label: 'Profile', isProfile: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                {item.isProfile ? (
                  <div className={`${active ? 'ring-2 ring-black dark:ring-white' : ''} rounded-full`}>
                    <Avatar 
                      src={user?.avatar} 
                      alt={user?.username} 
                      size="xs"
                      className="w-6 h-6"
                    />
                  </div>
                ) : (
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      active
                        ? 'text-black dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                    fill={active && item.label !== 'Create' ? 'currentColor' : 'none'}
                    strokeWidth={active ? 2 : 2}
                  />
                )}
                
                {/* Active indicator dot */}
                {active && !item.isProfile && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 bg-black dark:bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
