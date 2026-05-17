import { memo } from 'react';

// Generic skeleton loader with shimmer animation
const Skeleton = memo(({ className = '', rounded = 'rounded-lg' }) => (
  <div className={`skeleton ${rounded} ${className}`} />
));
Skeleton.displayName = 'Skeleton';

// Product card skeleton
export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="aspect-square" rounded="rounded-none" />
    <div className="p-3.5 space-y-2.5">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="w-8 h-8" rounded="rounded-xl" />
      </div>
    </div>
  </div>
);

// Order row skeleton
export const OrderRowSkeleton = () => (
  <div className="card p-4 flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-9 h-9" rounded="rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-20" rounded="rounded-full" />
      <Skeleton className="h-5 w-16" />
    </div>
  </div>
);

// Stat card skeleton
export const StatCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="w-10 h-10" rounded="rounded-xl" />
    <Skeleton className="h-7 w-24" />
    <Skeleton className="h-3 w-32" />
  </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
