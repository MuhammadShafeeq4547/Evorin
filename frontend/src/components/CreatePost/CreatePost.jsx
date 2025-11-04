import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  MapPin, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon 
} from 'lucide-react';
import axios from 'axios';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Avatar from '../UI/Avatar';
import { useAuth } from '../../contexts/AuthContext';

const CreatePost = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState('select'); // select, edit, share
  const [postData, setPostData] = useState({
    caption: '',
    location: '',
    tags: '',
    commentsDisabled: false
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length > 10) {
      alert('You can only upload up to 10 files');
      return;
    }

    const fileObjects = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setSelectedFiles(fileObjects);
    if (fileObjects.length > 0) {
      setCurrentStep('edit');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (currentImageIndex >= newFiles.length) {
      setCurrentImageIndex(Math.max(0, newFiles.length - 1));
    }
    if (newFiles.length === 0) {
      setCurrentStep('select');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === selectedFiles.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedFiles.length - 1 : prev - 1
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    selectedFiles.forEach((fileObj) => {
      formData.append('images', fileObj.file);
    });
    
    formData.append('caption', postData.caption);
    formData.append('location', postData.location);
    
    if (postData.tags) {
      const tagArray = postData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      formData.append('tags', JSON.stringify(tagArray));
    }
    
    formData.append('commentsDisabled', postData.commentsDisabled);

    try {
      const response = await axios.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'edit') {
      setCurrentStep('select');
      setSelectedFiles([]);
    } else if (currentStep === 'share') {
      setCurrentStep('edit');
    }
  };

  const handleNext = () => {
    if (currentStep === 'edit') {
      setCurrentStep('share');
    }
  };

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      selectedFiles.forEach(fileObj => {
        URL.revokeObjectURL(fileObj.preview);
      });
    };
  }, [selectedFiles]);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {currentStep !== 'select' && (
            <button onClick={handleBack} className="text-blue-600 hover:text-blue-700">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-semibold">
            {currentStep === 'select' && 'Create new post'}
            {currentStep === 'edit' && 'Edit'}
            {currentStep === 'share' && 'Share'}
          </h1>
          {currentStep === 'edit' && (
            <button 
              onClick={handleNext}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Next
            </button>
          )}
          {currentStep === 'share' && (
            <button 
              onClick={handleSubmit}
              disabled={uploading}
              className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
            >
              {uploading ? 'Sharing...' : 'Share'}
            </button>
          )}
        </div>

        {/* Content */}
        {currentStep === 'select' && (
          <div className="p-8">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drag photos and videos here
              </h3>
              <p className="text-gray-500 mb-6">
                Up to 10 files, max 50MB each
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="primary"
              >
                Select from computer
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        )}

        {currentStep === 'edit' && selectedFiles.length > 0 && (
          <div className="aspect-square relative bg-black">
            <div className="w-full h-full flex items-center justify-center">
              {selectedFiles[currentImageIndex].type === 'image' ? (
                <img
                  src={selectedFiles[currentImageIndex].preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={selectedFiles[currentImageIndex].preview}
                  className="max-w-full max-h-full object-contain"
                  controls
                />
              )}
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeFile(currentImageIndex)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Navigation arrows */}
            {selectedFiles.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {selectedFiles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-blue-500' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {currentStep === 'share' && (
          <div>
            <div className="flex items-start p-4 border-b">
              <Avatar src={user?.avatar} alt={user?.username} size="sm" className="mr-3" />
              <div className="flex-1">
                <p className="font-semibold text-sm mb-2">{user?.username}</p>
                <textarea
                  placeholder="Write a caption..."
                  value={postData.caption}
                  onChange={(e) => setPostData({...postData, caption: e.target.value})}
                  className="w-full resize-none border-none focus:outline-none text-sm"
                  rows={3}
                  maxLength={2200}
                />
                <div className="text-xs text-gray-400 text-right">
                  {postData.caption.length}/2200
                </div>
              </div>
              {selectedFiles[0] && (
                <div className="w-12 h-12 rounded border overflow-hidden">
                  <img
                    src={selectedFiles[0].preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Add location"
                    value={postData.location}
                    onChange={(e) => setPostData({...postData, location: e.target.value})}
                    className="flex-1 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Tag people (comma separated)"
                    value={postData.tags}
                    onChange={(e) => setPostData({...postData, tags: e.target.value})}
                    className="flex-1 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Turn off commenting</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={postData.commentsDisabled}
                    onChange={(e) => setPostData({...postData, commentsDisabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export { CreatePost };
