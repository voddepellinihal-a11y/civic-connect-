import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Shield, ArrowRight, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500', 'bg-emerald-600'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const s = strength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 20%, #e8f5e9 50%, #138808 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
            <Shield size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-white drop-shadow-md">Create Account</h1>
          <p className="text-emerald-100 mt-1 font-medium">Join CivicConnect and make a difference</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border-t-4 border-brand-500 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" placeholder="John Doe" required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={show ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="Min 6 characters" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i < s ? strengthColors[s] : 'bg-slate-200'} transition`} />)}</div>
                  <p className="text-xs text-slate-500">{strengthLabels[s]}</p>
                </div>
              )}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className="input pl-10" placeholder="Repeat password" required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                {form.confirmPassword && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-flag w-full py-3 text-base">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <>Create Account <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center text-sm text-slate-600 font-medium">
            Already have an account? <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
