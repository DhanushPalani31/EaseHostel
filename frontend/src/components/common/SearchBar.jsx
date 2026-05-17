import { useState, memo } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/index.js';
import { useEffect } from 'react';

/**
 * SearchBar – controlled search input with built-in debounce.
 * Calls onSearch after the debounce delay, not on every keystroke.
 */
const SearchBar = memo(({
  placeholder = 'Search…',
  onSearch,
  delay       = 400,
  className   = '',
  defaultValue = ''
}) => {
  const [value, setValue] = useState(defaultValue);
  const debounced = useDebounce(value, delay);

  useEffect(() => {
    onSearch?.(debounced);
  }, [debounced]);

  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 pr-9"
      />
      {value && (
        <button
          onClick={() => { setValue(''); onSearch?.(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
export default SearchBar;
