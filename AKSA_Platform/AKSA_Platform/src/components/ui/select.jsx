// src/components/ui/select.jsx
import React from 'react';

export const Select = ({ value, onChange, options = [], className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`border px-3 py-2 rounded-md w-full ${className}`}
  >
    {options.map((option, idx) => (
      <option key={idx} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Dummy SelectItem if your code uses it
export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);
