import React from 'react';
import { ImageIcon, Video, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../UI/Button';

const AttachmentMenu = ({ onSelect, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full mb-2 flex space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelect('image')}
      >
        <ImageIcon className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelect('video')}
      >
        <Video className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSelect('camera')}
      >
        <Camera className="w-5 h-5" />
      </Button>
    </motion.div>
  );
};

export default AttachmentMenu;