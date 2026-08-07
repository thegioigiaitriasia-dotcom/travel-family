import React, { useState } from 'react';
import { X, User, Lock, Users, Sparkles, Check, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Key } from 'lucide-react';
import { FamilyAccount, FamilyMember, UserAuthSession, UserSubscription } from '../../types';
import { supabase, isSupabaseConfigured, supabaseSignUp } from '../../lib/supabase';
import { GiaDinhViVuLogo } from '../common/GiaDinhViVuLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserAuthSession) => void;
  defaultTab?: 'login' | 'register' | 'invite';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Xây dựng UserAuthSession từ Supabase user + profile từ DB */
async function buildSessionFromSupabase(
  sbUser: import('@supabase/supabase-js').User,
  profile: Record<string, any> | null,
  subscription: Record<string, any> | null
): Promise<UserAuthSession> {
  const isAdmin = profile?.is_admin === true;
  const ownerName = profile?.full_name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Thành viên';
  const familyName = profile?.family_name || sbUser.user_metadata?.family_name || `Gia đình ${ownerName}`;

  const member: FamilyMember = {
    id: sbUser.id,
    name: ownerName,
    username: sbUser.email || '',
    role: isAdmin ? 'Super Admin' : 'Trưởng nhóm',
    avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    email: sbUser.email,
    joinedDate: new Date(sbUser.created_at).toLocaleDateString('vi-VN'),
    isAdmin,
    status: (profile?.status as FamilyMember['status']) || 'active',
  };

  const familyAccount: FamilyAccount = {
    id: profile?.family_account_id || `fam-${sbUser.id.slice(0, 8)}`,
    familyName,
    ownerUsername: sbUser.email || '',
    ownerName,
    avatar: profile?.avatar_url || member.avatar,
    inviteCode: `VIVU-${sbUser.id.slice(0, 6).toUpperCase()}`,
    createdAt: new Date(sbUser.created_at).toLocaleDateString('vi-VN'),
    members: [member],
  };

  // Tải toàn bộ members
  if (profile?.family_account_id) {
    const { data: membersRes } = await supabase.from('profiles').select('*').eq('family_account_id', profile.family_account_id);
    const { data: famRes } = await supabase.from('family_accounts').select('*').eq('id', profile.family_account_id).maybeSingle();
    
    if (famRes) {
      familyAccount.familyName = famRes.family_name || familyAccount.familyName;
      familyAccount.inviteCode = famRes.invite_code || familyAccount.inviteCode;
    }
    
    if (membersRes && membersRes.length > 0) {
      familyAccount.members = membersRes.map((m: any) => ({
        id: m.id,
        name: m.full_name || m.email?.split('@')[0] || 'Thành viên',
        username: m.email?.split('@')[0] || '', // pseudo username
        role: m.role || 'Thành viên',
        avatar: m.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        email: m.email,
        joinedDate: new Date(m.created_at || Date.now()).toLocaleDateString('vi-VN'),
        isAdmin: m.is_admin === true,
        status: m.status || 'active',
      }));
    }
  }

  const userSubscription: UserSubscription | null = subscription
    ? {
        status: subscription.status || 'trial',
        plan: subscription.plan || 'free',
        trialEndsAt: subscription.trial_ends_at,
        currentPeriodEnd: subscription.current_period_end,
        sepayTransactionId: subscription.sepay_transaction_id,
      }
    : { status: 'trial', plan: 'free' };

  return {
    isLoggedIn: true,
    isDemoMode: false,
    currentUser: member,
    familyAccount,
    isAdmin,
    subscription: userSubscription,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'invite'>(defaultTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginFamilyCode, setLoginFamilyCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regFamilyName, setRegFamilyName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Invite code state
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteError, setInviteError] = useState('');

  // Submit loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Kiểm tra độ mạnh mật khẩu
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: 'Quá ngắn', color: 'text-red-500' };
    if (pwd.length < 8) return { label: 'Yếu', color: 'text-orange-500' };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Mạnh', color: 'text-emerald-600' };
    return { label: 'Trung bình', color: 'text-yellow-600' };
  };

  const pwdStrength = getPasswordStrength(regPassword);

  // ── Login Handler ─────────────────────────────────────────────────────────

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    let finalEmail = loginEmail.trim().toLowerCase();
    const pwd = loginPassword;

    if (!finalEmail) {
      setLoginError('Vui lòng nhập Email hoặc Tên đăng nhập.');
      return;
    }
    
    // Nếu là Username (không chứa @)
    if (!finalEmail.includes('@')) {
      if (!loginFamilyCode) {
        setLoginError('Vui lòng nhập Mã gia đình khi đăng nhập bằng Tên đăng nhập (Username).');
        return;
      }
      // Pseudo email định dạng: username@invitecode.giadinhvivu.com
      finalEmail = `${finalEmail}@${loginFamilyCode.trim().toLowerCase()}.giadinhvivu.com`;
    }

    if (!pwd) {
      setLoginError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setLoginError('Dịch vụ xác thực chưa được cấu hình. Vui lòng liên hệ hỗ trợ.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Đăng nhập qua Supabase Auth — đây là cổng xác thực DUY NHẤT
      const { data, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password: pwd });

      if (error || !data.user) {
        const msg = error?.message || 'Đăng nhập thất bại';
        if (msg.includes('Invalid login credentials')) {
          setLoginError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
        } else if (msg.includes('Email not confirmed')) {
          setLoginError('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.');
        } else {
          setLoginError(`Đăng nhập thất bại: ${msg}`);
        }
        setIsSubmitting(false);
        return;
      }

      // Lấy profile và subscription từ Supabase
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const profile = profileRes.data;
      const subscription = subRes.data;

      // Kiểm tra tài khoản có bị suspended không
      if (profile?.status === 'suspended') {
        setLoginError('Tài khoản này đã bị tạm khóa. Vui lòng liên hệ hỗ trợ qua email admin@giadinhvivu.com.');
        await supabase.auth.signOut();
        setIsSubmitting(false);
        return;
      }

      const session = await buildSessionFromSupabase(data.user, profile, subscription);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setLoginError(`Lỗi hệ thống: ${err.message || String(err)}. Vui lòng thử lại.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Register Handler ──────────────────────────────────────────────────────

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const email = regEmail.trim().toLowerCase();
    const ownerName = regOwnerName.trim();
    const familyName = regFamilyName.trim();
    const pwd = regPassword;
    const confirmPwd = regConfirmPassword;

    // Validation
    if (!familyName || !ownerName || !email || !pwd || !confirmPwd) {
      setRegError('Vui lòng điền đầy đủ tất cả các trường bắt buộc.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setRegError('Địa chỉ email không hợp lệ. Ví dụ: ten@gmail.com');
      return;
    }
    if (pwd.length < 8) {
      setRegError('Mật khẩu phải có ít nhất 8 ký tự để bảo mật tài khoản gia đình.');
      return;
    }
    if (pwd !== confirmPwd) {
      setRegError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setRegError('Dịch vụ đăng ký chưa được cấu hình. Vui lòng liên hệ hỗ trợ.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await supabaseSignUp(email, pwd, ownerName, familyName);

      if (!result.success || result.error) {
        const msg = result.error || 'Đăng ký thất bại';
        if (msg.includes('already registered') || msg.includes('User already registered')) {
          setRegError('Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.');
        } else if (msg.includes('Password should be at least')) {
          setRegError('Mật khẩu cần ít nhất 8 ký tự.');
        } else {
          setRegError(`Đăng ký thất bại: ${msg}`);
        }
        setIsSubmitting(false);
        return;
      }

      // Đăng ký thành công — kiểm tra xem có cần xác nhận email không
      if (result.user && !result.session) {
        setRegSuccess('🎉 Tài khoản đã được tạo! Vui lòng kiểm tra hộp thư để xác nhận email trước khi đăng nhập.');
        // Reset form
        setRegFamilyName(''); setRegOwnerName(''); setRegEmail(''); setRegPassword(''); setRegConfirmPassword('');
      } else if (result.user && result.session) {
        // Email confirmed immediately or email confirmation disabled (Supabase returns session)
        const [profileRes, subRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', result.user.id).maybeSingle(),
          supabase.from('subscriptions').select('*').eq('user_id', result.user.id).maybeSingle(),
        ]);
        const session = await buildSessionFromSupabase(result.user as any, profileRes.data, subRes.data);
        onLoginSuccess(session);
        onClose();
      }
    } catch (err: any) {
      setRegError(`Lỗi hệ thống: ${err.message || String(err)}. Vui lòng thử lại.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Invite Code Handler ────────────────────────────────────────────────────

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');

    const code = inviteCodeInput.trim().toUpperCase();
    const email = inviteEmail.trim().toLowerCase();
    const pwd = invitePassword;

    if (!code) {
      setInviteError('Vui lòng nhập mã lời mời.');
      return;
    }
    if (!email || !email.includes('@')) {
      setInviteError('Vui lòng nhập email đăng nhập của bạn.');
      return;
    }
    if (!pwd) {
      setInviteError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setInviteError('Dịch vụ xác thực chưa được cấu hình.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Xác thực invite code trong Supabase
      const { data: familyData, error: familyError } = await supabase
        .from('family_accounts')
        .select('*')
        .eq('invite_code', code)
        .maybeSingle();

      if (familyError || !familyData) {
        setInviteError('Mã lời mời không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại với người trưởng nhóm.');
        setIsSubmitting(false);
        return;
      }

      // 2. Đăng nhập user
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (loginError || !loginData.user) {
        setInviteError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
        setIsSubmitting(false);
        return;
      }

      // 3. Liên kết user vào family account
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      await fetch(`${appUrl}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loginData.user.id, updates: { family_account_id: familyData.id, updated_at: new Date().toISOString() } })
      });

      const [profileRes, subRes] = await Promise.all([
        fetch(`${appUrl}/api/get-profile?userId=${loginData.user.id}`).then(res => res.json()),
        supabase.from('subscriptions').select('*').eq('user_id', loginData.user.id).maybeSingle(),
      ]);

      const session = await buildSessionFromSupabase(loginData.user, profileRes.profile || profileRes.data, subRes.data);
      onLoginSuccess(session);
      onClose();
    } catch (err: any) {
      setInviteError(`Lỗi hệ thống: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden relative my-auto">
        {/* Header */}
        <div className="bg-[#183B35] p-6 text-white relative flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-3">
            <GiaDinhViVuLogo variant="inverse" size="md" />
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Đăng nhập để tự do tạo, chỉnh sửa & lưu giữ khoảnh khắc các chuyến đi của gia đình bạn.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1 flex-shrink-0">
          {(['login', 'register', 'invite'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setLoginError(''); setRegError(''); setRegSuccess(''); setInviteError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'login' ? 'Đăng nhập' : tab === 'register' ? 'Đăng ký' : 'Mã mời'}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">

          {/* ── LOGIN ────────────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="flex items-start gap-2 text-xs text-rose-700 font-medium bg-rose-50 border border-rose-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email hoặc Tên đăng nhập</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ten@gmail.com hoặc username"
                    autoComplete="username"
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>

              {!loginEmail.includes('@') && loginEmail.length > 0 && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between">
                    Mã gia đình (Invite Code)
                    <span className="text-[10px] text-amber-600 font-normal">Cho tài khoản phụ</span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={loginFamilyCode}
                      onChange={(e) => setLoginFamilyCode(e.target.value)}
                      placeholder="VD: VIVU-123456"
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none uppercase font-mono text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showLoginPwd ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd((v) => !v)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#183B35] hover:bg-[#28584E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập vào Gia đình'}</span>
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => setActiveTab('register')} className="font-bold text-[#183B35] hover:underline cursor-pointer">
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER ─────────────────────────────────────────────── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="flex items-start gap-2 text-xs text-rose-700 font-medium bg-rose-50 border border-rose-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="flex items-start gap-2 text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên gia đình <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regFamilyName}
                    onChange={(e) => setRegFamilyName(e.target.value)}
                    placeholder="VD: Gia đình Nguyễn Văn Phúc"
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ tên Trưởng nhóm <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Phúc"
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ten@gmail.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu <span className="text-rose-500">*</span>
                  <span className="text-slate-400 font-normal ml-1">(tối thiểu 8 ký tự)</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPwd ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Ít nhất 8 ký tự..."
                    autoComplete="new-password"
                    className="w-full px-3 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPwd((v) => !v)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwdStrength && (
                  <p className={`text-xs mt-1 font-medium ${pwdStrength.color}`}>
                    Độ mạnh: {pwdStrength.label}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận mật khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu..."
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                  required
                />
                {regConfirmPassword && regPassword !== regConfirmPassword && (
                  <p className="text-xs mt-1 font-medium text-rose-500">Mật khẩu không khớp</p>
                )}
              </div>

              {/* Trial info box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Dùng thử miễn phí 30 ngày</span> — không cần thẻ ngân hàng. Đăng ký xong là dùng ngay!
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!regSuccess}
                className="w-full bg-[#183B35] hover:bg-[#28584E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản Gia đình'}</span>
              </button>
            </form>
          )}

          {/* ── INVITE CODE ───────────────────────────────────────────── */}
          {activeTab === 'invite' && (
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-900 leading-relaxed">
                Nhập mã lời mời từ Trưởng nhóm gia đình và email/mật khẩu của bạn để tham gia vào chuyến đi chung.
              </div>

              {inviteError && (
                <div className="flex items-start gap-2 text-xs text-rose-700 font-medium bg-rose-50 border border-rose-200 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã lời mời</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    placeholder="VD: VIVU-ABC123"
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email của bạn</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="ten@gmail.com"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Mật khẩu tài khoản của bạn..."
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#183B35] focus:border-transparent focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#183B35] hover:bg-[#28584E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Đang xác thực...' : 'Tham gia nhóm gia đình'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
