import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Search } from 'lucide-react';
import api from '../../services/api.js';
import { formatCurrency } from '../../utils/index.js';
import toast from 'react-hot-toast';

const CATEGORIES = ['Snacks','Stationery','Toiletries','Drinks','Instant Foods','Daily Essentials','Personal Care'];

const EMPTY = { productName:'', description:'', category:'Snacks', price:'', originalPrice:'', stock:'', unit:'piece', brand:'', tags:'', isFeatured:false, isTrending:false };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null); // 'create' | 'edit'
  const [current,  setCurrent]  = useState(EMPTY);
  const [imgFile,  setImgFile]  = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [saving,   setSaving]   = useState(false);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { limit: 50, ...(q && { search: q }) } });
      setProducts(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setCurrent(EMPTY); setImgFile(null); setPreview(null); setModal('create'); };
  const openEdit   = (p) => {
    setCurrent({
      ...p,
      tags:          Array.isArray(p.tags) ? p.tags.join(', ') : '',
      originalPrice: p.originalPrice || ''
    });
    setImgFile(null);
    setPreview(p.image || null);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setCurrent(EMPTY); };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(current).forEach(([k,v]) => {
        if (k === 'tags') fd.append(k, v);
        else if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
      });
      if (imgFile) fd.append('image', imgFile);

      if (modal === 'create') {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      } else {
        await api.put(`/products/${current._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Products</h1>
          <p className="text-stone-400 text-sm">{products.length} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-md">
          <Plus size={15}/> Add product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…" className="input pl-9"/>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-xs text-stone-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(p => (
                  <motion.tr key={p._id} initial={{opacity:0}} animate={{opacity:1}}
                    className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                          {p.image
                            ? <img src={p.image} alt="" className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 truncate max-w-[160px]">{p.productName}</p>
                          {p.brand && <p className="text-xs text-stone-400">{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="badge badge-stone">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-900">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock <= 10 ? 'badge-amber' : 'badge-green'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge ${p.isAvailable ? 'badge-green' : 'badge-red'}`}>
                        {p.isAvailable ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(p)}
                          className="btn-ghost btn-sm p-1.5 hover:bg-blue-50 hover:text-blue-600">
                          <Edit2 size={13}/>
                        </button>
                        <button onClick={() => handleDelete(p._id)}
                          className="btn-ghost btn-sm p-1.5 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-stone-400">No products found</div>
            )}
          </div>
        </div>
      )}

      {/* ── Product Modal ────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={closeModal}/>
            <motion.div
              initial={{opacity:0,scale:0.96,y:16}} animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:0.96,y:8}} transition={{duration:0.2,ease:[0.16,1,0.3,1]}}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-stone-900">
                    {modal === 'create' ? 'Add product' : 'Edit product'}
                  </h2>
                  <button onClick={closeModal} className="btn-ghost btn-sm p-1.5"><X size={16}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Image upload */}
                  <div>
                    <label className="label">Product image</label>
                    <label htmlFor="prod-img"
                      className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed
                                 border-stone-200 rounded-xl cursor-pointer hover:border-stone-300 hover:bg-stone-50
                                 transition-all duration-150 overflow-hidden">
                      {preview ? (
                        <img src={preview} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-stone-400">
                          <Upload size={20}/>
                          <span className="text-sm">Click to upload image</span>
                        </div>
                      )}
                      <input id="prod-img" type="file" accept="image/*" className="sr-only" onChange={handleImage}/>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="label">Product name *</label>
                      <input value={current.productName}
                        onChange={e => setCurrent(p => ({...p, productName: e.target.value}))}
                        required className="input" placeholder="e.g. Maggi Noodles 2-min"/>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="label">Category *</label>
                      <select value={current.category}
                        onChange={e => setCurrent(p => ({...p, category: e.target.value}))}
                        className="input">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="label">Brand</label>
                      <input value={current.brand}
                        onChange={e => setCurrent(p => ({...p, brand: e.target.value}))}
                        className="input" placeholder="Nestle, Colgate…"/>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="label">Price (₹) *</label>
                      <input type="number" min="0" step="0.01" value={current.price}
                        onChange={e => setCurrent(p => ({...p, price: e.target.value}))}
                        required className="input" placeholder="25"/>
                    </div>

                    {/* Original price */}
                    <div>
                      <label className="label">Original price (₹)</label>
                      <input type="number" min="0" step="0.01" value={current.originalPrice}
                        onChange={e => setCurrent(p => ({...p, originalPrice: e.target.value}))}
                        className="input" placeholder="MRP (for discount badge)"/>
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="label">Stock *</label>
                      <input type="number" min="0" value={current.stock}
                        onChange={e => setCurrent(p => ({...p, stock: e.target.value}))}
                        required className="input" placeholder="100"/>
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="label">Unit</label>
                      <input value={current.unit}
                        onChange={e => setCurrent(p => ({...p, unit: e.target.value}))}
                        className="input" placeholder="piece, ml, g, pack…"/>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="label">Description</label>
                      <textarea rows={3} value={current.description}
                        onChange={e => setCurrent(p => ({...p, description: e.target.value}))}
                        className="input resize-none" placeholder="Brief description…"/>
                    </div>

                    {/* Tags */}
                    <div className="sm:col-span-2">
                      <label className="label">Tags (comma-separated)</label>
                      <input value={current.tags}
                        onChange={e => setCurrent(p => ({...p, tags: e.target.value}))}
                        className="input" placeholder="snack, instant, spicy"/>
                    </div>

                    {/* Toggles */}
                    <div className="sm:col-span-2 flex flex-wrap gap-4">
                      {[
                        { key:'isAvailable', label:'Available' },
                        { key:'isFeatured',  label:'Featured' },
                        { key:'isTrending',  label:'Trending' }
                      ].map(({key,label}) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <div onClick={() => setCurrent(p => ({...p, [key]: !p[key]}))}
                            className={`w-9 h-5 rounded-full transition-colors duration-200 relative
                              ${current[key] ? 'bg-stone-900' : 'bg-stone-200'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200
                              ${current[key] ? 'translate-x-4' : 'translate-x-0.5'}`}/>
                          </div>
                          <span className="text-sm text-stone-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal} className="btn-outline btn-md flex-1">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary btn-md flex-1">
                      {saving ? 'Saving…' : modal === 'create' ? 'Create product' : 'Save changes'}
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
