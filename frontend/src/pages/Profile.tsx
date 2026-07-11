import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', password: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { fullName: form.fullName, phone: form.phone };
      if (form.password) payload.password = form.password;
      await api.put('/auth/me', payload);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white shadow-xl">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white drop-shadow-md">My Profile</h1>
            <p className="text-orange-100 font-medium">Manage your CivicConnect account info</p>
          </div>
        </div>

        <div className="card-green">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user?.fullName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900">{user?.fullName}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="badge bg-brand-100 text-brand-700 mt-1"><Shield size={12} /> {user?.role}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10 bg-slate-100" value={user?.email || ''} disabled />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-10" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
              <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className="input pl-10" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-flag">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
