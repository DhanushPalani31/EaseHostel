import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader } from 'lucide-react';

const STEPS = [
  { key: 'Requested',         label: 'Requested',      desc: 'Request submitted' },
  { key: 'Accepted',          label: 'Accepted',        desc: 'Staff assigned' },
  { key: 'Waiting at Gate',   label: 'At Gate',         desc: 'Waiting at campus gate' },
  { key: 'Picked Up',         label: 'Picked Up',       desc: 'Parcel collected' },
  { key: 'Out for Delivery',  label: 'On The Way',      desc: 'Coming to your room' },
  { key: 'Delivered',         label: 'Delivered',       desc: 'Delivered to room ✅' },
];

/**
 * DeliveryTimeline – horizontal or vertical step tracker.
 * Used in tracking page and delivery cards.
 */
const DeliveryTimeline = memo(({ currentStatus, orientation = 'vertical', cancelled = false }) => {
  const currentIdx = STEPS.findIndex(s => s.key === currentStatus);

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
          <Circle size={14} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-700">Cancelled</p>
          <p className="text-xs text-red-400">This delivery was cancelled</p>
        </div>
      </div>
    );
  }

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center w-full">
        {STEPS.map((step, i) => {
          const isDone    = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 1.8 } : {}}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                    transition-all duration-300 flex-shrink-0
                    ${isDone    ? 'bg-stone-900 text-white' :
                      isCurrent ? 'bg-brand-500 text-white ring-2 ring-brand-200' :
                      'bg-stone-100 text-stone-400'}`}
                >
                  {isDone ? '✓' : i + 1}
                </motion.div>
                <p className={`text-[9px] font-medium text-center leading-tight max-w-[52px]
                  ${isCurrent ? 'text-stone-900' : isDone ? 'text-stone-500' : 'text-stone-300'}`}>
                  {step.label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 transition-all duration-500
                  ${isDone ? 'bg-stone-900' : 'bg-stone-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical (default)
  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const isDone    = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isPending = i > currentIdx;

        return (
          <div key={step.key} className="flex items-start gap-3">
            {/* Icon + connector line */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  transition-all duration-300
                  ${isDone    ? 'bg-stone-900 text-white' :
                    isCurrent ? 'bg-brand-500 text-white ring-4 ring-brand-100' :
                    'bg-stone-100 text-stone-300'}`}
              >
                {isDone
                  ? <CheckCircle size={15} />
                  : isCurrent
                    ? <Loader size={15} className="animate-spin" />
                    : <span className="text-xs font-bold">{i + 1}</span>
                }
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-7 my-1 transition-all duration-500
                  ${isDone ? 'bg-stone-900' : 'bg-stone-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pt-1 pb-7 flex-1">
              <p className={`text-sm font-semibold leading-none transition-colors
                ${isDone ? 'text-stone-500' : isCurrent ? 'text-stone-900' : 'text-stone-300'}`}>
                {step.label}
              </p>
              {(isCurrent || isDone) && (
                <p className="text-xs text-stone-400 mt-0.5">{step.desc}</p>
              )}
              {isCurrent && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-brand-600">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                  In progress
                </motion.span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

DeliveryTimeline.displayName = 'DeliveryTimeline';
export default DeliveryTimeline;
