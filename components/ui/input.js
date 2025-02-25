import React from 'react';

const Input = ({ value, onChange, placeholder }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="px-4 py-2 border rounded mb-2 w-full"
    />
  );
};

export default Input;