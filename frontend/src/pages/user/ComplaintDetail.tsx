import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Complaint, CATEGORIES, STATUSES } from '../../types';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Building2, Download } from 'lucide-react';
import StatusTimeline from '../../components/StatusTimeline';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';

export default function ComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/complaints/${id}`).then(r => { setComplaint(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (!complaint) return <div className="text-center py-20 text-slate-500">Complaint not found</div>;

  const cat = CATEGORIES[complaint.category?.toLowerCase()] || CATEGORIES.other;
  const st = STATUSES[complaint.status] || STATUSES.SUBMITTED;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/my-complaints" className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-6 text-sm font-medium transition">
          <ArrowLeft size={16} /> Back to My Complaints
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="card">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: cat.color + '20' }}>{cat.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-extrabold text-slate-900">#{complaint.id} {complaint.title}</h1>
                {complaint.priority === 'URGENT' && <span className="badge bg-red-100 text-red-700"><AlertTriangle size={12} /> Emergency</span>}
                <span className={`badge ${st.bg} ${st.color}`}>{st.label}</span>
              </div>
              <p className="text-slate-600">{complaint.description}</p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card flex items-center gap-3">
            <Building2 size={20} className="text-brand-500" />
            <div><p className="text-xs text-slate-400">Department</p><p className="font-semibold text-sm">{complaint.assignedDepartment || 'Unassigned'}</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <MapPin size={20} className="text-emerald-500" />
            <div><p className="text-xs text-slate-400">Location</p><p className="font-semibold text-sm">{complaint.latitude && complaint.latitude !== 0 ? `${complaint.latitude.toFixed(4)}, ${complaint.longitude?.toFixed(4)}` : 'Not geo-tagged'}</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <Clock size={20} className="text-amber-500" />
            <div><p className="text-xs text-slate-400">Filed</p><p className="font-semibold text-sm">{new Date(complaint.createdAt).toLocaleString()}</p></div>
          </div>
        </div>

        {/* Before/After */}
        {(complaint.filePath || complaint.afterFilePath) && (
          <BeforeAfterSlider beforeImage={complaint.filePath} afterImage={complaint.afterFilePath} />
        )}

        {/* Timeline */}
        <div className="card">
          <h2 className="font-bold text-lg text-slate-900 mb-4">Status Timeline</h2>
          <StatusTimeline history={complaint.statusHistory} currentStatus={complaint.status} />
        </div>
      </motion.div>
      </div>
    </div>
  );
}
