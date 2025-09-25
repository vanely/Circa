import { useState, useEffect } from 'react';
import { EventFilters as FilterType } from '@/types/event';
import { cn } from '@/utils/cn';

interface EventFiltersProps {
  className?: string;
  initialFilters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  categories?: string[];
}

const EventFilters = ({
  className,
  initialFilters,
  onFilterChange,
  categories = ['Music', 'Tech', 'Sports', 'Art', 'Food', 'Community', 'Education', 'Social', 'Business']
}: EventFiltersProps) => {
  const [filters, setFilters] = useState<FilterType>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, q: e.target.value }));
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setFilters(prev => {
      const currentCategories = prev.categories || [];
      
      if (currentCategories.includes(category)) {
        // Remove category if already selected
        return {
          ...prev,
          categories: currentCategories.filter(c => c !== category)
        };
      } else {
        // Add category if not selected
        return {
          ...prev,
          categories: [...currentCategories, category]
        };
      }
    });
  };

  // Handle date range change
  const handleDateChange = (field: 'startAtFrom' | 'startAtTo', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({ q: '', categories: [], startAtFrom: undefined, startAtTo: undefined });
  };

  return (
    <div className={cn('bg-white shadow-sm rounded-lg', className)}>
      {/* Search input */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={filters.q || ''}
            onChange={handleSearchChange}
            className="pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Filters toggle on mobile */}
      <div className="md:hidden p-3 flex justify-between items-center border-b border-gray-200">
        <button
          type="button"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {(filters.categories?.length || filters.startAtFrom || filters.startAtTo) && (
          <button
            type="button"
            className="text-sm font-medium text-gray-600 hover:text-gray-500"
            onClick={handleReset}
          >
            Reset All
          </button>
        )}
      </div>
      
      {/* Filter content */}
      <div className={cn('border-b border-gray-200', isExpanded ? 'block' : 'hidden md:block')}>
        {/* Category filters */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900">Categories</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium',
                  filters.categories?.includes(category)
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Date filters */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900">Date Range</h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium text-gray-700">
                From
              </label>
              <input
                type="date"
                id="date-from"
                value={filters.startAtFrom || ''}
                onChange={(e) => handleDateChange('startAtFrom', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="date-to" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                type="date"
                id="date-to"
                value={filters.startAtTo || ''}
                onChange={(e) => handleDateChange('startAtTo', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter actions - visible only on desktop */}
      <div className="hidden md:flex justify-end p-3">
        <button
          type="button"
          onClick={handleReset}
          className="text-sm font-medium text-gray-700 hover:text-gray-500"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default EventFilters;