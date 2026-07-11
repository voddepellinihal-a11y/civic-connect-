export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CITIZEN' | 'ADMIN';
  profilePicture?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  latitude?: number;
  longitude?: number;
  filePath?: string;
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  priority: 'NORMAL' | 'URGENT';
  assignedDepartment?: string;
  userId?: number;
  afterFilePath?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistory[];
}

export interface StatusHistory {
  status: string;
  notes?: string;
  changedAt: string;
}

export interface Analytics {
  totalComplaints: number;
  countByCategory: Record<string, number>;
  countByStatus: Record<string, number>;
  urgentCount: number;
}

export const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  water: { label: 'Water', icon: '💧', color: '#2563EB' },
  road: { label: 'Road', icon: '🛣', color: '#F97316' },
  garbage: { label: 'Garbage', icon: '🗑', color: '#EF4444' },
  streetlight: { label: 'Street Light', icon: '💡', color: '#FACC15' },
  sanitation: { label: 'Sanitation', icon: '🚽', color: '#22C55E' },
  safety: { label: 'Safety', icon: '🛡', color: '#06B6D4' },
  electricity: { label: 'Electricity', icon: '⚡', color: '#EAB308' },
  gas: { label: 'Gas', icon: '🔥', color: '#DC2626' },
  other: { label: 'Others', icon: '⚠', color: '#8B5CF6' }
};

export const STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  SUBMITTED: { label: 'Pending', color: 'text-brand-700', bg: 'bg-brand-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-100' },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' }
};
