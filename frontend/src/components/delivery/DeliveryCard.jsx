import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, ArrowRight, Truck } from 'lucide-react';
import PlatformBadge from './PlatformBadge.jsx';
import DeliveryTimeline from './DeliveryTimeline.jsx';
import { timeAgo, formatDateTime } from '../../utils/index.js';

const STATUS_COLOR = {
  Requested:          'badge-amber',
  Accepted:           'badge-blue',
  'Waiting at Gate':  'badge-blue',
  'Picked Up':        'badge-blue',
  'Out for Delivery': 'badge-amber',
  Delivered:          'badge-green',
  Cancelled:          'badge-red',
};

/**
 * DeliveryCard – compact card for delivery list views.
 * Shows platform, status, address, assigned staff.
 */
const DeliveryCard = memo(({ delivery, showTrack = true, showTimeline = false }) => {
  const isActive    = !['Delivered', 'Cancelled'].includes(delivery.deliveryStatus);
  const isCancelled = delivery.deliveryStatus === 'Cancelled';

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`card overflow-hidden transition-all duration-200
        ${isCancelled ? 'opacity-70' : ''}`}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <PlatformBadge platform={delivery.platformName} size="sm" />
            {delivery.trackingId && (
              <span className="text-xs font-mono text-stone-400 hidden sm:inline">
                #{delivery.trackingId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`badge ${STATUS_COLOR[delivery.deliveryStatus] || 'badge-stone'}`}>
              {delivery.deliveryStatus}
            </span>
            <span className="text-xs text-stone-400">{timeAgo(delivery.createdAt)}</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <MapPin size={11} className="text-stone-400" />
            Block {delivery.hostelBlock}, Room {delivery.roomNumber}
          </div>
          {delivery.contactNumber && (
            <a href={`tel:${delivery.contactNumber}`}
              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors">
              <Phone size={11} />
              {delivery.contactNumber}
            </a>
          )}
        </div>

        {/* ETA */}
        {delivery.estimatedDeliveryTime && isActive && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-700
            bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 w-fit">
            <Clock size={11} />
            ETA: {formatDateTime(delivery.estimatedDeliveryTime)}
          </div>
        )}

        {/* Assigned staff */}
        {delivery.assignedStaff && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-stone-50 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
              {delivery.assignedStaff.photo
                ? <img src={delivery.assignedStaff.photo} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                    {delivery.assignedStaff.name?.[0]}
                  </div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-700 truncate">{delivery.assignedStaff.name}</p>
            </div>
            <a href={`tel:${delivery.assignedStaff.phone}`}
              className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center hover:bg-green-200">
              <Phone size={10} className="text-green-600" />
            </a>
          </div>
        )}

        {/* Inline timeline for active deliveries */}
        {showTimeline && isActive && !isCancelled && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <DeliveryTimeline
              currentStatus={delivery.deliveryStatus}
              orientation="horizontal"
            />
          </div>
        )}

        {/* Track button */}
        {showTrack && (
          <Link to={`/parcel-tracking/${delivery._id}`}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-stone-600
              hover:text-stone-900 transition-colors">
            <Truck size={12} />
            Track parcel
            <ArrowRight size={11} />
          </Link>
        )}
      </div>
    </motion.div>
  );
});

DeliveryCard.displayName = 'DeliveryCard';
export default DeliveryCard;
