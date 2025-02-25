import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div className={`border p-4 rounded-md shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;