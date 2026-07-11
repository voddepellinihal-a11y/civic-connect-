import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Complaint, CATEGORIES, STATUSES } from '../../types';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MapPin, Clock, AlertTriangle } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/my').then(r => { setComplaints(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = complaints.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && c.status !== filter) return false;
    return true;
  });

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    pending: complaints.filter(c => c.status === 'SUBMITTED').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      {/* SAFFRON header */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-white drop-shadow-md">Welcome, {user?.fullName}</h1>
              <p className="text-orange-100 font-medium">Track and manage your civic complaints</p>
            </div>
            <Link to="/submit" className="btn bg-green-700 text-white hover:bg-green-800 shadow-lg shadow-black/20"><Plus size={16} /> Report Issue</Link>
          </div>

          {/* WHITE stats cards on saffron bg */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'bg-brand-500' },
              { label: 'Resolved', value: stats.resolved, color: 'bg-emerald-500' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-amber-500' },
              { label: 'Pending', value: stats.pending, color: 'bg-slate-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-t-4 border-brand-500 flex items-center gap-4 p-5">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>{s.value}</div>
                <div className="text-sm font-semibold text-slate-600">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="input w-auto">
            <option>All Categories</option>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No complaints found</p>
            <Link to="/submit" className="btn-flag mt-4 inline-flex">Submit your first complaint</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(c => {
              const st = STATUSES[c.status as keyof typeof STATUSES] || STATUSES.SUBMITTED;
              return (
                <Link key={c.id} to={`/complaint/${c.id}`} className="card hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`badge ${st.color} ${st.bg} text-xs`}>{st.label}</span>
                    <span className="badge bg-slate-100 text-slate-600 text-xs">{c.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{c.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {c.latitude && c.longitude && <span className="flex items-center gap-1"><MapPin size={12} /> Pinned</span>}
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
