import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating }) => {
  const handleRating = (value) => {
    setRating(value);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((value) => (
        <FaStar
          key={value}
          className={`cursor-pointer text-2xl ${
            value <= rating ? 'text-yellow-500' : 'text-gray-300'
          }`}
          onClick={() => handleRating(value)}
        />
      ))}
    </div>
  );
};

export default StarRating;
