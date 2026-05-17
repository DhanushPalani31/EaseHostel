import { memo } from 'react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/index.js';

const COLORS = ['#161210', '#d4952a', '#16a34a', '#2563eb', '#dc2626', '#9333ea', '#0891b2'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-3 shadow-panel text-xs">
      <p className="font-semibold text-stone-900 mb-1">{payload[0].name}</p>
      <p className="text-stone-600">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

/**
 * CategoryPieChart – donut chart for category revenue breakdown.
 */
const CategoryPieChart = memo(({ data = [], height = 240, className = '' }) => (
  <div className={className}>
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="revenue"
          nameKey="name"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={v => (
            <span style={{ fontSize: 11, color: '#574e47' }}>{v}</span>
          )}
        />
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  </div>
));

CategoryPieChart.displayName = 'CategoryPieChart';
export default CategoryPieChart;
