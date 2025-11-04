import React, { useState } from 'react';

const ProgressiveImage = ({ src, alt = '', className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        src={src || '/placeholder-image.jpg'}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setError(true);
          e.target.src = '/placeholder-image.jpg';
          setLoaded(true);
        }}
      />
    </div>
  );
};

export default ProgressiveImage;