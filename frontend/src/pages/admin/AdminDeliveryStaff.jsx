import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, X, Phone, Star, Truck,
  ToggleLeft, ToggleRight, Trash2, Edit2,
  CheckCircle, Upload, TrendingUp
} from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';
import { staggerContainer, staggerItem } from '../../animations/variants.js';

const EMPTY_FORM = {
  name: '', phone: '', email: '', hostelZone: 'All',
  maxConcurrentDeliveries: 5
};

export default function AdminDeliveryStaff() {
  const [staff,    setStaff]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // 'create' | 'edit'
  const [current,  setCurrent]  = useState(EMPTY_FORM);
  const [photo,    setPhoto]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [metrics,  setMetrics]  = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [staffRes, metricsRes] = await Promise.all([
        api.get('/delivery-staff'),
        api.get('/delivery-staff/performance')
      ]);
      setStaff(staffRes.data.data.staff);
      setMetrics(metricsRes.data.data.staff);
    } catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setCurrent(EMPTY_FORM); setPhoto(null); setPreview(null); setModal('create'); };
  const openEdit   = (s)  => { setCurrent(s); setPhoto(null); setPreview(s.photo || null); setModal('edit'); };

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhoto(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(current).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
      if (photo) fd.append('photo', photo);

      if (modal === 'create') {
        await api.post('/delivery-staff', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Staff member added');
      } else {
        await api.put(`/delivery-staff/${current._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Staff updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await api.patch(`/delivery-staff/${id}/availability`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/delivery-staff/${id}/active`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await api.delete(`/delivery-staff/${id}`);
      toast.success('Staff removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const activeCount     = staff.filter(s => s.isActive).length;
  const availableCount  = staff.filter(s => s.isAvailable && s.isActive).length;
  const totalDeliveries = staff.reduce((a, s) => a + s.totalDeliveries, 0);

  return (
    <div className="p-5 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Delivery Staff</h1>
          <p className="text-stone-400 text-sm">{staff.length} staff members registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-md">
          <Plus size={14} /> Add Staff
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Staff',    value: staff.length,    color: 'bg-stone-100' },
          { label: 'Available Now',  value: availableCount,  color: 'bg-green-50' },
          { label: 'Total Deliveries', value: totalDeliveries, color: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color} border-none`}>
            <p className="text-2xl font-bold text-stone-900 tracking-tighter">{s.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Staff grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16">
          <Users size={36} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No delivery staff yet</p>
          <button onClick={openCreate} className="btn-outline btn-sm mt-4">Add first staff member</button>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(s => {
            const perf = metrics.find(m => m._id?.toString() === s._id?.toString());
            return (
              <motion.div key={s._id} variants={staggerItem}
                className={`card p-5 transition-all ${!s.isActive ? 'opacity-60' : ''}`}>
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0">
                      {s.photo
                        ? <img src={s.photo} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center font-bold text-stone-500 text-lg">
                            {s.name?.[0]?.toUpperCase()}
                          </div>
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">{s.name}</p>
                      <a href={`tel:${s.phone}`}
                        className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1">
                        <Phone size={10} /> {s.phone}
                      </a>
                    </div>
                  </div>

                  {/* Availability toggle */}
                  <button onClick={() => handleToggleAvailability(s._id)}
                    className="text-stone-400 hover:text-stone-700 transition-colors">
                    {s.isAvailable
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} />
                    }
                  </button>
                </div>

                {/* Status badges */}
                <div className="flex gap-1.5 flex-wrap mb-4">
                  <span className={`badge ${s.isActive ? 'badge-green' : 'badge-stone'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`badge ${s.isAvailable ? 'badge-green' : 'badge-amber'}`}>
                    {s.isAvailable ? 'Available' : 'Busy'}
                  </span>
                  {s.activeDeliveryCount > 0 && (
                    <span className="badge badge-blue">{s.activeDeliveryCount} active</span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Total',     value: s.totalDeliveries },
                    { label: 'Done',      value: s.completedDeliveries },
                    { label: 'Rate',      value: perf ? `${perf.completionRate?.toFixed(0)}%` : '—' },
                  ].map(m => (
                    <div key={m.label} className="text-center p-2 bg-stone-50 rounded-xl">
                      <p className="text-base font-bold text-stone-900">{m.value}</p>
                      <p className="text-[10px] text-stone-400">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Rating */}
                {s.rating > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-stone-500">{s.rating} rating</span>
                  </div>
                )}

                {/* Zone */}
                <p className="text-xs text-stone-400 mb-4">
                  Zone: <span className="font-medium text-stone-600">{s.hostelZone}</span>
                  {' · '}Max: <span className="font-medium text-stone-600">{s.maxConcurrentDeliveries} deliveries</span>
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)}
                    className="btn-outline btn-sm flex-1 text-xs">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleToggleActive(s._id)}
                    className={`btn-sm text-xs px-3 ${s.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                    } rounded-xl`}>
                    {s.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(s._id)}
                    className="btn-ghost btn-sm p-2 hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Performance table */}
      {metrics.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-stone-400" />
            <h3 className="section-title">Performance Leaderboard</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wider">
                  <th className="text-left px-3 py-2.5">Staff</th>
                  <th className="text-center px-3 py-2.5">Total</th>
                  <th className="text-center px-3 py-2.5">Completed</th>
                  <th className="text-center px-3 py-2.5">Active</th>
                  <th className="text-center px-3 py-2.5">Completion Rate</th>
                  <th className="text-center px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {metrics.map((m, i) => (
                  <tr key={m._id} className="hover:bg-stone-50/50">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center
                          text-[10px] font-bold text-stone-500">{i + 1}</span>
                        <span className="font-medium text-stone-900">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-stone-600">{m.totalDeliveries}</td>
                    <td className="px-3 py-3 text-center text-stone-600">{m.completedDeliveries}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="badge badge-blue">{m.activeDeliveryCount}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${m.completionRate >= 80 ? 'bg-green-500' : m.completionRate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(100, m.completionRate || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-stone-700">
                          {(m.completionRate || 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`badge ${m.isAvailable ? 'badge-green' : 'badge-amber'}`}>
                        {m.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-stone-900">
                    {modal === 'create' ? 'Add Staff Member' : 'Edit Staff Member'}
                  </h2>
                  <button onClick={() => setModal(null)} className="btn-ghost btn-sm p-1.5">
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Photo */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0">
                      {preview
                        ? <img src={preview} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Users size={24} />
                          </div>
                      }
                    </div>
                    <label htmlFor="staff-photo" className="btn-outline btn-sm cursor-pointer">
                      <Upload size={13} /> Upload photo
                      <input id="staff-photo" type="file" accept="image/*"
                        className="sr-only" onChange={handlePhoto} />
                    </label>
                  </div>

                  {/* Fields */}
                  <div>
                    <label className="label">Full name <span className="text-red-500">*</span></label>
                    <input required value={current.name}
                      onChange={e => setCurrent(p => ({ ...p, name: e.target.value }))}
                      placeholder="Rajan Kumar" className="input" />
                  </div>
                  <div>
                    <label className="label">Phone <span className="text-red-500">*</span></label>
                    <input required value={current.phone}
                      onChange={e => setCurrent(p => ({ ...p, phone: e.target.value }))}
                      placeholder="9876543210" className="input" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" value={current.email}
                      onChange={e => setCurrent(p => ({ ...p, email: e.target.value }))}
                      placeholder="staff@hostelease.com" className="input" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Hostel zone</label>
                      <input value={current.hostelZone}
                        onChange={e => setCurrent(p => ({ ...p, hostelZone: e.target.value }))}
                        placeholder="A,B,C or All" className="input" />
                    </div>
                    <div>
                      <label className="label">Max deliveries</label>
                      <input type="number" min="1" max="20"
                        value={current.maxConcurrentDeliveries}
                        onChange={e => setCurrent(p => ({ ...p, maxConcurrentDeliveries: Number(e.target.value) }))}
                        className="input" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModal(null)}
                      className="btn-outline btn-md flex-1">Cancel</button>
                    <button type="submit" disabled={saving}
                      className="btn-primary btn-md flex-1">
                      {saving ? 'Saving…' : modal === 'create' ? 'Add Staff' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
