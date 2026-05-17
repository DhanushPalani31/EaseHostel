import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Camera, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { updateProfile } from '../../store/slices/authSlice.js';
import { formatCurrency } from '../../utils/index.js';
import api from '../../services/api.js';
import { slideUp } from '../../animations/variants.js';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '', hostelBlock: user?.hostelBlock || '',
    roomNumber: user?.roomNumber || '', phoneNumber: user?.phoneNumber || ''
  });
  const [imgFile, setImgFile]     = useState(null);
  const [preview, setPreview]     = useState(user?.profileImage || null);
  const [spending, setSpending]   = useState([]);

  useEffect(() => {
    api.get('/analytics/spending').then(r => setSpending(r.data.data.data)).catch(()=>{});
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k, v));
    if (imgFile) fd.append('profileImage', imgFile);
    dispatch(updateProfile(fd));
  };

  const spendingData = spending.map(d => ({
    month: d._id,
    spent: d.spent,
    orders: d.count
  }));

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Profile</h1>

      {/* ── Avatar + form ───────────────────────────────── */}
      <motion.div {...slideUp} className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-stone-100 overflow-hidden">
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-stone-400">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                }
              </div>
              <label htmlFor="avatar"
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-stone-900 rounded-xl flex items-center justify-center cursor-pointer hover:bg-stone-700 transition-colors">
                <Camera size={12} className="text-white"/>
                <input id="avatar" type="file" accept="image/*" className="sr-only" onChange={handleImage}/>
              </label>
            </div>
            <div>
              <p className="font-semibold text-stone-900">{user?.name}</p>
              <p className="text-sm text-stone-400 capitalize">{user?.role}</p>
              <p className="text-xs text-stone-400">{user?.email}</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name:'name',        label:'Full name',     type:'text' },
              { name:'phoneNumber', label:'Phone number',  type:'tel' },
              { name:'hostelBlock', label:'Hostel block',  type:'text' },
              { name:'roomNumber',  label:'Room number',   type:'text' },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input type={type} value={form[name]}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                  className="input"/>
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-md">
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </motion.div>

      {/* ── Spending analytics ──────────────────────────── */}
      {spendingData.length > 0 && (
        <motion.div {...slideUp} transition={{ delay: 0.08 }} className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-stone-500"/>
            <h3 className="section-title">Monthly spending</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingData} margin={{ top:4, right:4, bottom:0, left:0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#d4952a" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#d4952a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#8f8278' }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip
                formatter={(v) => [formatCurrency(v), 'Spent']}
                contentStyle={{ fontSize:12, border:'1px solid #e8e4df', borderRadius:10, boxShadow:'none' }}/>
              <Area type="monotone" dataKey="spent" stroke="#d4952a" strokeWidth={2}
                fill="url(#spendGrad)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
