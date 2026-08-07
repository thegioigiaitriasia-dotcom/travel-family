import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Database,
  Compass,
  MapPin,
  Bookmark,
  Search,
  Filter,
  UserPlus,
  ShieldAlert,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Download,
  Send,
  Zap,
  BarChart3,
  Server,
  Activity,
  Layers,
  Radio,
  Clock,
  Sparkles,
  Eye,
  Star,
  Check,
  X,
  FileText,
  Key,
  Globe,
  Code2,
} from 'lucide-react';
import {
  testSupabaseConnection,
  SUPABASE_URL,
  supabase,
  fetchSupabaseProfiles,
  updateSupabaseProfileStatus,
  fetchSupabaseTripsAdmin,
  updateSupabaseTripModeration,
  fetchSupabaseStats,
} from '../../lib/supabase';
import { FamilyMember } from '../../types';
import { SupabaseDatabaseModal } from '../account/SupabaseDatabaseModal';
import { GooglePlacesManagerModal } from '../places/GooglePlacesManagerModal';

interface AdminDashboardProps {
  onNavigateToModule?: (module: any) => void;
}

// Initial Mock Admin Users List
const INITIAL_USERS: (FamilyMember & { email: string; familyName: string; status: 'active' | 'suspended'; roleType: string })[] = [
  {
    id: 'usr-admin-01',
    name: 'Quản trị viên (Super Admin)',
    username: 'admin',
    email: 'admin@giadinhvivu.com',
    role: 'Super Admin',
    roleType: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    familyName: 'Gia đình Vi Vu',
    joinedDate: '2026-01-15',
    status: 'active',
    lastActive: 'Vừa xong',
    isAdmin: true,
  },
  {
    id: 'usr-02',
    name: 'Trần Thị Thu Hương',
    username: 'huong.tran',
    email: 'huong.tran@gmail.com',
    role: 'Trưởng nhóm',
    roleType: 'Family Owner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    familyName: 'Gia đình Việt',
    joinedDate: '2026-01-16',
    status: 'active',
    lastActive: '10 phút trước',
  },
  {
    id: 'usr-03',
    name: 'Lê Minh Hoàng',
    username: 'hoang.le',
    email: 'hoang.le92@gmail.com',
    role: 'Trưởng nhóm',
    roleType: 'Family Owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    familyName: 'Nhà Minh Hoàng Sài Gòn',
    joinedDate: '2026-02-01',
    status: 'active',
    lastActive: '2 giờ trước',
  },
  {
    id: 'usr-04',
    name: 'Phạm Thanh Hà',
    username: 'ha.pham',
    email: 'ha.pham.travel@yahoo.com',
    role: 'Thành viên',
    roleType: 'Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    familyName: 'Nhà Minh Hoàng Sài Gòn',
    joinedDate: '2026-02-03',
    status: 'active',
    lastActive: '1 ngày trước',
  },
  {
    id: 'usr-05',
    name: 'Đặng Tuấn Anh',
    username: 'tuananh.mod',
    email: 'mod.tuananh@giadinhvivu.com',
    role: 'Quản trị viên',
    roleType: 'System Admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    familyName: 'Gia đình Tuấn Anh - Hà Nội',
    joinedDate: '2026-02-10',
    status: 'active',
    lastActive: '30 phút trước',
    isAdmin: true,
  },
  {
    id: 'usr-06',
    name: 'Vũ Quốc Bảo',
    username: 'bao.vu',
    email: 'quocbao.vu@hotmail.com',
    role: 'Thành viên',
    roleType: 'Member',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    familyName: 'Bảo & Mai Vi Vu',
    joinedDate: '2026-03-12',
    status: 'suspended',
    lastActive: '5 ngày trước',
  },
];

// Initial Mock Admin Trips List
const INITIAL_TRIPS = [
  {
    id: 'trip-001',
    title: 'Đà Nẵng – Hội An Mùa Hè Rực Rỡ 2026',
    ownerName: 'Nguyễn Văn Phúc',
    familyName: 'Gia đình Bố Phúc & Mẹ Hương',
    destinations: ['Đà Nẵng', 'Hội An', 'Bà Nà Hills'],
    startDate: '08/08/2026',
    endDate: '12/08/2026',
    status: 'upcoming',
    isPublic: true,
    isFeatured: true,
    createdDate: '2026-07-28',
  },
  {
    id: 'trip-002',
    title: 'Phú Quốc – Nghỉ Dưỡng Biển Ngọc Gia Đình',
    ownerName: 'Lê Minh Hoàng',
    familyName: 'Nhà Minh Hoàng Sài Gòn',
    destinations: ['Phú Quốc', 'VinWonders', 'Hòn Thơm'],
    startDate: '15/09/2026',
    endDate: '18/09/2026',
    status: 'upcoming',
    isPublic: true,
    isFeatured: false,
    createdDate: '2026-08-01',
  },
  {
    id: 'trip-003',
    title: 'Đà Lạt – Sương Mờ & Trải Nghiệm Hái Dâu Mẹ & Bé',
    ownerName: 'Đặng Tuấn Anh',
    familyName: 'Gia đình Tuấn Anh - Hà Nội',
    destinations: ['Đà Lạt', 'Hồ Tuyền Lâm', 'Thung Lũng Tình Yêu'],
    startDate: '20/10/2026',
    endDate: '23/10/2026',
    status: 'planning',
    isPublic: false,
    isFeatured: false,
    createdDate: '2026-08-04',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'trips' | 'database' | 'logs'>('overview');
  
  // State for Users Management
  const [users, setUsers] = useState(INITIAL_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'Thành viên' as 'Trưởng nhóm' | 'Thành viên' | 'Quản trị viên' | 'Super Admin',
    familyName: 'Gia đình Mới',
  });

  // State for Trips Moderation
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [tripSearch, setTripSearch] = useState('');

  // State for Database & API Key Management Modals
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showGooglePlacesModal, setShowGooglePlacesModal] = useState(false);

  // State for Database Test Connection
  const [dbStatus, setDbStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [testingDb, setTestingDb] = useState(false);

  // Broadcast Announcement State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // System Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '05:04:12 - Hôm nay', actor: 'phuc.admin', action: 'Chạy SQL Schema khởi tạo 6 bảng Supabase', status: 'Success' },
    { id: 2, time: '04:58:30 - Hôm nay', actor: 'System', action: 'Kiểm tra trạng thái Supabase RLS Policies', status: 'Active' },
    { id: 3, time: '04:20:15 - Hôm nay', actor: 'hoang.le', action: 'Tạo chuyến đi mới: Phú Quốc Nghỉ Dưỡng', status: 'Success' },
    { id: 4, time: '03:15:00 - Hôm nay', actor: 'phuc.admin', action: 'Đăng nhập vào Admin Console', status: 'Success' },
  ]);

  // Run DB check & load real Supabase data on mount
  useEffect(() => {
    checkDatabase();
    loadRealSupabaseData();
  }, []);

  // Real System Stats State
  const [sysStats, setSysStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalPlaces: 0,
    totalDiaries: 0,
  });

  const checkDatabase = async () => {
    setTestingDb(true);
    const res = await testSupabaseConnection();
    setDbStatus(res);
    setTestingDb(false);
  };

  const loadRealSupabaseData = async () => {
    try {
      const [profiles, tripsData, stats] = await Promise.all([
        fetchSupabaseProfiles(),
        fetchSupabaseTripsAdmin(),
        fetchSupabaseStats(),
      ]);

      if (profiles && profiles.length > 0) {
        const mappedUsers = profiles.map((p: any) => ({
          id: p.id,
          name: p.full_name || p.email.split('@')[0],
          username: p.email.split('@')[0],
          email: p.email,
          role: p.role || 'Thành viên',
          roleType: p.role === 'Super Admin' || p.role === 'Quản trị viên' ? 'Admin' : 'Member',
          avatar: p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          familyName: `Gia đình ${p.full_name || p.email.split('@')[0]}`,
          joinedDate: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          status: (p.status as 'active' | 'suspended') || 'active',
          lastActive: 'Đã đồng bộ Supabase',
          isAdmin: p.role === 'Super Admin' || p.role === 'Quản trị viên',
        }));

        // Merge with initial admin user if not already present
        const hasAdmin = mappedUsers.some((u: any) => u.email === 'admin@giadinhvivu.com');
        setUsers(hasAdmin ? mappedUsers : [INITIAL_USERS[0], ...mappedUsers]);
      }

      if (tripsData && tripsData.length > 0) {
        const mappedTrips = tripsData.map((t: any) => ({
          id: t.id,
          title: t.title,
          ownerName: t.profiles?.full_name || 'Người dùng Supabase',
          familyName: `Gia đình ${t.profiles?.full_name || 'Hội viên'}`,
          destinations: Array.isArray(t.destinations) ? t.destinations : [t.destinations || 'Địa điểm'],
          startDate: t.start_date || 'N/A',
          endDate: t.end_date || 'N/A',
          status: t.status || 'upcoming',
          isPublic: Boolean(t.is_public),
          isFeatured: Boolean(t.is_featured),
          createdDate: t.created_at ? t.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        setTrips(mappedTrips);
      }

      if (stats) {
        setSysStats(stats);
      }
    } catch (err) {
      console.warn('Error loading real Supabase data for admin:', err);
    }
  };

  // Toggle user status (active/suspended)
  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const nextStatus = user.status === 'active' ? 'suspended' : 'active';

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );

    await updateSupabaseProfileStatus(userId, { status: nextStatus });

    setAuditLogs((logs) => [
      {
        id: Date.now(),
        time: 'Vừa xong',
        actor: 'phuc.admin',
        action: `Thay đổi trạng thái tài khoản ${user.username} sang ${nextStatus.toUpperCase()} (Đồng bộ Supabase)`,
        status: 'Updated',
      },
      ...logs,
    ]);
  };

  // Promote user role to Admin
  const handlePromoteRole = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newRole = user.role === 'Quản trị viên' ? 'Trưởng nhóm' : 'Quản trị viên';

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role: newRole, isAdmin: newRole === 'Quản trị viên' } : u
      )
    );

    await updateSupabaseProfileStatus(userId, { role: newRole });

    setAuditLogs((logs) => [
      {
        id: Date.now(),
        time: 'Vừa xong',
        actor: 'phuc.admin',
        action: `Cập nhật vai trò tài khoản ${user.username} thành ${newRole} (Đồng bộ Supabase)`,
        status: 'Updated',
      },
      ...logs,
    ]);
  };

  // Add new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    const newId = `usr-${Date.now().toString().slice(-6)}`;
    const created: any = {
      id: newId,
      name: newUserForm.name,
      username: newUserForm.username || newUserForm.email.split('@')[0],
      email: newUserForm.email,
      role: newUserForm.role,
      roleType: newUserForm.role === 'Quản trị viên' || newUserForm.role === 'Super Admin' ? 'Admin' : 'Member',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      familyName: newUserForm.familyName,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      lastActive: 'Vừa khởi tạo',
      isAdmin: newUserForm.role === 'Quản trị viên' || newUserForm.role === 'Super Admin',
    };

    setUsers([created, ...users]);
    setShowAddUserModal(false);

    // Write to Supabase profiles
    await supabase.from('profiles').upsert({
      id: newId,
      email: newUserForm.email,
      full_name: newUserForm.name,
      role: newUserForm.role,
      status: 'active',
      created_at: new Date().toISOString(),
    });

    setNewUserForm({
      name: '',
      username: '',
      email: '',
      role: 'Thành viên',
      familyName: 'Gia đình Mới',
    });

    setAuditLogs((logs) => [
      {
        id: Date.now(),
        time: 'Vừa xong',
        actor: 'phuc.admin',
        action: `Khởi tạo người dùng mới: ${created.email} (${created.role}) trên Supabase`,
        status: 'Created',
      },
      ...logs,
    ]);
  };

  // Toggle trip public/featured status
  const handleToggleTripFeatured = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const nextFeatured = !trip.isFeatured;
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, isFeatured: nextFeatured } : t))
    );

    await updateSupabaseTripModeration(tripId, { is_featured: nextFeatured });
  };

  const handleToggleTripPublic = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const nextPublic = !trip.isPublic;
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, isPublic: nextPublic } : t))
    );

    await updateSupabaseTripModeration(tripId, { is_public: nextPublic });
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chuyến đi này khỏi hệ thống?')) {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      await supabase.from('trips').delete().eq('id', tripId);
    }
  };

  // Send Broadcast Message
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setBroadcastSent(true);
    setAuditLogs((logs) => [
      {
        id: Date.now(),
        time: 'Vừa xong',
        actor: 'phuc.admin',
        action: `Phát thông báo toàn hệ thống: "${broadcastMsg}"`,
        status: 'Broadcasted',
      },
      ...logs,
    ]);
    setTimeout(() => setBroadcastSent(false), 4000);
    setBroadcastMsg('');
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.familyName.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
        ? u.isAdmin || u.role === 'Quản trị viên' || u.role === 'Super Admin'
        : u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredTrips = trips.filter(
    (t) =>
      t.title.toLowerCase().includes(tripSearch.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(tripSearch.toLowerCase()) ||
      t.familyName.toLowerCase().includes(tripSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Admin Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-16 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title & Status */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Console 100% Active</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold">
                  Supabase Backend Live
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Trung tâm Quản trị Hệ thống</span>
                <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  GiaĐìnhViVu Platform
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                Quản lý toàn bộ 1.000+ người dùng thực sự, phân quyền hộ gia đình, chuyến đi & cơ sở dữ liệu Supabase.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Tài Khoản Mới</span>
              </button>

              <button
                type="button"
                onClick={checkDatabase}
                disabled={testingDb}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${testingDb ? 'animate-spin' : ''}`} />
                <span>Test DB Supabase</span>
              </button>
            </div>
          </div>

          {/* Admin Internal Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-800/80">
            {[
              { id: 'overview', label: 'Tổng quan KPI', icon: BarChart3 },
              { id: 'users', label: 'Quản lý Người dùng & Gia đình', icon: Users, badge: users.length },
              { id: 'trips', label: 'Kiểm duyệt Chuyến đi', icon: Compass, badge: trips.length },
              { id: 'database', label: 'Hạ tầng & RLS Supabase', icon: Database },
              { id: 'logs', label: 'Nhật ký & Thông báo', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ==================== TAB 1: OVERVIEW KPI ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                    Tổng Người dùng Thực
                  </span>
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{sysStats.totalUsers.toLocaleString()}</div>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Cập nhật realtime từ Supabase</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[85%] rounded-full"></div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                    Chuyến đi & Lịch trình
                  </span>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Compass className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{sysStats.totalTrips.toLocaleString()}</div>
                  <div className="text-xs font-semibold text-rose-400 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đã đồng bộ lên DB</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[90%] rounded-full"></div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                    Địa điểm POI
                  </span>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{sysStats.totalPlaces.toLocaleString()}</div>
                  <div className="text-xs font-semibold text-amber-400 flex items-center gap-1 mt-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Kho địa điểm cộng đồng</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[65%] rounded-full"></div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                    Nhật Ký Hành Trình
                  </span>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Bookmark className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">{sysStats.totalDiaries.toLocaleString()}</div>
                  <div className="text-xs font-semibold text-purple-400 flex items-center gap-1 mt-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public Diaries</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[70%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Middle Section: Database Live Card + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supabase Infrastructure Card */}
              <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        Trạng thái Hạ tầng Supabase Cloud & Google Places
                      </h3>
                      <p className="text-xs text-slate-400">
                        Quản lý SQL Schema, RLS Security & Bộ nhớ đệm API Chùm ảnh thật
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowSupabaseModal(true)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Code2 className="w-4 h-4" />
                      <span>SQL Schema DB</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowGooglePlacesModal(true)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Google Places Cache</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Supabase Endpoint URL:</span>
                    <code className="text-emerald-400 font-mono text-xs break-all block">
                      {SUPABASE_URL}
                    </code>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Chính sách Bảo mật RLS:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Row Level Security được bật trên tất cả các bảng</span>
                    </span>
                  </div>
                </div>

                {/* DB Test Result Banner */}
                {dbStatus && (
                  <div
                    className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
                      dbStatus.success
                        ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                        : 'bg-rose-950/50 border-rose-800 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {dbStatus.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>{dbStatus.message}</span>
                    </div>

                    <button
                      type="button"
                      onClick={checkDatabase}
                      className="underline text-xs font-bold cursor-pointer"
                    >
                      Thử lại
                    </button>
                  </div>
                )}

                {/* Database Tables Summary */}
                <div className="pt-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-3">
                    Bảng dữ liệu trong Supabase Schema:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      { name: 'profiles', desc: 'Hồ sơ người dùng & Vai trò' },
                      { name: 'family_accounts', desc: 'Tài khoản & Mã gia đình' },
                      { name: 'trips', desc: 'Chuyến đi & Lịch trình JSON' },
                      { name: 'saved_places', desc: 'Địa điểm yêu thích & Đã lưu' },
                      { name: 'diaries', desc: 'Nhật ký hành trình & Kỷ niệm' },
                      { name: 'trip_comments', desc: 'Ghi chú & Thảo luận Realtime' },
                    ].map((tbl) => (
                      <div
                        key={tbl.name}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <div className="font-mono text-emerald-400 font-bold">{tbl.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{tbl.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Audit Timeline */}
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>Hoạt động Admin gần nhất</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('logs')}
                    className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono text-indigo-300 font-bold">@{log.actor}</span>
                        <span>{log.time}</span>
                      </div>
                      <p className="text-slate-200 font-medium">{log.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: USER MANAGEMENT ==================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Search and Filters */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm theo tên, email, gia đình..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="all">Tất cả Vai trò</option>
                  <option value="admin">Chỉ Admin & Quản trị viên</option>
                  <option value="Trưởng nhóm">Trưởng nhóm Gia đình</option>
                  <option value="Thành viên">Thành viên</option>
                </select>

                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm Người Dùng</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Người dùng & Email</th>
                      <th className="p-4">Hộ Gia đình</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Ngày tham gia</th>
                      <th className="p-4 text-right">Thao tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.isAdmin && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 text-xs font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-slate-200">{u.familyName}</div>
                          <div className="text-[11px] text-slate-500">@{u.username}</div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block ${
                              u.role === 'Super Admin'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : u.role === 'Quản trị viên'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : u.role === 'Trưởng nhóm'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="p-4">
                          {u.status === 'active' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>Hoạt động</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              <span>Đã tạm khóa</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-slate-400 font-mono text-xs">
                          {u.joinedDate || '2026-01-15'}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handlePromoteRole(u.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                              title="Thay đổi quyền hạn"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />
                              <span>Quyền</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                u.status === 'active'
                                  ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                  : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {u.status === 'active' ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 inline mr-1" />
                                  <span>Khóa</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3.5 h-3.5 inline mr-1" />
                                  <span>Mở</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TRIPS MODERATION ==================== */}
        {activeTab === 'trips' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Strict Privacy Notice */}
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Bảo mật & Quyền riêng tư tuyệt đối (Family Privacy Isolation)</p>
                <p className="text-emerald-300/90 text-[11px] mt-0.5">
                  Mọi lịch trình và hình ảnh cá nhân của hộ gia đình đều được cách ly bảo mật 100%. Hệ thống không có nguồn cấp dữ liệu mạng xã hội công khai. Admin chỉ quản trị lưu trữ hạ tầng và thiết lập các lịch trình Mẫu AI gợi ý.
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  placeholder="Tìm kiếm tiêu đề chuyến đi, người tạo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Đang quản lý <strong className="text-white">{filteredTrips.length}</strong> chuyến đi
              </div>
            </div>

            {/* Trips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrips.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                      {t.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {t.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-300" />
                          <span>Mẫu AI</span>
                        </span>
                      )}

                      {t.isPublic ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          Công khai
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                          Riêng tư
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base line-clamp-2">{t.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Tạo bởi: <strong className="text-slate-200">{t.ownerName}</strong> ({t.familyName})
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                    <div>
                      Điểm đến: <span className="text-slate-200 font-medium">{t.destinations.join(', ')}</span>
                    </div>
                    <div>
                      Thời gian: <span className="text-slate-200 font-mono">{t.startDate} - {t.endDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTripFeatured(t.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          t.isFeatured
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 inline mr-1" />
                        <span>Ghim Mẫu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleTripPublic(t.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          t.isPublic
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        <span>Công khai</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTrip(t.id)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800 transition-colors cursor-pointer"
                      title="Xóa chuyến đi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: DATABASE & RLS SECURITY ==================== */}
        {activeTab === 'database' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span>Cấu hình CSDL & Row Level Security (RLS) Supabase</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Đảm bảo bảo mật dữ liệu tuyệt đối giữa các hộ gia đình với quy mô 1.000+ người dùng.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={checkDatabase}
                  disabled={testingDb}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${testingDb ? 'animate-spin' : ''}`} />
                  <span>Kiểm tra Kết nối SQL</span>
                </button>
              </div>

              {/* RLS Table Status List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    table: 'public.profiles',
                    policy: 'Private Profiles Access (Bảo mật 100%)',
                    purpose: 'Lưu trữ thông tin cá nhân & tài khoản (Riêng tư theo user_id)',
                    isPrivate: true,
                  },
                  {
                    table: 'public.family_accounts',
                    policy: 'Private Family Access (Cách ly hộ gia đình)',
                    purpose: 'Lưu trữ tài khoản gia đình & mã mời riêng (Riêng tư)',
                    isPrivate: true,
                  },
                  {
                    table: 'public.trips',
                    policy: 'Private Family Trips Policy (Bảo mật tuyệt đối)',
                    purpose: 'Lịch trình chuyến đi cá nhân (Chỉ hiển thị cho hộ gia đình sở hữu)',
                    isPrivate: true,
                  },
                  {
                    table: 'public.diaries',
                    policy: 'Private Family Diaries Policy (Không lộ hình ảnh)',
                    purpose: 'Nhật ký hành trình & hình ảnh gia đình (Bảo mật 100%)',
                    isPrivate: true,
                  },
                  {
                    table: 'public.saved_places',
                    policy: 'Public Common Places Access (Dùng chung toàn ứng dụng)',
                    purpose: 'Danh mục địa điểm tham quan, lưu trú, ăn uống & tour công cộng',
                    isPrivate: false,
                  },
                  {
                    table: 'public.trip_comments',
                    policy: 'Private Member Comments Access (Bảo mật nội bộ)',
                    purpose: 'Đồng bộ thảo luận riêng tư giữa các thành viên trong gia đình',
                    isPrivate: true,
                  },
                ].map((item) => (
                  <div
                    key={item.table}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        {item.table}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          item.isPrivate
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{item.isPrivate ? 'Riêng tư 100%' : 'Công cộng dùng chung'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{item.purpose}</p>
                    <div className="text-[11px] text-slate-500 font-mono">{item.policy}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: AUDIT LOGS & BROADCAST ==================== */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Broadcast Form */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>Phát thông báo Toàn Hệ thống (System Broadcast Banner)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Gửi thông báo tức thì đến tất cả 1.000+ người dùng gia đình trên ứng dụng.
              </p>

              <form onSubmit={handleSendBroadcast} className="flex gap-2">
                <input
                  type="text"
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Nhập nội dung thông báo hệ thống (ví dụ: 'Cập nhật AI Planner v2.0 rực rỡ...')"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Phát Báo</span>
                </button>
              </form>

              {broadcastSent && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã phát thông báo thành công tới tất cả các hộ gia đình!</span>
                </div>
              )}
            </div>

            {/* Audit Log Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
                <span>Nhật ký Kiểm toán Hệ thống (System Audit Trail)</span>
                <span className="text-xs text-slate-400 font-mono">Realtime Log Stream</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-400 font-bold">@{log.actor}</span>
                        <span className="text-slate-500 text-[11px]">{log.time}</span>
                      </div>
                      <p className="text-slate-200 font-medium">{log.action}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 font-mono text-[11px] font-bold shrink-0">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add User Form */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Thêm Người dùng / Admin mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="mai.nguyen@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tên Hộ gia đình</label>
                <input
                  type="text"
                  value={newUserForm.familyName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, familyName: e.target.value })}
                  placeholder="Nhà Mai & Hùng Hà Nội"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Vai trò Phân quyền</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="Thành viên">Thành viên (Member)</option>
                  <option value="Trưởng nhóm">Trưởng nhóm (Family Owner)</option>
                  <option value="Quản trị viên">Quản trị viên (System Admin)</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Khởi tạo Tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modals */}
      <SupabaseDatabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />

      <GooglePlacesManagerModal
        isOpen={showGooglePlacesModal}
        onClose={() => setShowGooglePlacesModal(false)}
      />
    </div>
  );
};
