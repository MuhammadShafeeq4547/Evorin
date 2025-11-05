import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Trash2, Ban, Eye, Users, FileText, AlertCircle, Loader } from 'lucide-react';
import Button from '../UI/Button';
import Avatar from '../UI/Avatar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const { user } = useAuth();
  const { push: toast } = useToast();

  // Check if user is admin
  useEffect(() => {
    if (user?.role !== 'admin') {
      toast('Access denied. Admin only.', { type: 'error' });
      window.location.href = '/';
    }
  }, [user, toast]);
  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await axios.get('/admin/users');
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } else if (activeTab === 'posts') {
        const response = await axios.get('/admin/posts');
        if (response.data.success) {
          setPosts(response.data.posts);
        }
      } else if (activeTab === 'reports') {
        const response = await axios.get('/admin/reports');
        if (response.data.success) {
          setReports(response.data.reports);
        }
      }

      // Fetch stats
      const statsResponse = await axios.get('/admin/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (error) {
      console.error('Fetch admin data error:', error);
      toast('Failed to load data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await axios.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        toast('User deleted successfully', { type: 'success' });
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast('Failed to delete user', { type: 'error' });
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const response = await axios.post(`/admin/users/${userId}/ban`);
      if (response.data.success) {
        setUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, isBlocked: true } : u
        ));
        toast('User banned successfully', { type: 'success' });
      }
    } catch (error) {
      console.error('Ban user error:', error);
      toast('Failed to ban user', { type: 'error' });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await axios.delete(`/admin/posts/${postId}`);
      if (response.data.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
        toast('Post deleted successfully', { type: 'success' });
      }
    } catch (error) {
      console.error('Delete post error:', error);
      toast('Failed to delete post', { type: 'error' });
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const response = await axios.post(`/admin/reports/${reportId}/resolve`);
      if (response.data.success) {
        setReports(prev => prev.filter(r => r._id !== reportId));
        toast('Report resolved', { type: 'success' });
      }
    } catch (error) {
      console.error('Resolve report error:', error);
      toast('Failed to resolve report', { type: 'error' });
    }
  };

  if (loading && activeTab === 'users' && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, posts, and reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Reports</p>
              <p className="text-2xl font-bold">{stats.pendingReports || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Banned Users</p>
              <p className="text-2xl font-bold">{stats.bannedUsers || 0}</p>
            </div>
            <Ban className="w-8 h-8 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {['users', 'posts', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Followers</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar} alt={u.username} size="sm" />
                        <div>
                          <p className="font-medium">{u.username}</p>
                          <p className="text-sm text-gray-500">{u.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm font-medium">{u.followers?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        u.isBlocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {u.isBlocked ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBanUser(u._id)}
                          disabled={u.isBlocked}
                          className="text-xs"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Ban
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Post</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Author</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Likes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Comments</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img 
                            src={p.images[0].url} 
                            alt="Post" 
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {p.caption || 'No caption'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{p.user?.username}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{p.likesCount || 0}</td>
                    <td className="px-6 py-4 text-sm font-medium">{p.comments?.length || 0}</td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePost(p._id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reporter</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Target</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{r.reporter?.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">
                        {r.targetUser?.username || r.targetPost?.user?.username || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{r.reason}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveReport(r._id)}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'users' && users.length === 0) ||
          (activeTab === 'posts' && posts.length === 0) ||
          (activeTab === 'reports' && reports.length === 0)) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No {activeTab} found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
