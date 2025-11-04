// src/components/Analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye,
  Share2,
  Bookmark
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [audience, setAudience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchAnalytics();
    fetchAudience();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/analytics/user?days=${timeRange}`);
      
      if (response.data.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAudience = async () => {
    try {
      const response = await axios.get('/analytics/audience');
      
      if (response.data.success) {
        setAudience(response.data);
      }
    } catch (error) {
      console.error('Fetch audience error:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your performance and audience growth
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === days
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Profile Views"
          value={analytics?.totals?.profileViews?.toLocaleString() || 0}
          change={12}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="Total Likes"
          value={analytics?.totals?.totalLikes?.toLocaleString() || 0}
          change={8}
          icon={Heart}
          color="red"
        />
        <StatCard
          title="Comments"
          value={analytics?.totals?.totalComments?.toLocaleString() || 0}
          change={-3}
          icon={MessageCircle}
          color="green"
        />
        <StatCard
          title="Engagement Rate"
          value={analytics?.overview?.engagementRate || '0%'}
          change={5}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Engagement Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.daily || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#6B7280"
              />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="likes" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Likes"
              />
              <Line 
                type="monotone" 
                dataKey="comments" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Comments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Follower Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Follower Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={audience?.followerGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#6B7280"
              />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="gained" fill="#3B82F6" name="Gained" />
              <Bar dataKey="lost" fill="#EF4444" name="Lost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audience Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Audience Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {audience?.audience?.total?.toLocaleString() || 0}
            </p>
            <p className="text-gray-600 dark:text-gray-400">Total Followers</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {audience?.audience?.recentGrowth?.toLocaleString() || 0}
            </p>
            <p className="text-gray-600 dark:text-gray-400">New (30 days)</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {audience?.audience?.growthRate || '0%'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">Growth Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity Summary
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Posts Created</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {analytics?.totals?.postsCreated || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Stories Created</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {analytics?.totals?.storiesCreated || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Reels Created</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {analytics?.totals?.reelsCreated || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Shares</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {analytics?.totals?.totalShares || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;