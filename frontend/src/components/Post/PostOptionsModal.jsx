import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Flag, Link as LinkIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const PostOptionsModal = ({ post, isOpen, onClose, onDelete, onEdit }) => {
  const { user } = useAuth();
  const { push: toast } = useToast();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = post?.user?._id === user?._id || post?.user === user?._id;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await axios.delete(`/posts/${post._id}`);
      
      if (response.data.success) {
        toast('Post deleted successfully', { type: 'success' });
        onDelete && onDelete(post._id);
        onClose();
        // If on post detail page, navigate to home
        if (window.location.pathname.includes('/p/')) {
          navigate('/');
        }
      } else {
        toast(response.data.message || 'Failed to delete post', { type: 'error' });
      }
    } catch (error) {
      console.error('Delete post error:', error);
      toast(error?.response?.data?.message || 'Failed to delete post', { type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/p/${post._id}`;
    navigator.clipboard.writeText(link);
    toast('Link copied to clipboard', { type: 'success' });
    onClose();
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    toast('Report functionality coming soon', { type: 'info' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        >
          {/* Options List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isOwnPost && (
              <>
                <button
                  onClick={() => {
                    onEdit && onEdit(post);
                    onClose();
                  }}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
                >
                  <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Edit post</span>
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {deleting ? 'Deleting...' : 'Delete post'}
                  </span>
                </button>
              </>
            )}

            <button
              onClick={handleCopyLink}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
            >
              <LinkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Copy link</span>
            </button>

            {!isOwnPost && (
              <button
                onClick={handleReport}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
              >
                <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-600 dark:text-red-400">Report</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">Cancel</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PostOptionsModal;
