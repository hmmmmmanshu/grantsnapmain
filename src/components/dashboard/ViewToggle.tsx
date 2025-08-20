
import React from 'react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  selectedView: 'all' | 'grants' | 'investors';
  onViewChange: (view: 'all' | 'grants' | 'investors') => void;
}

const ViewToggle = ({ selectedView, onViewChange }: ViewToggleProps) => {
  const options = [
    { value: 'all' as const, label: 'All' },
    { value: 'grants' as const, label: 'Grants' },
    { value: 'investors' as const, label: 'Investors' }
  ];

  return (
    <div className="flex items-center">
      <div className="inline-flex bg-gray-100 rounded-lg p-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onViewChange(option.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
              selectedView === option.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ViewToggle;
