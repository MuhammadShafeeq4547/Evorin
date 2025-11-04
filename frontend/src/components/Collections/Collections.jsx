// src/components/Collections/Collections.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, MoreVertical, Edit2, Trash2, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import Input from '../UI/Input';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/collections');
      
      if (response.data.success) {
        setCollections(response.data.collections);
      }
    } catch (error) {
      console.error('Fetch collections error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/collections', formData);
      
      if (response.data.success) {
        setCollections([response.data.collection, ...collections]);
        setShowCreateModal(false);
        setFormData({ name: '', description: '', isPrivate: true });
      }
    } catch (error) {
      console.error('Create collection error:', error);
      alert(error.response?.data?.message || 'Failed to create collection');
    }
  };

  const handleUpdateCollection = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`/collections/${selectedCollection._id}`, formData);
      
      if (response.data.success) {
        setCollections(collections.map(c => 
          c._id === selectedCollection._id ? response.data.collection : c
        ));
        setShowEditModal(false);
        setSelectedCollection(null);
        setFormData({ name: '', description: '', isPrivate: true });
      }
    } catch (error) {
      console.error('Update collection error:', error);
      alert(error.response?.data?.message || 'Failed to update collection');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    
    try {
      const response = await axios.delete(`/collections/${collectionId}`);
      
      if (response.data.success) {
        setCollections(collections.filter(c => c._id !== collectionId));
      }
    } catch (error) {
      console.error('Delete collection error:', error);
      alert('Failed to delete collection');
    }
  };

  const openEditModal = (collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      isPrivate: collection.isPrivate
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Collections</h1>
          <p className="text-gray-600">Organize your saved posts</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Collections Yet</h3>
          <p className="text-gray-600 mb-6">
            Create collections to organize your saved posts
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {collections.map((collection) => (
              <motion.div
                key={collection._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => navigate(`/collections/${collection._id}`)}
              >
                {/* Cover Images Grid */}
                <div className="grid grid-cols-2 gap-0.5 h-full">
                  {collection.posts?.slice(0, 4).map((post, index) => (
                    <div
                      key={post._id}
                      className={`relative ${
                        collection.posts.length === 1 ? 'col-span-2 row-span-2' :
                        collection.posts.length === 2 && index === 0 ? 'col-span-2' :
                        collection.posts.length === 3 && index === 0 ? 'col-span-2' : ''
                      }`}
                    >
                      <img
                        src={post.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  
                  {collection.posts?.length === 0 && (
                    <div className="col-span-2 row-span-2 flex items-center justify-center bg-gray-100">
                      <Folder className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex flex-col items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center px-4">
                    <p className="font-semibold mb-1">{collection.name}</p>
                    <p className="text-sm">
                      {collection.posts?.length || 0} {collection.posts?.length === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                </div>

                {/* Privacy Badge */}
                <div className="absolute top-2 right-2">
                  {collection.isPrivate ? (
                    <Lock className="w-4 h-4 text-white drop-shadow" />
                  ) : (
                    <Globe className="w-4 h-4 text-white drop-shadow" />
                  )}
                </div>

                {/* Actions Menu */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(collection);
                    }}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', description: '', isPrivate: true });
        }}
        title="Create New Collection"
      >
        <form onSubmit={handleCreateCollection} className="space-y-4">
          <Input
            label="Collection Name"
            type="text"
            placeholder="e.g., Travel, Food, Inspiration"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            maxLength={50}
          />

          <Input
            label="Description (Optional)"
            as="textarea"
            rows={3}
            placeholder="What's this collection about?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={200}
          />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Private Collection</p>
              <p className="text-sm text-gray-600">Only you can see this collection</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Create Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Collection Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCollection(null);
          setFormData({ name: '', description: '', isPrivate: true });
        }}
        title="Edit Collection"
      >
        <form onSubmit={handleUpdateCollection} className="space-y-4">
          <Input
            label="Collection Name"
            type="text"
            placeholder="e.g., Travel, Food, Inspiration"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            maxLength={50}
          />

          <Input
            label="Description (Optional)"
            as="textarea"
            rows={3}
            placeholder="What's this collection about?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={200}
          />

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Private Collection</p>
              <p className="text-sm text-gray-600">Only you can see this collection</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                handleDeleteCollection(selectedCollection._id);
                setShowEditModal(false);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.name.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Collections;