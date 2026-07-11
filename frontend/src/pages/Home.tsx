import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Shield, Bell, BarChart3, ArrowRight, CheckCircle, Zap, Users } from 'lucide-react';

const features = [
  { icon: MapPin, title: 'GIS Mapping', desc: 'Real-time geographic tracking of complaints on interactive maps.', bg: 'bg-orange-500/20 border-orange-400/40', iconBg: 'from-orange-400 to-amber-500' },
  { icon: Shield, title: 'Secure Auth', desc: 'JWT-based authentication with role-based access control.', bg: 'bg-green-500/20 border-green-400/40', iconBg: 'from-emerald-500 to-green-600' },
  { icon: Bell, title: 'Notifications', desc: 'Instant push notifications for status updates and alerts.', bg: 'bg-orange-500/20 border-orange-400/40', iconBg: 'from-brand-400 to-orange-500' },
  { icon: BarChart3, title: 'Analytics', desc: 'Comprehensive dashboards with charts and performance metrics.', bg: 'bg-green-500/20 border-green-400/40', iconBg: 'from-emerald-500 to-teal-500' },
];

const stats = [
  { value: '10K+', label: 'Complaints Filed' },
  { value: '85%', label: 'Resolution Rate' },
  { value: '24h', label: 'Avg Response' },
  { value: '50+', label: 'Departments' },
];

export default function Home() {
  return (
    <div>
      {/* SAFFRON — Hero with flag wave */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF9933 0%, #E68A2E 40%, #FFB366 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl saffron-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-300/15 rounded-full blur-3xl green-pulse" />
          {/* Flag stripe accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/30" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600/40" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6 flag-slide">Smart City Complaint Platform</div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white drop-shadow-lg flag-wave">
              Your Voice, <span className="text-yellow-200">Our Action</span>
            </h1>
            <p className="text-lg md:text-xl text-orange-100 mb-8 leading-relaxed max-w-2xl font-medium">
              Report civic issues, track resolution in real-time, and hold departments accountable. Built for smart cities that listen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn bg-green-700 text-white hover:bg-green-800 shadow-xl shadow-black/20 text-base px-8 py-3">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/analytics" className="btn bg-white/25 text-white border-2 border-white/40 hover:bg-white/35 text-base px-8 py-3 backdrop-blur">
                View Analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHITE band — Stats (flag's middle white stripe) */}
      <section className="relative" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-green-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-brand-600">{s.value}</div>
                <div className="text-sm text-slate-600 mt-1 font-semibold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-500/20" />
      </section>

      {/* GREEN — Features */}
      <section style={{ background: 'linear-gradient(180deg, #138808 0%, #0d6b06 50%, #0a5a04 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-md">Platform Features</h2>
            <p className="text-emerald-200 text-lg max-w-2xl mx-auto font-medium">Everything citizens and administrators need for transparent complaint management.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border p-6 hover:-translate-y-1 transition-all duration-300 ${f.bg} backdrop-blur-sm`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.iconBg} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-sm text-emerald-100 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFFRON — How it works */}
      <section style={{ background: 'linear-gradient(180deg, #FF9933 0%, #E68A2E 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-14 drop-shadow-md">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', icon: Zap, title: 'Report', desc: 'Submit a complaint with photos, location, and description.' },
              { step: '2', icon: Users, title: 'Assign', desc: 'Admins assign the right department and set priority.' },
              { step: '3', icon: CheckCircle, title: 'Resolve', desc: 'Track progress and compare before/after images.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <s.icon size={28} className="text-white" />
                </div>
                <div className="text-xs font-bold text-yellow-200 mb-2 tracking-wider">STEP {s.step}</div>
                <h3 className="font-bold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-sm text-orange-100">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NAVY — CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #000080 0%, #000050 100%)' }}>
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white drop-shadow-md">Ready to Make a Difference?</h2>
          <p className="text-blue-200 text-lg mb-8 font-medium">Join thousands of citizens building smarter, more responsive cities.</p>
          <Link to="/register" className="btn bg-amber-500 text-white hover:bg-amber-600 shadow-xl text-base px-10 py-3 font-bold">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* GREEN — Footer */}
      <footer className="py-10" style={{ background: 'linear-gradient(180deg, #138808 0%, #0d6b06 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center text-sm font-medium text-emerald-200">
          <p>&copy; {new Date().getFullYear()} CivicConnect — Smart City Civic Complaint Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
