import { useState, useEffect } from 'react';
import api from '../api/client';
import { Analytics as AnalyticsData, CATEGORIES } from '../types';
import { motion } from 'framer-motion';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => { setAnalytics(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (!analytics) return <div className="text-center py-20 text-slate-500">No data available</div>;

  const catPieData = {
    labels: Object.keys(analytics.countByCategory).map(k => CATEGORIES[k]?.label || k),
    datasets: [{ data: Object.values(analytics.countByCategory), backgroundColor: Object.keys(analytics.countByCategory).map(k => CATEGORIES[k]?.color || '#888'), borderWidth: 0 }]
  };

  const statusBar = {
    labels: Object.keys(analytics.countByStatus),
    datasets: [{ data: Object.values(analytics.countByStatus), backgroundColor: ['#FF9933', '#F59E0B', '#138808', '#EF4444'], borderRadius: 8 }]
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white drop-shadow-md mb-6">Analytics</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Complaints', value: analytics.totalComplaints },
              { label: 'Emergency', value: analytics.urgentCount },
              { label: 'Resolved', value: analytics.countByStatus.RESOLVED || 0 },
              { label: 'Pending', value: analytics.countByStatus.SUBMITTED || 0 },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-t-4 border-brand-500 text-center p-5">
                <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Category Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Pie data={catPieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16 } } } }} />
            </div>
          </div>
          <div className="card-green">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Status Breakdown</h3>
            <div className="h-64">
              <Bar data={statusBar} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
