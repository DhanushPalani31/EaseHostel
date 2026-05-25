// ═══════════════════════════════════════ AdminAnalytics.jsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api.js';
import { formatCurrency } from '../../utils/index.js';

const COLORS = ['#161210','#d4952a','#16a34a','#2563eb','#dc2626','#9333ea','#0891b2'];

export function AdminAnalytics() {
  const [monthly,    setMonthly]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/monthly'),
      api.get('/analytics/categories')
    ]).then(([m, c]) => {
      setMonthly(m.data.data.data.map(d => ({
        label: `${d._id.year}-${String(d._id.month).padStart(2,'0')}`,
        revenue: d.total, orders: d.count
      })));
      setCategories(c.data.data.data.map(d => ({ name: d._id, revenue: d.revenue, qty: d.totalQty })));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 space-y-4">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-64 rounded-2xl"/>)}</div>;

  return (
    <div className="p-5 lg:p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Analytics</h1>

      <div className="card p-5">
        <h3 className="section-title mb-5">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly} margin={{top:4,right:4,bottom:0,left:0}}>
            <XAxis dataKey="label" tick={{fontSize:11,fill:'#8f8278'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:'#8f8278'}} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={(v,n) => [n==='revenue' ? formatCurrency(v) : v, n==='revenue'?'Revenue':'Orders']}
              contentStyle={{fontSize:12,border:'1px solid #e8e4df',borderRadius:10}}/>
            <Bar dataKey="revenue" fill="#161210" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="section-title mb-5">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="revenue">
                {categories.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={v=><span style={{fontSize:11,color:'#574e47'}}>{v}</span>}/>
              <Tooltip formatter={v=>[formatCurrency(v),'Revenue']}
                contentStyle={{fontSize:12,border:'1px solid #e8e4df',borderRadius:10}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categories.map((c,i) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                <span className="text-sm text-stone-700 flex-1">{c.name}</span>
                <span className="text-xs text-stone-400">{c.qty} sold</span>
                <span className="text-sm font-semibold text-stone-900">{formatCurrency(c.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminAnalytics;
