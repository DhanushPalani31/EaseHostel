import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Home, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../../store/slices/authSlice.js';
import { useAuth } from '../../hooks/index.js';
import { slideUp } from '../../animations/variants.js';

const FIELDS = [
  { name: 'name',        label: 'Full name',      icon: User,  type: 'text',     placeholder: 'Arjun Sharma' },
  { name: 'email',       label: 'Email address',  icon: Mail,  type: 'email',    placeholder: 'you@hostel.edu' },
  { name: 'phoneNumber', label: 'Phone number',   icon: Phone, type: 'tel',      placeholder: '9876543210' },
  { name: 'hostelBlock', label: 'Hostel block',   icon: Home,  type: 'text',     placeholder: 'A' },
  { name: 'roomNumber',  label: 'Room number',    icon: Home,  type: 'text',     placeholder: '101' },
];

export default function RegisterPage() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { loading } = useAuth();

  const [form, setForm]   = useState({ name: '', email: '', password: '', phoneNumber: '', hostelBlock: '', roomNumber: '' });
  const [show, setShow]   = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name  || form.name.length < 2)  e.name     = 'Name must be at least 2 characters';
    if (!form.email)                           e.email    = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 py-10">
      <motion.div {...slideUp} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1.5">Create your account</h1>
          <p className="text-stone-500 text-sm">Join HostelEase and start ordering essentials</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map(({ name, label, icon: Icon, type, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={type}
                    value={form[name]}
                    onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className={`input pl-9 ${errors[name] ? 'input-error' : ''}`}
                  />
                </div>
                {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-md w-full mt-2">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-stone-900 hover:text-brand-600 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
