import { memo } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { label: 'All',              emoji: '🛒' },
  { label: 'Snacks',           emoji: '🍿' },
  { label: 'Drinks',           emoji: '🥤' },
  { label: 'Instant Foods',    emoji: '🍜' },
  { label: 'Stationery',       emoji: '✏️' },
  { label: 'Toiletries',       emoji: '🧴' },
  { label: 'Personal Care',    emoji: '🧼' },
  { label: 'Daily Essentials', emoji: '🛍️' },
];

/**
 * CategoryFilter – horizontal scrollable category chip bar.
 */
const CategoryFilter = memo(({ selected = 'All', onSelect }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
    {CATEGORIES.map(cat => {
      const isActive = selected === cat.label;
      return (
        <motion.button
          key={cat.label}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect?.(cat.label)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium
                      transition-all duration-150 border
            ${isActive
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
            }`}
        >
          <span className="text-base leading-none">{cat.emoji}</span>
          {cat.label}
        </motion.button>
      );
    })}
  </div>
));

CategoryFilter.displayName = 'CategoryFilter';
export default CategoryFilter;
