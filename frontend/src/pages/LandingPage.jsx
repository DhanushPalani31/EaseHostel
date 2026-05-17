import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Package, Zap, Shield, Star } from 'lucide-react';
import Button from '../components/common/Button';
import styles from './LandingPage.module.css';

const FEATURES = [
  { icon: ShoppingBag, title: 'Easy Ordering', desc: 'Browse and order essentials from your room without stepping out.' },
  { icon: Package, title: 'Live Tracking', desc: 'Track your order status from placement to doorstep delivery.' },
  { icon: Zap, title: 'Quick Delivery', desc: 'Get your hostel essentials delivered to your room, fast.' },
  { icon: Shield, title: 'Secure & Safe', desc: 'Protected accounts with JWT authentication and encrypted passwords.' },
];

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function LandingPage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
  }, [user, navigate]);

  return (
    <div className={styles.page}>
      {/* Background orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            <span className={styles.logoText}>HostelEase</span>
          </div>
          <div className={styles.navLinks}>
            <Link to="/login" className={styles.loginLink}>Sign In</Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeUp} className={styles.badge}>
            <Star size={12} className={styles.badgeIcon} />
            Hostel Essentials, Simplified
          </motion.div>

          <motion.h1 variants={fadeUp} className={styles.heroTitle}>
            Everything you need,
            <br />
            <span className={styles.heroAccent}>right at your door</span>
          </motion.h1>

          <motion.p variants={fadeUp} className={styles.heroSubtitle}>
            HostelEase lets students order snacks, stationery, and toiletries from within the hostel —
            no stepping out required. Admins manage everything from one sleek dashboard.
          </motion.p>

          <motion.div variants={fadeUp} className={styles.heroCta}>
            <Link to="/register">
              <Button size="lg" icon={ArrowRight}>
                Start Ordering
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className={styles.stats}>
            {[
              { label: 'Products', value: '50+' },
              { label: 'Orders Served', value: '1k+' },
              { label: 'Happy Students', value: '200+' },
            ].map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          className={styles.heroVisual}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className={styles.mockCard}>
            <div className={styles.mockHeader}>
              <div className={styles.mockDots}>
                {['#f87171', '#f5a623', '#4ade80'].map((c) => (
                  <span key={c} style={{ background: c }} className={styles.mockDot} />
                ))}
              </div>
              <span className={styles.mockTitle}>HostelEase Shop</span>
            </div>
            <div className={styles.mockProducts}>
              {[
                { name: 'Instant Noodles', cat: 'Snacks', price: '₹25', color: '#f5a623' },
                { name: 'Ballpoint Pen', cat: 'Stationery', price: '₹15', color: '#4f9eff' },
                { name: 'Hand Sanitizer', cat: 'Toiletries', price: '₹80', color: '#4ade80' },
              ].map((p) => (
                <div key={p.name} className={styles.mockProduct}>
                  <div className={styles.mockProductIcon} style={{ background: `${p.color}18`, border: `1px solid ${p.color}30` }}>
                    <span style={{ fontSize: 20 }}>
                      {p.cat === 'Snacks' ? '🍿' : p.cat === 'Stationery' ? '✏️' : '🧴'}
                    </span>
                  </div>
                  <div className={styles.mockProductInfo}>
                    <p className={styles.mockProductName}>{p.name}</p>
                    <p className={styles.mockProductCat} style={{ color: p.color }}>{p.cat}</p>
                  </div>
                  <span className={styles.mockProductPrice}>{p.price}</span>
                </div>
              ))}
            </div>
            <div className={styles.mockOrder}>
              <div className={styles.mockOrderStatus}>
                <span className={styles.mockStatusDot} />
                Order #1042 — <strong>Processing</strong>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <motion.div
          className={styles.featuresGrid}
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Icon size={20} />
              </div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={styles.ctaContent}
        >
          <h2 className={styles.ctaTitle}>Ready to make hostel life easier?</h2>
          <p className={styles.ctaDesc}>Join hundreds of students who've simplified their daily needs.</p>
          <Link to="/register">
            <Button size="xl" icon={ArrowRight}>Create Your Account</Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            <span className={styles.logoText}>HostelEase</span>
          </div>
          <p className={styles.footerCopy}>© 2025 HostelEase. Built for hostel life.</p>
        </div>
      </footer>
    </div>
  );
}
