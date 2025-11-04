import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ProgressiveImage from '../../UI/ProgressiveImage';

const MessageBubble = ({ message, isOwn, showAvatar = true, nextIsSameUser = false }) => {
  const { sender, text, image, createdAt, readBy = [] } = message;

  return (
    <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-1`}>
      {!isOwn && (
        <div className={`flex-shrink-0 ${!showAvatar && 'invisible'}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {showAvatar && (
              <img 
                src={sender.avatar} 
                alt={sender.username} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          relative group max-w-[70%] rounded-2xl px-4 py-2 
          ${isOwn ? 'bg-blue-500 text-white ml-2' : 'bg-gray-100 dark:bg-gray-800 mr-2'}
        `}
      >
        {text && <p className="text-sm whitespace-pre-line">{text}</p>}
        {image && (
          <div className="rounded-lg overflow-hidden max-w-sm">
            <ProgressiveImage src={image.url} alt="Message attachment" className="w-full h-auto" />
          </div>
        )}
        <span className="text-[10px] opacity-50 ml-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
        {isOwn && readBy.length > 0 && (
          <Check className="w-3 h-3 text-blue-300 absolute -bottom-4 right-1" />
        )}
      </motion.div>
    </div>
  );
};

export default MessageBubble;