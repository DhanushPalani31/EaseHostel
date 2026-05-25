import { memo } from 'react';

const PLATFORM_CONFIG = {
  Amazon:           { emoji: '📦', bg: 'bg-amber-50  border-amber-200',  text: 'text-amber-800' },
  Flipkart:         { emoji: '🛒', bg: 'bg-blue-50   border-blue-200',   text: 'text-blue-800' },
  Zepto:            { emoji: '⚡', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800' },
  'Swiggy Instamart':{ emoji: '🧡', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800' },
  Blinkit:          { emoji: '💛', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800' },
  Myntra:           { emoji: '👗', bg: 'bg-pink-50   border-pink-200',   text: 'text-pink-800' },
  Meesho:           { emoji: '🛍️', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800' },
  Other:            { emoji: '🌐', bg: 'bg-stone-50  border-stone-200',  text: 'text-stone-700' },
};

/**
 * PlatformBadge – shows a platform logo pill with emoji and name.
 */
const PlatformBadge = memo(({ platform, size = 'sm' }) => {
  const cfg  = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.Other;
  const sizes = {
    xs: 'px-2 py-0.5 text-[10px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2'
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium
      ${cfg.bg} ${cfg.text} ${sizes[size] || sizes.sm}`}>
      <span className="text-base leading-none">{cfg.emoji}</span>
      {platform}
    </span>
  );
});

PlatformBadge.displayName = 'PlatformBadge';
export default PlatformBadge;
