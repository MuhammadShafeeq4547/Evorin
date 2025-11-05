import React from 'react';

const Skeleton = ({ className = '', variant = 'rectangular', animation = 'pulse' }) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
    />
  );
};

export const PostSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 max-w-lg mx-auto">
    {/* Header */}
    <div className="p-4 flex items-center space-x-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2 w-16" />
      </div>
      <Skeleton className="w-6 h-6" />
    </div>

    {/* Image */}
    <Skeleton className="aspect-square w-full rounded-none" />

    {/* Actions */}
    <div className="p-4 space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-6 h-6" />
      </div>
      
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2 w-16" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="flex flex-col md:flex-row items-start md:items-center mb-12 space-y-6 md:space-y-0">
      <div className="md:mr-12 mx-auto md:mx-0">
        <Skeleton variant="circular" className="w-32 h-32" />
      </div>
      
      <div className="flex-1 w-full space-y-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
          <Skeleton className="h-6 w-32 mr-6" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        
        <div className="flex space-x-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>

    {/* Post Grid */}
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  </div>
);

export const ExploreSkeleton = () => (
  <div className="max-w-6xl mx-auto px-3 md:px-6 py-6">
    <Skeleton className="h-8 w-32 mb-4" />
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {[...Array(21)].map((_, i) => (
        <Skeleton key={i} className="aspect-square" />
      ))}
    </div>
  </div>
);

export const MessagesSkeleton = () => (
  <div className="flex h-[calc(100vh-64px)]">
    {/* Chat List */}
    <div className="w-1/3 border-r bg-white dark:bg-gray-800">
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center p-3">
            <Skeleton variant="circular" className="w-12 h-12 mr-3" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Chat Window */}
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Skeleton variant="circular" className="w-24 h-24 mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  </div>
);

export const StorySkeleton = () => (
  <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide p-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col items-center min-w-[64px]">
        <Skeleton variant="circular" className="w-14 h-14 mb-1" />
        <Skeleton className="h-2 w-12" />
      </div>
    ))}
  </div>
);

export default Skeleton;
