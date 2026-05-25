import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle, ArrowUpRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../services/api.js';
import { formatCurrency, formatDate, getOrderStatusColor } from '../../utils/index.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const COLORS = ['#161210', '#d4952a', '#16a34a', '#2563eb', '#dc2626'];

const StatCard = ({ label, value, sub, icon: Icon, trend, color = 'bg-stone-100' }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
        <Icon size={17} className="text-stone-600" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
          <ArrowUpRight size={12}/>{trend}
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-stone-900 tracking-tighter mb-0.5">{value}</p>
    <p className="text-xs text-stone-500">{label}</p>
    {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/monthly')
    ]).then(([s, m]) => {
      setStats(s.data.data);
      setMonthly(m.data.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return (
    <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({length:8}).map((_,i)=><div key={i} className="skeleton h-28 rounded-2xl"/>)}
    </div>
  );

  const weeklyChartData = stats.weeklyRevenue.map(d => ({
    day:   d._id.slice(5),
    total: d.total
  }));

  const monthlyChartData = monthly.map(d => ({
    month: `${d._id.year}-${String(d._id.month).padStart(2,'0')}`,
    total: d.total,
    count: d.count
  }));

  const orderPieData = [
    { name: 'Pending',    value: stats.pendingOrders },
    { name: 'Processing', value: stats.processingOrders },
    { name: 'Delivered',  value: stats.deliveredOrders },
    { name: 'Cancelled',  value: stats.cancelledOrders }
  ].filter(d => d.value > 0);

  return (
    <div className="p-5 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-stone-400 text-sm">HostelEase admin overview</p>
      </div>

      {/* ── KPI Stats ──────────────────────────────────── */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={staggerItem}>
          <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)}
            sub={`${stats.totalOrdersPaid} paid orders`} icon={TrendingUp} color="bg-green-50"/>
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Pending Orders" value={stats.pendingOrders}
            sub="Awaiting processing" icon={ShoppingBag} color="bg-amber-50"/>
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Total Students" value={stats.totalStudents}
            sub="Registered accounts" icon={Users} color="bg-blue-50"/>
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Low Stock" value={stats.lowStock.length}
            sub="Products need restock" icon={AlertTriangle} color="bg-red-50"/>
        </motion.div>
      </motion.div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Revenue */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="section-title mb-5">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyChartData} margin={{top:4,right:4,bottom:0,left:0}}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#161210" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#161210" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fontSize:11,fill:'#8f8278'}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip formatter={(v)=>[formatCurrency(v),'Revenue']}
                contentStyle={{fontSize:12,border:'1px solid #e8e4df',borderRadius:10,boxShadow:'none'}}/>
              <Area type="monotone" dataKey="total" stroke="#161210" strokeWidth={2}
                fill="url(#revGrad)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Distribution */}
        <div className="card p-5">
          <h3 className="section-title mb-5">Order Status</h3>
          {orderPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderPieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {orderPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{fontSize:11,color:'#574e47'}}>{v}</span>}/>
                <Tooltip contentStyle={{fontSize:12,border:'1px solid #e8e4df',borderRadius:10}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-stone-400 text-sm text-center py-8">No order data</p>}
        </div>
      </div>

      {/* ── Bottom Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                  {i+1}
                </span>
                <div className="w-9 h-9 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                  {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{p.productName}</p>
                  <p className="text-xs text-stone-400">{p.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-stone-900">{p.totalSold}</p>
                  <p className="text-[10px] text-stone-400">sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-amber-500"/>
            <h3 className="section-title">Low Stock Alerts</h3>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-stone-400 text-sm">All products are well stocked ✓</p>
          ) : (
            <div className="space-y-2.5">
              {stats.lowStock.slice(0,6).map(p => (
                <div key={p._id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{p.productName}</p>
                    <p className="text-xs text-stone-400">{p.category}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ml-3 ${p.stock === 0 ? 'badge-red' : 'badge-amber'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders ───────────────────────────────── */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 font-medium uppercase tracking-wider border-b border-stone-100">
                <th className="text-left pb-3">Invoice</th>
                <th className="text-left pb-3">Student</th>
                <th className="text-left pb-3 hidden sm:table-cell">Date</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-right pb-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {stats.recentOrders.map(o => (
                <tr key={o._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 font-mono text-xs text-stone-600">#{o.invoiceId}</td>
                  <td className="py-3">
                    <p className="font-medium text-stone-900">{o.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-stone-400">
                      {o.user?.hostelBlock && `Block ${o.user.hostelBlock}, Rm ${o.user.roomNumber}`}
                    </p>
                  </td>
                  <td className="py-3 text-stone-500 hidden sm:table-cell">{formatDate(o.createdAt)}</td>
                  <td className="py-3">
                    <span className={`badge ${getOrderStatusColor(o.orderStatus)}`}>{o.orderStatus}</span>
                  </td>
                  <td className="py-3 text-right font-semibold text-stone-900">{formatCurrency(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
