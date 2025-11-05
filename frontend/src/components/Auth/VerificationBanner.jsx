import React, { useState } from 'react';
import { X, Mail, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const VerificationBanner = () => {
  const { user, resendVerificationEmail } = useAuth();
  const { push: toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Don't show if user is verified or banner is dismissed
  if (!user || user.isVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setLoading(true);
    try {
      const result = await resendVerificationEmail();
      
      if (result.success) {
        toast('Verification email sent! Check your inbox. 📧', { 
          type: 'success',
          duration: 6000 
        });
      } else {
        toast(result.error || 'Failed to send verification email', { type: 'error' });
      }
    } catch (err) {
      toast('Failed to send verification email', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Please verify your email address
                </p>
                <p className="text-xs opacity-90 mt-0.5">
                  We sent a verification link to <strong>{user.email}</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResend}
                disabled={loading}
                className="px-4 py-1.5 bg-white text-orange-600 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Resend email</span>
                )}
              </button>
              
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationBanner;
