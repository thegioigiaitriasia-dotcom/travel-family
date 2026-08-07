import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Link,
  Copy,
  Check,
  Edit2,
  Trash2,
  Key,
  User,
  Heart,
  Sparkles,
  Info,
  Lock,
  Plus,
  CheckCircle2,
  Database,
  Server,
  Code2,
} from 'lucide-react';
import { FamilyAccount, FamilyMember } from '../../types';
import { SupabaseDatabaseModal } from './SupabaseDatabaseModal';
import { SUPABASE_URL, uploadAvatar, updateFamilySettings } from '../../lib/supabase';
import { SubscriptionPricing } from './SubscriptionPricing';

interface AccountPageProps {
  familyAccount: FamilyAccount;
  currentUser: FamilyMember;
  onUpdateAccount: (updatedAccount: FamilyAccount) => void;
  onLogout: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  familyAccount,
  currentUser,
  onUpdateAccount,
  onLogout,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Form state for adding member
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Thành viên');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [addError, setAddError] = useState('');

  // Form state for editing account profile
  const [editFamilyName, setEditFamilyName] = useState(familyAccount.familyName);
  const [editOwnerName, setEditOwnerName] = useState(currentUser.name);

  const inviteLink = `https://giadinhvivu.com/join?code=${familyAccount.inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyAccount.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberUsername.trim() || !newMemberPassword.trim()) {
      setAddError('Vui lòng nhập đầy đủ Họ tên, Username và Mật khẩu cho thành viên.');
      return;
    }

    if (!familyAccount.inviteCode) {
      setAddError('Tài khoản gia đình không hợp lệ (Thiếu mã mời).');
      return;
    }

    const username = newMemberUsername.trim().toLowerCase().replace(/\s+/g, '_');
    const pseudoEmail = `${username}@${familyAccount.inviteCode.toLowerCase()}.giadinhvivu.com`;

    try {
      // 1. Gọi API tạo Sub-account (không làm mất session hiện tại)
      const res = await fetch('/api/create-sub-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pseudoEmail,
          password: newMemberPassword,
          name: newMemberName.trim(),
          familyId: familyAccount.id,
        })
      });

      const data = await res.json();
      if (!data.success) {
        setAddError(data.message || 'Lỗi khi tạo tài khoản phụ.');
        return;
      }

      // 2. Thêm vào giao diện ngay lập tức
      const newMember: FamilyMember = {
        id: data.userId,
        name: newMemberName.trim(),
        username: username,
        role: 'Thành viên',
        relationship: newMemberRelation.trim() || 'Thành viên gia đình',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        joinedDate: new Date().toLocaleDateString('vi-VN'),
      };

      const updated = {
        ...familyAccount,
        members: [...familyAccount.members, newMember],
      };

      onUpdateAccount(updated);
      setShowAddMemberModal(false);
      setNewMemberName('');
      setNewMemberRelation('Thành viên');
      setNewMemberUsername('');
      setNewMemberPassword('');
      setAddError('');
    } catch (err: any) {
      setAddError('Lỗi kết nối tới máy chủ: ' + err.message);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (memberId === currentUser.id) {
      alert('Bạn không thể xóa chính mình khỏi tài khoản.');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm gia đình?')) {
      const updatedMembers = familyAccount.members.filter((m) => m.id !== memberId);
      onUpdateAccount({
        ...familyAccount,
        members: updatedMembers,
      });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newName = editFamilyName.trim() || familyAccount.familyName;
    
    // Attempt DB sync
    updateFamilySettings(familyAccount.id, { family_name: newName });
    
    onUpdateAccount({
      ...familyAccount,
      familyName: newName,
    });
    setShowEditProfileModal(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadAvatar(currentUser.id, file);
      if (publicUrl) {
        // Cập nhật lại UI sau khi upload thành công
        const updatedUser = { ...currentUser, avatar: publicUrl };
        onUpdateAccount({
          ...familyAccount,
          avatar: publicUrl, // Cập nhật cho cả gia đình nếu là trưởng nhóm
          members: familyAccount.members.map(m => m.id === currentUser.id ? updatedUser : m)
        });
        
        if (currentUser.role === 'Trưởng nhóm') {
          updateFamilySettings(familyAccount.id, { avatar_url: publicUrl });
        }
      } else {
        alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi ngoại lệ khi tải ảnh.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn max-w-[1000px] mx-auto">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-red-500 shadow-lg shrink-0 bg-slate-800 relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={familyAccount.avatar || currentUser.avatar}
                alt={familyAccount.familyName}
                className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-500/30">
                  Tài khoản Gia đình
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Hoạt động chính thức</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {familyAccount.familyName}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-2">
                <span>Chủ tài khoản: <strong className="text-white font-semibold">{currentUser.name}</strong></span>
                <span>&bull;</span>
                <span>Username: <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-xs">{currentUser.username}</code></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowEditProfileModal(true)}
              className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Sửa thông tin</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex-1 md:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Section 1: Family Member Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Thành viên gia đình</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quản lý danh sách người tham gia
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Chủ tài khoản có thể thêm trực tiếp thành viên với tên đăng nhập & mật khẩu riêng mà không cần email.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddMemberModal(true)}
            className="bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm thành viên mới</span>
          </button>
        </div>

        {/* Member list grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyAccount.members.map((member) => {
            const isOwner = member.role === 'Trưởng nhóm' || member.username === familyAccount.ownerUsername;
            return (
              <div
                key={member.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-300 shrink-0 bg-white">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-slate-900 text-xs truncate">{member.name}</p>
                      {isOwner && (
                        <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded-full border border-red-200 shrink-0">
                          Trưởng nhóm
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {member.relationship || 'Thành viên'} &bull; <code className="text-slate-700 font-mono">{member.username}</code>
                    </p>
                  </div>
                </div>

                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Permissions note banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Nguyên tắc phân quyền bình đẳng:</p>
            <p className="text-emerald-800 leading-relaxed font-normal">
              Tất cả các thành viên trong gia đình (dù là Trưởng nhóm hay Thành viên) đều có <strong>quyền hạn như nhau</strong> để xem, thêm mới, cập nhật lịch trình, bổ sung địa điểm và viết nhật ký du lịch.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Section 2: Shareable Invite Link */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Link className="w-4 h-4" />
            <span>Link & Mã lời mời gia đình</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Mời thành viên gia đình qua đường link
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Gửi đường link này qua Zalo/Facebook để người thân nhấn vào tự tạo tài khoản tham gia nhóm gia đình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Invite Code card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Mã gia đình (Invite Code)</span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-base font-mono font-bold text-amber-950">{familyAccount.inviteCode}</code>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Direct Invite Link card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:col-span-2 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Đường link mời trực tiếp</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section 3: Subscription Membership */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Gói Thành Viên Gia Đình</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quản lý và Nâng cấp Trải nghiệm
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Dữ liệu thanh toán của bạn được đồng bộ tự động thông qua SePay webhook trên hệ thống.
          </p>
        </div>
        
        <SubscriptionPricing 
          onSelectPlan={() => {}} 
          userId={currentUser.id} 
          currentPlan="free" 
        />
      </div>

      {/* Grid Section 4: Supabase Backend Database Status (Only visible to Admin) */}
      {currentUser.isAdmin && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>Cấu hình Hạ tầng Supabase Database (Admin Management)</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Cơ sở dữ liệu đám mây Supabase
              </h3>
              <p className="text-slate-400 text-xs">
                Hạ tầng lưu trữ sản xuất (6 Bảng Dữ liệu & RLS Security).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSupabaseModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Xem & Sao chép SQL Schema</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold">Supabase Project Endpoint:</span>
              <code className="block text-emerald-400 font-mono text-[11px] truncate">
                {SUPABASE_URL}
              </code>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 space-y-1">
              <span className="text-slate-400 font-bold">Trạng thái hạ tầng:</span>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Đã sẵn sàng 100% (6 Bảng Dữ liệu & RLS Security)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Supabase Database Manager */}
      <SupabaseDatabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />

      {/* Modal: Add Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Thêm thành viên gia đình mới</h3>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5">
              {addError && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-semibold">
                  {addError}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên thành viên</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="VD: Chị Mai, Bé An, Bà Nội"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quan hệ gia đình</label>
                <select
                  value={newMemberRelation}
                  onChange={(e) => setNewMemberRelation(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="Vợ">Vợ</option>
                  <option value="Chồng">Chồng</option>
                  <option value="Con gái">Con gái</option>
                  <option value="Con trai">Con trai</option>
                  <option value="Ông / Bà">Ông / Bà</option>
                  <option value="Anh / Chị / Em">Anh / Chị / Em</option>
                  <option value="Thành viên">Thành viên khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên đăng nhập (Username)</label>
                <input
                  type="text"
                  value={newMemberUsername}
                  onChange={(e) => setNewMemberUsername(e.target.value)}
                  placeholder="VD: banoiphuc (viết liền không dấu)"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu cấp cho thành viên</label>
                <input
                  type="text"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  placeholder="Mật khẩu tùy ý (VD: 123456)"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Profile */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Chỉnh sửa thông tin tài khoản</h3>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên gia đình</label>
                <input
                  type="text"
                  value={editFamilyName}
                  onChange={(e) => setEditFamilyName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
