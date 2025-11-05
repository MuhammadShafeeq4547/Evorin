import React, { useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const DeletePostModal = ({ isOpen, onClose, post, onDelete }) => {
  const { push: toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await axios.delete(`/posts/${post._id}`);

      if (response.data.success) {
        toast('Post deleted successfully', { type: 'success' });
        onDelete(post._id);
        onClose();
      } else {
        toast(response.data.message || 'Failed to delete post', { type: 'error' });
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete post';
      toast(errorMessage, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Delete Post?
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>

        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletePostModal;
