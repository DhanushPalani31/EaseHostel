import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PageHeader – consistent page title + optional back button + right slot.
 */
const PageHeader = memo(({
  title,
  subtitle,
  back      = false,   // show back arrow
  backPath,            // specific path to go back to
  actions,             // JSX for right side (buttons etc.)
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) navigate(backPath);
    else navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-start justify-between gap-4 mb-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        {back && (
          <button
            onClick={handleBack}
            className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl border border-stone-200 bg-white
                       flex items-center justify-center text-stone-500
                       hover:bg-stone-50 hover:text-stone-900 transition-all duration-150"
            aria-label="Go back"
          >
            <ArrowLeft size={15} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-stone-400 text-sm mt-1.5">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
});

PageHeader.displayName = 'PageHeader';
export default PageHeader;
