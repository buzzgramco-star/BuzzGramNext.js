import Link from 'next/link';
import type { Category, Subcategory } from '@/types';

interface CategoryShowcaseProps {
  categories: Category[];
  subcategories: Subcategory[];
}

export default function CategoryShowcase({ categories, subcategories }: CategoryShowcaseProps) {
  // Get subcategories for a specific category
  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  // Category icons and colors
  const categoryConfig: Record<string, { icon: string; gradient: string; textColor: string }> = {
    'beauty': {
      icon: '💅',
      gradient: 'from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20',
      textColor: 'text-pink-600 dark:text-pink-400'
    },
    'food': {
      icon: '🍰',
      gradient: 'from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    'events': {
      icon: '🎉',
      gradient: 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the perfect service for your needs across beauty, food, and events
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category) => {
            const config = categoryConfig[category.slug] || categoryConfig['beauty'];
            const categorySubcategories = getSubcategoriesForCategory(category.id);

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-dark-bg rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-dark-border hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Category Icon & Name */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${config.gradient} rounded-2xl text-4xl mb-4`}>
                    {config.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                </div>

                {/* Subcategories List */}
                {categorySubcategories.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {categorySubcategories.slice(0, 6).map((subcategory) => (
                        <span
                          key={subcategory.id}
                          className="px-3 py-1 bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 text-sm rounded-full border border-gray-200 dark:border-dark-border"
                        >
                          {subcategory.name}
                        </span>
                      ))}
                      {categorySubcategories.length > 6 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 text-sm rounded-full border border-gray-200 dark:border-dark-border">
                          +{categorySubcategories.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Browse Button */}
                <Link
                  href={`/city/toronto/${category.slug}`}
                  className={`block w-full text-center px-6 py-3 bg-gradient-to-r ${config.gradient} ${config.textColor} font-semibold rounded-lg hover:shadow-md transition-all border-2 border-transparent hover:border-current`}
                >
                  Browse {category.name} →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
