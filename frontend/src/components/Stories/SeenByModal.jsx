import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import axios from 'axios';

const SeenByModal = ({ isOpen, onClose, storyId }) => {
  const [viewers, setViewers] = useState([]);

  useEffect(() => {
    if (!isOpen || !storyId) return;
    const fetch = async () => {
      try {
        let res;
        try {
          res = await axios.get('/stories');
        } catch (err) {
          if (err.response && err.response.status === 401) {
            res = await axios.get('/stories/public');
          } else throw err;
        }
        if (res && res.data && res.data.success) {
          const s = (res.data.stories || []).find(st => st._id === storyId);
          setViewers(s?.viewers || []);
        }
      } catch (err) {
        console.error('Fetch story viewers failed', err);
      }
    };
    fetch();
  }, [isOpen, storyId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seen by">
      <div className="space-y-3">
        {viewers.length === 0 ? (
          <div className="text-gray-500">No viewers yet.</div>
        ) : (
          viewers.map(v => (
            <div key={v._id} className="flex items-center space-x-3">
              <img src={v.avatar} alt={v.username} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <div className="font-medium text-sm">{v.username}</div>
                <div className="text-xs text-gray-500">Viewed</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default SeenByModal;
