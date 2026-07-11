import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Complaint, CATEGORIES, STATUSES } from '../../types';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, Building2, AlertTriangle, MapPin, Clock } from 'lucide-react';
import StatusTimeline from '../../components/StatusTimeline';
import BeforeAfterSlider from '../../components/BeforeAfterSlider';
import toast from 'react-hot-toast';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ department: '', priority: '', remarks: '', status: '' });
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/complaints/${id}`).then(r => {
      setComplaint(r.data);
      setForm({ department: r.data.assignedDepartment || '', priority: r.data.priority || 'NORMAL', remarks: r.data.remarks || '', status: r.data.status || 'SUBMITTED' });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const params = new URLSearchParams();
      if (form.department) params.append('department', form.department);
      if (form.priority) params.append('priority', form.priority);
      if (form.remarks) params.append('remarks', form.remarks);
      const res = await api.put(`/complaints/${id}/admin?${params.toString()}`);

      if (form.status !== complaint?.status) {
        await api.put(`/complaints/${id}/status`, { status: form.status, notes: form.remarks || `Status changed to ${form.status}` });
      }
      setComplaint(res.data);
      toast.success('Complaint updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>;
  if (!complaint) return <div className="text-center py-20 text-slate-500">Not found</div>;

  const cat = CATEGORIES[complaint.category?.toLowerCase()] || CATEGORIES.other;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/admin/complaints" className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-6 text-sm font-medium transition">
            <ArrowLeft size={16} /> Back to Complaints
          </Link>
          <h1 className="text-2xl font-extrabold text-white drop-shadow-md">Complaint #{complaint.id}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ background: cat.color + '20' }}>{cat.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-extrabold text-slate-900">#{complaint.id} {complaint.title}</h1>
                {complaint.priority === 'URGENT' && <span className="badge bg-red-100 text-red-700"><AlertTriangle size={12} /> Emergency</span>}
              </div>
              <p className="text-slate-600 mb-3">{complaint.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={14} /> {complaint.latitude && complaint.latitude !== 0 ? `${complaint.latitude.toFixed(4)}, ${complaint.longitude?.toFixed(4)}` : 'No location'}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {new Date(complaint.createdAt).toLocaleString()}</span>
                <span className="flex items-center gap-1"><Building2 size={14} /> {complaint.assignedDepartment || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="card">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Admin Controls</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g., Roads & Transport" />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Emergency</option>
              </select>
            </div>
            <div>
              <label className="label">After Image</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center hover:border-brand-400 transition relative cursor-pointer">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setAfterFile(e.target.files?.[0] || null)} />
                <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">{afterFile ? afterFile.name : 'Upload resolution image'}</p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="label">Remarks</label>
            <textarea className="input min-h-[80px] resize-y" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Add notes about this complaint..." />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>

        {/* Before/After */}
        <BeforeAfterSlider beforeImage={complaint.filePath} afterImage={complaint.afterFilePath} />

        {/* Timeline */}
        <div className="card">
          <h3 className="font-bold text-lg text-slate-900 mb-4">Status Timeline</h3>
          <StatusTimeline history={complaint.statusHistory} currentStatus={complaint.status} />
        </div>
      </motion.div>
      </div>
    </div>
  );
}
