import React from 'react';
import { Link } from 'react-router-dom';

const HighlightCard = ({ highlight }) => {
  const cover = highlight.coverUrl || (highlight.stories && highlight.stories[0]?.mediaUrl) || '/default-story-cover.png';
  return (
    <Link to={`/profile/${highlight.user}/highlights/${highlight._id}`} className="flex flex-col items-center min-w-[100px]">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
        <img src={cover} alt={highlight.title} className="w-full h-full object-cover" />
      </div>
      <div className="text-xs text-gray-700 mt-2">{highlight.title}</div>
    </Link>
  );
};

export default HighlightCard;
