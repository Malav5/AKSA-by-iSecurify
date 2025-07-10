import React from 'react';

export const Input = ({ value, onChange, placeholder, type = 'text', className = '' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`border px-3 py-2 rounded-md w-full ${className}`}
  />
);
