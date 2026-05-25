import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, UserX, Megaphone, Send, X } from 'lucide-react';
import api from '../../services/api.js';
import { formatDate } from '../../utils/index.js';
import { staggerContainer, staggerItem } from '../../animations/variants.js';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [broadcast, setBroadcast] = useState({ open: false, message: '', type: 'promo' });
  const [sending,   setSending]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (userId, isActive) => {
    try {
      await api.patch(`/users/${userId}/toggle`);
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
      setUsers(u => u.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch { toast.error('Failed to update user'); }
  };

  const handleBroadcast = async () => {
    if (!broadcast.message.trim()) { toast.error('Message is required'); return; }
    setSending(true);
    try {
      await api.post('/users/broadcast', { message: broadcast.message, type: broadcast.type });
      toast.success('Broadcast sent to all students!');
      setBroadcast({ open: false, message: '', type: 'promo' });
    } catch { toast.error('Broadcast failed'); }
    finally { setSending(false); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;

  return (
    <div className="p-5 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Students</h1>
          <p className="text-stone-400 text-sm">{users.length} registered accounts</p>
        </div>
        <button onClick={() => setBroadcast(b => ({ ...b, open: true }))}
          className="btn-primary btn-md">
          <Megaphone size={14} /> Broadcast
        </button>
      </div>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate"
        className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: users.length,   color: 'bg-stone-100', icon: Users },
          { label: 'Active',         value: activeCount,    color: 'bg-green-50',  icon: UserCheck },
          { label: 'Deactivated',    value: inactiveCount,  color: 'bg-red-50',    icon: UserX },
        ].map(stat => (
          <motion.div key={stat.label} variants={staggerItem} className="card p-4">
            <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={16} className="text-stone-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900 tracking-tighter">{stat.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…" className="input pl-9" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Hostel</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(u => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-stone-50/50 transition-colors">
                    {/* Avatar + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                          {u.profileImage
                            ? <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-stone-500">
                                {u.name?.[0]?.toUpperCase()}
                              </div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-900 truncate">{u.name}</p>
                          <p className="text-xs text-stone-400 truncate hidden sm:block">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-stone-600 text-xs">{u.email}</p>
                      {u.phoneNumber && <p className="text-stone-400 text-xs">{u.phoneNumber}</p>}
                    </td>

                    {/* Hostel */}
                    <td className="px-4 py-3 hidden md:table-cell text-stone-600 text-xs">
                      {u.hostelBlock
                        ? `Block ${u.hostelBlock}, Room ${u.roomNumber}`
                        : <span className="text-stone-300">—</span>
                      }
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 hidden lg:table-cell text-stone-500 text-xs">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(u._id, u.isActive)}
                        className={`btn-sm text-xs px-3 py-1 rounded-lg font-medium transition-all
                          ${u.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-stone-400">
                <Users size={28} className="mx-auto mb-2 text-stone-300" />
                No students found
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Broadcast Modal ──────────────────────────────── */}
      <AnimatePresence>
        {broadcast.open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setBroadcast(b => ({ ...b, open: false }))} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center">
                      <Megaphone size={14} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-stone-900">Broadcast Message</h2>
                  </div>
                  <button onClick={() => setBroadcast(b => ({ ...b, open: false }))}
                    className="btn-ghost btn-sm p-1.5">
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Notification type</label>
                    <select value={broadcast.type}
                      onChange={e => setBroadcast(b => ({ ...b, type: e.target.value }))}
                      className="input">
                      <option value="promo">Promo / Offer</option>
                      <option value="system">System Announcement</option>
                      <option value="order">Order Update</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Message</label>
                    <textarea
                      rows={4}
                      value={broadcast.message}
                      onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))}
                      placeholder="Write your announcement here…"
                      className="input resize-none"
                    />
                    <p className="text-xs text-stone-400 mt-1">
                      This will be sent to all {activeCount} active students.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setBroadcast(b => ({ ...b, open: false }))}
                      className="btn-outline btn-md flex-1">
                      Cancel
                    </button>
                    <button onClick={handleBroadcast} disabled={sending || !broadcast.message.trim()}
                      className="btn-primary btn-md flex-1">
                      {sending
                        ? <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                          </span>
                        : <><Send size={14} /> Send to all</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
