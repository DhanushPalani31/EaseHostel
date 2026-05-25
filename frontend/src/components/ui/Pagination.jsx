import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination – reusable page navigation bar.
 */
const Pagination = memo(({ page, totalPages, onNext, onPrev, onPage, loading = false }) => {
  if (!totalPages || totalPages <= 1) return null;

  // Build page numbers window (show 5 around current)
  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={page === 1 || loading}
        className="btn-outline btn-sm p-2 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      {/* First page if not in window */}
      {pages[0] > 1 && (
        <>
          <button onClick={() => onPage?.(1)}
            className="w-8 h-8 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 transition-colors">
            1
          </button>
          {pages[0] > 2 && <span className="text-stone-300 text-sm px-1">…</span>}
        </>
      )}

      {/* Page window */}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage?.(p)}
          disabled={loading}
          className={`w-8 h-8 rounded-xl text-sm font-medium transition-all duration-150
            ${p === page
              ? 'bg-stone-900 text-white'
              : 'text-stone-500 hover:bg-stone-100'
            }`}
        >
          {p}
        </button>
      ))}

      {/* Last page if not in window */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-stone-300 text-sm px-1">…</span>
          )}
          <button onClick={() => onPage?.(totalPages)}
            className="w-8 h-8 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 transition-colors">
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={onNext}
        disabled={page === totalPages || loading}
        className="btn-outline btn-sm p-2 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';
export default Pagination;
