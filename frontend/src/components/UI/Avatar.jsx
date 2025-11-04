// src/components/UI/Avatar.jsx
import React from 'react';

const Avatar = ({ src, alt = 'User', size = 'md', className = '', online = false }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    xxl: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src={src || '/default-avatar.png'}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          e.target.src = '/default-avatar.png';
        }}
      />
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default Avatar;