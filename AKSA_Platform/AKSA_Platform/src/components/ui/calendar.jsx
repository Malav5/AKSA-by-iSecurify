import React from 'react';

export const Calendar = ({ value, onChange, className = '' }) => (
  <input
    type="date"
    value={value}
    onChange={onChange}
    className={`border px-3 py-2 rounded-md w-full ${className}`}
  />
);
