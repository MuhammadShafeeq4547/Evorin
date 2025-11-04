import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import HighlightCard from './HighlightCard';

const Highlights = ({ userId }) => {
  const [highlights, setHighlights] = useState([]);

  const fetch = async () => {
    try {
      const res = await axios.get(`/stories/highlights/${userId || ''}`);
      if (res.data.success) setHighlights(res.data.highlights || []);
    } catch (err) {
      console.error('Fetch highlights failed', err);
    }
  };

  useEffect(() => { fetch(); }, [userId]);

  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="py-4">
      <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
        {highlights.map(h => (
          <motion.div key={h._id} whileHover={{ scale: 1.03 }} className="min-w-[100px]">
            <HighlightCard highlight={h} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Highlights;
