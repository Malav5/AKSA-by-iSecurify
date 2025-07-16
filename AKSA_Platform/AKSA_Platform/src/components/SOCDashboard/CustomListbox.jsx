import React from 'react';
import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

const CustomListbox = ({ options, value, onChange, label, className = '' }) => {
  return (
    <div className={`relative w-48 ${className}`}>
      {label && (
        <label className="mb-1 font-medium flex items-center gap-1 text-gray-700">{label}</label>
      )}
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              className={`w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#800080] flex items-center justify-between ${open ? 'ring-2 ring-[#800080]' : ''}`}
            >
              <span className="block truncate">{value}</span>
              <ChevronDown className="w-4 h-4 ml-2 text-primary" />
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt -1 w-full bg-white shadow-lg max-h-60 rounded-lg  text-base ring-opacity-5 overflow-auto focus:outline-none animate-fade-in-up border border-gray-200 scrollbar-hide">
              {options.map((option) => (
                <Listbox.Option
                  key={option}
                  value={option}
                  className={({ active, selected }) =>
                    `cursor-pointer select-none relative py-2 pl-10 pr-4 transition-colors ${
                      active ? 'bg-primary/10 text-primary' : 'text-gray-900'
                    } ${selected ? 'font-semibold bg-secondary text-primary' : ''}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{option}</span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check className="w-4 h-4" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        )}
      </Listbox>
    </div>
  );
};

export default CustomListbox; 