"use client";

import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Categories
      </h3>
      <div className="flex flex-wrap gap-3">
        {/* All Categories Pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
            selectedCategory === null
              ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400'
          }`}
        >
          All
        </button>

        {/* Category Pills */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
