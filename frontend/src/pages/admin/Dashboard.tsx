import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Complaint, Analytics as AnalyticsData, CATEGORIES, STATUSES } from '../../types';
import { motion } from 'framer-motion';
import { BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp, Eye } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/complaints'), api.get('/analytics/dashboard')])
      .then(([c, a]) => { setComplaints(c.data); setAnalytics(a.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;

  const stats = [
    { label: 'Total', value: analytics?.totalComplaints || 0, icon: BarChart3, color: 'bg-brand-500' },
    { label: 'Emergency', value: analytics?.urgentCount || 0, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Resolved', value: analytics?.countByStatus?.RESOLVED || 0, icon: CheckCircle, color: 'bg-emerald-600' },
    { label: 'In Progress', value: analytics?.countByStatus?.IN_PROGRESS || 0, icon: Clock, color: 'bg-amber-500' },
  ];

  const chartData = analytics ? {
    labels: Object.keys(analytics.countByCategory),
    datasets: [{ label: 'By Category', data: Object.values(analytics.countByCategory), backgroundColor: Object.keys(analytics.countByCategory).map(k => (CATEGORIES[k]?.color || '#FF9933') + '99'), borderRadius: 8 }]
  } : null;

  const recent = complaints.slice(0, 8);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      {/* SAFFRON header */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white drop-shadow-md mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-t-4 border-brand-500 flex items-center gap-4 p-5">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-white shadow-md`}><s.icon size={20} /></div>
                <div><p className="text-2xl font-extrabold text-slate-900">{s.value}</p><p className="text-xs font-semibold text-slate-500">{s.label}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {chartData && (
            <div className="lg:col-span-2 card">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Complaints by Category</h3>
              <div className="h-64"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
            </div>
          )}
          <div className="card-green">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Status Breakdown</h3>
            <div className="space-y-3">
              {analytics && Object.entries(analytics.countByStatus).map(([k, v]) => {
                const st = STATUSES[k];
                const pct = analytics.totalComplaints ? Math.round((v as number) / analytics.totalComplaints * 100) : 0;
                return (
                  <div key={k}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`badge ${st?.bg || 'bg-slate-100'} ${st?.color || 'text-slate-600'}`}>{st?.label || k}</span>
                      <span className="font-semibold">{v as number} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${st?.bg?.replace('100', '500') || 'bg-slate-500'}`} style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card-navy">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-lg">Recent Complaints</h3>
            <Link to="/admin/complaints" className="text-sm text-brand-600 font-semibold hover:text-brand-700">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 font-semibold text-slate-500">ID</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-500">Title</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-500">Category</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-500">Priority</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-500">Date</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-500"></th>
              </tr></thead>
              <tbody>
                {recent.map(c => {
                  const cat = CATEGORIES[c.category?.toLowerCase()] || CATEGORIES.other;
                  const st = STATUSES[c.status] || STATUSES.SUBMITTED;
                  return (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono text-slate-400">#{c.id}</td>
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-[200px] truncate">{c.title}</td>
                      <td className="py-3 px-3"><span className="badge" style={{ background: cat.color + '20', color: cat.color }}>{cat.icon} {cat.label}</span></td>
                      <td className="py-3 px-3"><span className={`badge ${st.bg} ${st.color}`}>{st.label}</span></td>
                      <td className="py-3 px-3">{c.priority === 'URGENT' ? <span className="badge bg-red-100 text-red-700">URGENT</span> : <span className="text-slate-400">Normal</span>}</td>
                      <td className="py-3 px-3 text-slate-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3"><Link to={`/admin/complaint/${c.id}`} className="text-brand-600 hover:text-brand-700"><Eye size={16} /></Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
