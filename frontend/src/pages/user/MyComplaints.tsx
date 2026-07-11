import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Complaint, CATEGORIES, STATUSES } from '../../types';
import { Search, AlertTriangle, MapPin, Clock } from 'lucide-react';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/my').then(r => { setComplaints(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = complaints.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-white mb-6 drop-shadow-md">My Complaints</h1>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10 bg-white/80" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="text-center py-12 text-white/80 font-medium">Loading...</div> : filtered.length === 0 ? (
          <div className="text-center py-16 card"><p className="text-slate-600 font-medium">No complaints found.</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const cat = CATEGORIES[c.category?.toLowerCase()] || CATEGORIES.other;
              const st = STATUSES[c.status] || STATUSES.SUBMITTED;
              return (
                <Link key={c.id} to={`/complaint/${c.id}`} className="card flex items-center gap-4 hover:shadow-md transition group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cat.color + '20' }}>{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 truncate group-hover:text-brand-600 transition">#{c.id} {c.title}</h3>
                      {c.priority === 'URGENT' && <AlertTriangle size={14} className="text-red-500" />}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm flex-shrink-0">
                    <span className={`badge ${st.bg} ${st.color}`}>{st.label}</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1"><Clock size={12} /> {new Date(c.createdAt).toLocaleDateString()}</span>
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
