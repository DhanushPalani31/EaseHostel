import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { fetchProducts } from '../../store/slices/productSlice.js';
import { useDebounce, usePagination } from '../../hooks/index.js';
import ProductCard from '../../components/common/ProductCard.jsx';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const CATEGORIES = ['All', 'Snacks', 'Stationery', 'Toiletries', 'Drinks', 'Instant Foods', 'Daily Essentials', 'Personal Care'];
const SORTS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' }
];

const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="skeleton aspect-square" />
    <div className="p-3.5 space-y-2">
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="flex justify-between items-center pt-1">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton w-8 h-8 rounded-xl" />
      </div>
    </div>
  </div>
);

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search,   setSearch]   = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort,     setSort]     = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange]   = useState({ min: '', max: '' });

  const debouncedSearch = useDebounce(search, 400);
  const { page, nextPage, prevPage, resetPage } = usePagination();

  const { items: products, loading, pagination } = useSelector(s => s.products);

  const load = useCallback(() => {
    const params = {
      page,
      limit: 12,
      sort,
      ...(debouncedSearch               && { search: debouncedSearch }),
      ...(category !== 'All'            && { category }),
      ...(priceRange.min                && { minPrice: priceRange.min }),
      ...(priceRange.max                && { maxPrice: priceRange.max }),
    };
    dispatch(fetchProducts(params));
  }, [dispatch, page, sort, debouncedSearch, category, priceRange]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  useEffect(() => { resetPage(); }, [debouncedSearch, category, sort]);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setShowFilters(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1">Shop</h1>
        <p className="text-stone-500 text-sm">
          {pagination ? `${pagination.total} products available` : 'Browse all essentials'}
        </p>
      </div>

      {/* ── Search + Filter bar ─────────────────────────── */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input pr-8 appearance-none min-w-[140px] cursor-pointer">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        </div>

        <button onClick={() => setShowFilters(s => !s)}
          className={`btn-sm flex items-center gap-1.5 ${showFilters ? 'btn-primary' : 'btn-outline'}`}>
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* ── Filter panel ────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden mb-5">
            <div className="card p-4 space-y-4">
              {/* Price range */}
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Price range</p>
                <div className="flex gap-2 items-center">
                  <input type="number" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                    placeholder="Min ₹" className="input text-sm" />
                  <span className="text-stone-300">–</span>
                  <input type="number" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                    placeholder="Max ₹" className="input text-sm" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category chips ──────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => handleCategorySelect(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150
              ${category === cat
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* ── Products grid ───────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-stone-500 font-medium">No products found</p>
          <p className="text-stone-400 text-sm mt-1">Try a different search or category</p>
          <button onClick={() => { setSearch(''); setCategory('All'); }}
            className="btn-outline btn-sm mt-4">Clear filters</button>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <motion.div key={product._id} variants={staggerItem}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Pagination ──────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button onClick={prevPage} disabled={page === 1} className="btn-outline btn-sm">
            Previous
          </button>
          <span className="text-sm text-stone-500">
            Page {page} of {pagination.totalPages}
          </span>
          <button onClick={nextPage} disabled={page === pagination.totalPages} className="btn-outline btn-sm">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
