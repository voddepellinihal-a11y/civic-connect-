import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #FF9933 0%, #FFB366 20%, #e8f5e9 40%, #138808 100%)' }}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ShieldAlert size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3 drop-shadow-md">Access Denied</h1>
        <p className="text-orange-100 mb-8 max-w-md font-medium">You don't have permission to access this page. This area is restricted to administrators only.</p>
        <Link to="/" className="btn bg-green-700 text-white hover:bg-green-800 shadow-lg"><ArrowLeft size={16} /> Back to Home</Link>
      </div>
    </div>
  );
}
