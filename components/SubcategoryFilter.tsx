"use client";

import type { Subcategory } from '@/types';

interface SubcategoryFilterProps {
  subcategories: Subcategory[];
  selectedSubcategory: number | null;
  onSelectSubcategory: (subcategoryId: number | null) => void;
}

export default function SubcategoryFilter({
  subcategories,
  selectedSubcategory,
  onSelectSubcategory,
}: SubcategoryFilterProps) {
  if (subcategories.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Subcategories
      </h3>
      <div className="flex flex-wrap gap-3">
        {/* Subcategory Pills */}
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onSelectSubcategory(subcategory.id)}
            className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedSubcategory === subcategory.id
                ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            <span className="text-lg">{subcategory.icon}</span>
            <span>{subcategory.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
