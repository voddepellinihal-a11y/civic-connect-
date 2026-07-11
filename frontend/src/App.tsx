import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/user/Dashboard';
import SubmitComplaint from './pages/user/SubmitComplaint';
import ComplaintDetail from './pages/user/ComplaintDetail';
import MyComplaints from './pages/user/MyComplaints';
import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaints from './pages/admin/Complaints';
import AdminComplaintDetail from './pages/admin/ComplaintDetail';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Unauthorized from './pages/Unauthorized';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' }, duration: 4000 }} />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/submit" element={<ProtectedRoute><SubmitComplaint /></ProtectedRoute>} />
              <Route path="/my-complaints" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
              <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/complaints" element={<ProtectedRoute adminOnly><AdminComplaints /></ProtectedRoute>} />
              <Route path="/admin/complaint/:id" element={<ProtectedRoute adminOnly><AdminComplaintDetail /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
