import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Complaint, CATEGORIES, STATUSES } from '../../types';
import { Search, Eye, AlertTriangle } from 'lucide-react';

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints').then(r => { setComplaints(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = complaints.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (catFilter && c.category?.toLowerCase() !== catFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white drop-shadow-md mb-6">All Complaints</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10 bg-white/90" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input min-w-[140px] bg-white/90" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className="input min-w-[140px] bg-white/90" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : (
          <div className="card-navy overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-500">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500">Title</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500"></th>
              </tr></thead>
              <tbody>
                {filtered.map(c => {
                  const cat = CATEGORIES[c.category?.toLowerCase()] || CATEGORIES.other;
                  const st = STATUSES[c.status] || STATUSES.SUBMITTED;
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">#{c.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[200px] truncate">{c.title}</td>
                      <td className="py-3 px-4"><span className="badge" style={{ background: cat.color + '20', color: cat.color }}>{cat.icon} {cat.label}</span></td>
                      <td className="py-3 px-4 text-slate-600">{c.assignedDepartment || '-'}</td>
                      <td className="py-3 px-4"><span className={`badge ${st.bg} ${st.color}`}>{st.label}</span></td>
                      <td className="py-3 px-4">{c.priority === 'URGENT' ? <span className="badge bg-red-100 text-red-700"><AlertTriangle size={10} /> Urgent</span> : <span className="text-slate-400">Normal</span>}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4"><Link to={`/admin/complaint/${c.id}`} className="btn-secondary text-xs py-1.5 px-2.5"><Eye size={14} /></Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center py-8 text-slate-500">No complaints match your filters.</p>}
        </div>
      )}
      </div>
    </div>
  );
}
