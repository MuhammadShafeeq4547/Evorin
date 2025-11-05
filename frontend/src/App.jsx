import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/UI/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Header from './components/Header/Header';
import Feed from './components/Feed/Feed';
import Post from './components/Post/Post';
import ProfilePage from './components/Profile/ProfilePage';
import { ExplorePage } from './components/Explore/ExplorePage';
import MessagesPage from './components/Messages/MessagesPage';
import { CreatePost } from './components/CreatePost/CreatePost';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import EmailVerification from './components/Auth/EmailVerification';
import VerificationBanner from './components/Auth/VerificationBanner';
import MobileNav from './components/Navigation/MobileNav';

// Settings component placeholder
const SettingsPage = () => (
  <div className="max-w-2xl mx-auto px-4 py-8">
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h2 className="font-semibold mb-2">Account Settings</h2>
          <p className="text-gray-600">Manage your account preferences and privacy settings.</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h2 className="font-semibold mb-2">Notifications</h2>
          <p className="text-gray-600">Control how you receive notifications.</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-lg">
          <h2 className="font-semibold mb-2">Privacy</h2>
          <p className="text-gray-600">Manage your privacy and security settings.</p>
        </div>
      </div>
    </div>
  </div>
);

// Individual post view component
const PostView = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/posts/${postId}`);
        if (response.data.success) {
          setPost(response.data.post);
        }
      } catch (error) {
        console.error('Fetch post error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-light mb-4">Post not found</h2>
        <p className="text-gray-500">The post you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Post post={post} />
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">We're sorry, but something unexpected happened.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Instagram</h2>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
    </div>
  </div>
);

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider>
            <ToastProvider>
              <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<EmailVerification />} />
                
                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <VerificationBanner />
                      <Header />
                      <main className="pt-4 pb-20 md:pb-8">
                        <Routes>
                          {/* Feed */}
                          <Route path="/" element={<Feed />} />
                          
                          {/* Post Routes */}
                          <Route path="/p/:postId" element={<PostView />} />
                          <Route path="/create" element={<CreatePost />} />
                          
                          {/* Profile Routes */}
                          <Route path="/profile/:username" element={<ProfilePage />} />
                          
                          {/* Discovery Routes */}
                          <Route path="/explore" element={<ExplorePage />} />
                          
                          {/* Messaging Routes */}
                          <Route path="/messages" element={<MessagesPage />} />
                          <Route path="/messages/:chatId" element={<MessagesPage />} />
                          
                          {/* Settings Routes */}
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/settings/*" element={<SettingsPage />} />
                          
                          {/* Catch all redirect */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                      <MobileNav />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
              </Router>
              <ToastContainer />
            </ToastProvider>
          </ThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;