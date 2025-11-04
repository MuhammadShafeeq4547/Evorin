import React from 'react';
import Avatar from '../UI/Avatar';

const StoryAvatar = ({ user, seen, onClick, size = 'md' }) => {
  return (
    <div className="flex flex-col items-center min-w-[64px] cursor-pointer" onClick={onClick}>
      <div className={`p-0.5 rounded-full ${seen ? 'from-gray-300 to-gray-400' : 'bg-gradient-to-tr from-yellow-400 to-pink-600'}`}>
        <div className="rounded-full bg-white p-0.5">
          <Avatar src={user.avatar} alt={user.username} size={size} />
        </div>
      </div>
      <span className="text-xs text-gray-600 truncate w-16 text-center mt-1">{user.username}</span>
    </div>
  );
};

export default StoryAvatar;
