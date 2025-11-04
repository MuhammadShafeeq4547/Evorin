import React, { useState, useRef } from 'react';
import Modal from '../UI/Modal';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const StoryUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const { user } = useAuth();

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('media', file);
      const res = await axios.post('/stories', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        onUploaded(res.data.story);
        setFile(null);
        setPreview(null);
        onClose();
      }
    } catch (err) {
      console.error('Upload story failed', err);
      alert(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user?.username ? `Add Story as ${user.username}` : 'Add Story'}>
      <div className="space-y-4">
        <div className="border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
          {preview ? (
            file.type.startsWith('video') ? (
              <video src={preview} controls className="max-h-60 object-contain" />
            ) : (
              <img src={preview} alt="preview" className="max-h-60 object-contain" />
            )
          ) : (
            <div className="text-center text-gray-500 py-8">Select an image or video to share</div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={onSelect} className="hidden" />
            <button onClick={() => inputRef.current.click()} className="text-sm text-blue-600">Choose file</button>
          </div>
          <div className="space-x-2">
            <button onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-gray-600">Retry</button>
            <button onClick={upload} disabled={!file || loading} className={`px-3 py-1 rounded bg-blue-600 text-white ${loading ? 'opacity-60' : 'hover:bg-blue-700'}`}>
              {loading ? 'Uploading...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StoryUploadModal;
