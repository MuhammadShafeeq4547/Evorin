import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import Button from '../UI/Button';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { push: toast } = useToast();
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/auth/verify-email/${token}`);
      
      if (response.data.success) {
        setSuccess(true);
        toast('Email verified successfully! You can now login. 🎉', { 
          type: 'success',
          duration: 6000 
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Invalid or expired verification link';
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verifying your email...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your email address
          </p>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Email verified!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your email has been successfully verified. You can now login to your account.
            </p>
            
            <Link to="/login">
              <Button className="w-full py-3">
                Continue to login
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Verification failed
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || 'This verification link is invalid or has expired.'}
          </p>
          
          <div className="space-y-3">
            <Link to="/login">
              <Button className="w-full">
                Go to login
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
