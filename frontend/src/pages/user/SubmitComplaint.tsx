import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { CATEGORIES } from '../../types';
import { motion } from 'framer-motion';
import { MapPin, Send, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', latitude: undefined as number | undefined, longitude: undefined as number | undefined });
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude })); setGpsLoading(false); toast.success('Location captured'); },
      () => { setGpsLoading(false); toast.error('Could not get location'); }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/complaints', form);
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        // Note: file upload handled via form endpoint for now
      }
      toast.success('Complaint submitted!');
      navigate(`/complaint/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 15%, #e8f5e9 30%, #138808 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-white mb-2 drop-shadow-md">Report an Issue</h1>
          <p className="text-orange-100 mb-8 font-medium">Describe the civic problem you've encountered. Be as specific as possible.</p>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Title</label>
                <input className="input" placeholder="e.g., Pothole on Main Street" required maxLength={255} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea className="input min-h-[120px] resize-y" placeholder="Describe the issue in detail..." required maxLength={2000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <p className="text-xs text-slate-400 mt-1">{form.description.length}/2000</p>
              </div>

              <div>
                <label className="label">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <button key={k} type="button" onClick={() => setForm({ ...form, category: k })}
                      className={`p-3 rounded-xl border-2 text-center transition-all text-sm font-medium ${form.category === k ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className="text-lg block mb-1">{v.icon}</span>{v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Location</label>
                <button type="button" onClick={getGPS} className="btn-secondary w-full">
                  <MapPin size={16} /> {gpsLoading ? 'Getting location...' : form.latitude ? `${form.latitude.toFixed(4)}, ${form.longitude?.toFixed(4)}` : 'Get Current Location'}
                </button>
              </div>

              <div>
                <label className="label">Photo <span className="text-slate-400">(optional)</span></label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-400 transition cursor-pointer relative">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <button type="button" onClick={() => setFile(null)} className="text-red-500"><X size={16} /></button>
                    </div>
                  ) : (
                    <><Upload size={24} className="mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-500">Click to upload a photo</p></>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <>Submit Complaint <Send size={16} /></>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
