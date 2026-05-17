import { memo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { formatCurrency } from '../../utils/index.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-panel text-xs">
      <p className="font-semibold text-stone-900 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'revenue' || p.dataKey === 'total'
            ? formatCurrency(p.value)
            : p.value}
        </p>
      ))}
    </div>
  );
};

/**
 * RevenueChart – area chart for revenue visualization.
 */
const RevenueChart = memo(({
  data         = [],
  dataKey      = 'total',
  xKey         = 'label',
  height       = 220,
  color        = '#161210',
  gradientId   = 'revenueGrad',
  formatY,
  showGrid     = false,
  className    = ''
}) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0ede9" />}

        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#8f8278' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          hide={!formatY}
          tick={{ fontSize: 11, fill: '#8f8278' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatY}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));

RevenueChart.displayName = 'RevenueChart';
export default RevenueChart;
