import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Clock, Star, Package, ShoppingBag } from 'lucide-react';
import { staggerContainer, staggerItem, slideUp } from '../../animations/variants.js';

const CATEGORIES = [
  { label: 'Snacks',        emoji: '🍿', color: 'bg-amber-50  border-amber-200' },
  { label: 'Drinks',        emoji: '🥤', color: 'bg-blue-50   border-blue-200' },
  { label: 'Stationery',    emoji: '✏️', color: 'bg-purple-50 border-purple-200' },
  { label: 'Toiletries',    emoji: '🧴', color: 'bg-green-50  border-green-200' },
  { label: 'Instant Foods', emoji: '🍜', color: 'bg-red-50    border-red-200' },
  { label: 'Personal Care', emoji: '🧼', color: 'bg-pink-50   border-pink-200' },
  { label: 'Daily Essentials', emoji: '🛒', color: 'bg-stone-50 border-stone-200' }
];

const FEATURES = [
  { icon: Zap,    title: 'Instant Ordering',   desc: 'Order from your hostel room. Delivered within the same hour.' },
  { icon: Clock,  title: 'Flexible Slots',      desc: 'Choose a delivery slot that fits your schedule – morning to night.' },
  { icon: Shield, title: 'Secure Payments',     desc: 'Razorpay & Cash on Delivery. Your data is always encrypted.' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/60">
        <div className="page-container h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">HostelEase</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"    className="btn-ghost btn-sm hidden sm:flex">Sign in</Link>
            <Link to="/register" className="btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...slideUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-200
            rounded-full text-xs font-medium text-brand-700 mb-8">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
            Now available for all hostel blocks
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold text-stone-900 tracking-tighter leading-[1.1] mb-6">
            Everything you need,<br />
            <span className="text-brand-500">delivered to your room.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-stone-500 max-w-xl mx-auto mb-10 leading-relaxed">
            HostelEase is the fastest way to get snacks, stationery, toiletries and daily
            essentials – ordered in seconds, delivered to your hostel room.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary btn-lg">
              Start ordering <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-outline btn-lg">
              Sign in
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Category pills ──────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="page-container">
          <motion.div
            variants={staggerContainer}
            initial="initial" whileInView="animate" viewport={{ once: true }}
            className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.label} variants={staggerItem}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium text-stone-700 ${cat.color}`}>
                <span>{cat.emoji}</span>
                {cat.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-3">
              Built for hostel life
            </h2>
            <p className="text-stone-500 max-w-lg mx-auto">
              No more late-night runs to the shop. HostelEase brings essentials to you.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial" whileInView="animate" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={staggerItem}
                className="card p-6 hover:shadow-panel transition-all duration-200">
                <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-stone-900 rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
              Ready to simplify hostel life?
            </h2>
            <p className="text-stone-400 mb-8">
              Join students who are already ordering smart.
            </p>
            <Link to="/register" className="btn-accent btn-lg inline-flex">
              Create your free account <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-stone-200 py-8 px-4">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-stone-900 rounded flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">H</span>
            </div>
            <span>HostelEase</span>
          </div>
          <p>© 2025 HostelEase. Built for hostel students.</p>
        </div>
      </footer>
    </div>
  );
}
