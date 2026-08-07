import React, { useState, useEffect, useMemo } from 'react';
import { ModuleType, TripSummary, UserAuthSession, FamilyAccount, FamilyMember } from './types';
import { ModuleType, TripSummary, UserAuthSession, FamilyAccount, FamilyMember } from './types';
import { Navigation } from './components/Navigation';
import { MobileBottomNavigation } from './components/MobileBottomNavigation';
import { MyTripsModule } from './components/MyTripsModule';
import { AIPlannerModule } from './components/AIPlannerModule';
import { TravelBookModule } from './components/TravelBookModule';
import { MyPlacesPage } from './components/places/MyPlacesPage';
import { TravelDiaryModule } from './components/TravelDiaryModule';
import { AccountPage } from './components/account/AccountPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { DemoRestrictionModal } from './components/auth/DemoRestrictionModal';
import { PaywallModal } from './components/auth/PaywallModal';
import { BackToTopButton } from './components/BackToTopButton';
import { Footer } from './components/Footer';
import { TravelBook, TravelActivityType, SavedPlace, TripStatus } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Sparkles, LogIn, UserPlus, Info, CheckCircle2 } from 'lucide-react';


export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('my-trips');
  
  // Auth state: Default to Demo Mode so visitors can explore sample data without auto-login
  const [session, setSession] = useState<UserAuthSession>({
    isLoggedIn: false,
    isDemoMode: true,
    currentUser: null,
    familyAccount: null,
  });

  // Check Supabase Auth session on mount and restore session with profile + subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const restoreSession = async () => {
      const { data: { session: sbSession } } = await supabase.auth.getSession();
      if (!sbSession?.user) return;

      const sbUser = sbSession.user;

      // Fetch profile và subscription từ Supabase để có đúng thông tin is_admin, status
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', sbUser.id).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('user_id', sbUser.id)
          .order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const profile = profileRes.data;
      const subscription = subRes.data;

      // Nếu tài khoản bị suspended → đăng xuất ngay
      if (profile?.status === 'suspended') {
        await supabase.auth.signOut();
        return;
      }

      const isAdmin = profile?.is_admin === true;
      const ownerName = profile?.full_name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Thành viên';
      const familyName = profile?.family_name || `Gia đình ${ownerName}`;

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
        familyName: familyName,
        ownerUsername: sbUser.email || '',
        ownerName: ownerName,
        avatar: profile?.avatar_url || member.avatar,
        inviteCode: `VIVU-${sbUser.id.slice(0, 6).toUpperCase()}`,
        createdAt: new Date(sbUser.created_at).toLocaleDateString('vi-VN'),
        members: [member],
      };

      // Tải family_accounts và toàn bộ profiles (thành viên)
      if (profile?.family_account_id) {
        const [famRes, membersRes] = await Promise.all([
          supabase.from('family_accounts').select('*').eq('id', profile.family_account_id).maybeSingle(),
          supabase.from('profiles').select('*').eq('family_account_id', profile.family_account_id)
        ]);

        if (famRes.data) {
          familyAccount.familyName = famRes.data.family_name || familyAccount.familyName;
          familyAccount.inviteCode = famRes.data.invite_code || familyAccount.inviteCode;
          // owner is already set conceptually, could be refined
        }

        if (membersRes.data && membersRes.data.length > 0) {
          familyAccount.members = membersRes.data.map((m: any) => ({
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

      setSession({
        isLoggedIn: true,
        isDemoMode: false,
        currentUser: member,
        familyAccount,
        isAdmin,
        subscription: subscription ? {
          status: subscription.status,
          plan: subscription.plan,
          trialEndsAt: subscription.trial_ends_at,
          currentPeriodEnd: subscription.current_period_end,
          sepayTransactionId: subscription.sepay_transaction_id,
        } : { status: 'trial', plan: 'free' },
      });
    };

    restoreSession();

    // Listen for auth state changes (login/logout in other tabs)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (event === 'SIGNED_OUT' || !sbSession) {
        setSession({ isLoggedIn: false, isDemoMode: true, currentUser: null, familyAccount: null });
        setSelectedTripId('');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'invite'>('login');
  const [isDemoRestrictionOpen, setIsDemoRestrictionOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [demoRestrictionAction, setDemoRestrictionAction] = useState('Thao tác này');

  // Trips data state
  const [userTrips, setUserTrips] = useState<TripSummary[]>([]);
  const [demoTrips, setDemoTrips] = useState<TripSummary[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('trip-demo-1');

  // Load user trips whenever session changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    if (session.isDemoMode || !session.currentUser) {
      setUserTrips([]);
      // Fetch public trips (demo mode)
      supabase
        .from('trips')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const mapped = data.map(mapSupabaseTripToSummary);
            setDemoTrips(mapped);
            if (mapped.length > 0 && selectedTripId.includes('trip-demo-1')) {
              setSelectedTripId(mapped[0].id);
            }
          }
        });
      return;
    }
    
    // Load trips từ Supabase nếu đã đăng nhập
    const userId = session.currentUser.id;
    supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped = data.map(mapSupabaseTripToSummary);
          setUserTrips(mapped);
        }
      });
  }, [session]);

  // Helper mapping
  const mapSupabaseTripToSummary = (row: any): TripSummary & { fullData?: any } => ({
    id: row.id,
    title: row.title,
    coverImage: row.cover_image || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    durationDays: row.duration_days || 1,
    durationNights: Math.max(0, (row.duration_days || 1) - 1),
    memberCount: row.data?.memberCount || 1,
    status: (row.status as TripStatus) || 'planning',
    destinations: row.destinations || [],
    placeCount: row.data?.placeCount || 0,
    foodCount: row.data?.foodCount || 0,
    accommodationCount: row.data?.accommodationCount || 0,
    budgetMin: row.budget?.min,
    budgetMax: row.budget?.max,
    fullData: row.data,
  });

  const handleSaveUserTrips = async (newTrips: TripSummary[]) => {
    setUserTrips(newTrips);
    // Lưu vào Supabase nếu đã đăng nhập
    if (!session.isDemoMode && session.currentUser?.id && isSupabaseConfigured()) {
      const userId = session.currentUser.id;
      // Upsert từng trip vào Supabase
      for (const trip of newTrips) {
        await supabase.from('trips').upsert({
          id: trip.id,
          user_id: userId,
          title: trip.title,
          cover_image: trip.coverImage,
          start_date: trip.startDate,
          end_date: trip.endDate,
          duration_days: trip.durationDays,
          status: trip.status,
          destinations: trip.destinations,
          budget: { min: trip.budgetMin, max: trip.budgetMax },
          data: { ...trip.fullData, memberCount: trip.memberCount, placeCount: trip.placeCount, foodCount: trip.foodCount, accommodationCount: trip.accommodationCount },
          updated_at: new Date().toISOString(),
        });
      }
    }
  };

  // Active trips list depending on Demo mode vs Authenticated mode
  const currentTrips = session.isDemoMode ? demoTrips : userTrips;

  // Active travel book depending on current session & active trips
  const currentTravelBook: TravelBook = useMemo(() => {
    if (session.isDemoMode) {
      return demoTravelBook;
    }
    const username = session.currentUser?.username?.toLowerCase() || '';
    if (username === 'admin@giadinhvivu.com' || username === 'admin' || username === 'giadinhvivu') {
      return officialUserTravelBook;
    }

    if (currentTrips.length > 0) {
      const activeTrip: any = currentTrips.find((t) => t.id === selectedTripId) || currentTrips[0];
      
      // Nếu có fullData từ Supabase, parse và validate
      if (activeTrip.fullData && activeTrip.fullData.days) {
        return {
          id: activeTrip.id,
          title: activeTrip.title,
          coverImage: activeTrip.coverImage,
          startDate: activeTrip.startDate,
          endDate: activeTrip.endDate,
          status: activeTrip.status === 'upcoming' || activeTrip.status === 'planning' || activeTrip.status === 'ongoing' || activeTrip.status === 'completed' ? activeTrip.status : 'planning',
          durationDays: activeTrip.durationDays,
          durationNights: activeTrip.durationNights,
          budgetEstimatedMin: activeTrip.budgetMin || activeTrip.fullData.budgetEstimatedMin || 0,
          budgetEstimatedMax: activeTrip.budgetMax || activeTrip.fullData.budgetEstimatedMax || 0,
          memberCount: activeTrip.memberCount || 1,
          destinations: activeTrip.destinations || [],
          days: activeTrip.fullData.days,
          prepItems: activeTrip.fullData.prepItems || [],
          accommodations: activeTrip.fullData.accommodations || [],
          bookingDocuments: activeTrip.fullData.bookingDocuments || [],
        };
      }

      // Fallback cho dữ liệu trống
      return {
        id: activeTrip.id,
        title: activeTrip.title,
        coverImage: activeTrip.coverImage,
        startDate: activeTrip.startDate,
        endDate: activeTrip.endDate,
        status: activeTrip.status === 'upcoming' || activeTrip.status === 'planning' || activeTrip.status === 'ongoing' || activeTrip.status === 'completed' ? activeTrip.status : 'planning',
        durationDays: activeTrip.durationDays,
        durationNights: activeTrip.durationNights,
        budgetEstimatedMin: activeTrip.budgetMin || 5000000,
        budgetEstimatedMax: activeTrip.budgetMax || 10000000,
        memberCount: activeTrip.memberCount || 1,
        destinations: activeTrip.destinations || [],
        days: [],
        prepItems: [],
        accommodations: [],
        bookingDocuments: [],
      };
    }

    // Default clean empty travel book for a new user without trips
    return {
      id: `tb-empty-${session.familyAccount?.id || 'new'}`,
      title: session.familyAccount?.familyName ? `Lịch trình ${session.familyAccount.familyName}` : 'Lịch trình chưa khởi tạo',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      startDate: new Date().toLocaleDateString('vi-VN'),
      endDate: new Date().toLocaleDateString('vi-VN'),
      status: 'planning',
      durationDays: 0,
      durationNights: 0,
      memberCount: session.familyAccount?.members.length || 1,
      destinations: [],
      days: [],
      prepItems: [],
      accommodations: [],
      bookingDocuments: [],
      budgetEstimatedMin: 0,
      budgetEstimatedMax: 0,
    };
  }, [session, userTrips, selectedTripId]);

  // Format trips for TravelBook type compatibility
  const formattedTripsForPlaces: TravelBook[] = currentTrips.map((t) => ({
    id: t.id,
    title: t.title,
    coverImage: t.coverImage,
    startDate: t.startDate,
    endDate: t.endDate,
    durationDays: t.durationDays,
    durationNights: t.durationNights,
    status: t.status === 'upcoming' || t.status === 'planning' || t.status === 'ongoing' || t.status === 'completed' ? t.status : 'planning',
    budgetEstimatedMin: t.budgetMin || 5000000,
    budgetEstimatedMax: t.budgetMax || 9000000,
    memberCount: t.memberCount || 1,
    destinations: t.destinations || [],
    prepItems: [],
    accommodations: [],
    days: mockTripDays.map((d) => ({
      id: `day-${d.dayNumber}`,
      dayNumber: d.dayNumber,
      dateStr: d.dateStr,
      title: d.title,
      theme: d.title,
      activities: d.activities.map((act) => ({
        id: act.id,
        type: (act.category === 'Ăn uống' ? 'food' : act.category === 'Tham quan' ? 'sightseeing' : 'experience') as TravelActivityType,
        startTime: act.time.split(' - ')[0] || '08:00',
        endTime: act.time.split(' - ')[1] || '09:00',
        title: act.title,
        status: 'upcoming' as const,
        place: {
          name: act.locationName || act.title,
          address: act.address || '',
          category: act.category,
        },
        estimatedCost: act.estimatedCost,
        note: act.notes,
      })),
    })),
  }));

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setCurrentModule('travel-book');
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (newSession: UserAuthSession) => {
    setSession(newSession);
    setIsAuthModalOpen(false);
  };

  const handleSwitchToDemo = () => {
    setSession({
      isLoggedIn: false,
      isDemoMode: true,
      currentUser: null,
      familyAccount: null,
    });
    setSelectedTripId(demoTripSummaries[0].id);
  };

  const handleLogout = () => {
    handleSwitchToDemo();
  };

  const handleUpdateAccount = (updatedAccount: FamilyAccount) => {
    setSession((prev) => ({
      ...prev,
      familyAccount: updatedAccount,
    }));
  };

  const handleTriggerDemoRestriction = (actionName: string) => {
    setDemoRestrictionAction(actionName);
    setIsDemoRestrictionOpen(true);
  };

  const handleNavigateToPlanner = () => {
    setCurrentModule('ai-planner');
  };

  const handleGenerateSuccess = (destination: string, days: number) => {
    if (session.isDemoMode) {
      handleTriggerDemoRestriction('Tạo chuyến đi AI mới');
      return;
    }

    let aiPlanData = null;
    try {
      const saved = localStorage.getItem('generated_ai_plan');
      if (saved) aiPlanData = JSON.parse(saved);
    } catch {}

    const newTripId = `trip-${Date.now()}`;
    const newTrip: TripSummary = {
      id: newTripId,
      title: aiPlanData?.title || destination,
      coverImage: aiPlanData?.coverImage || (destination.toLowerCase().includes('đà lạt')
        ? 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&auto=format&fit=crop&q=80'),
      startDate: new Date().toLocaleDateString('vi-VN'),
      endDate: new Date(Date.now() + days * 86400000).toLocaleDateString('vi-VN'),
      durationDays: days,
      durationNights: Math.max(0, days - 1),
      memberCount: session.familyAccount?.members.length || 4,
      status: 'planning',
      destinations: [destination],
      placeCount: aiPlanData?.days?.reduce((acc: number, d: any) => acc + (d.activities?.length || 0), 0) || 8,
      foodCount: 12,
      accommodationCount: 1,
      budgetMin: aiPlanData?.budgetEstimatedMin || 8000000,
      budgetMax: aiPlanData?.budgetEstimatedMax || 12000000,
      fullData: aiPlanData || {},
    };

    const updated = [newTrip, ...userTrips];
    handleSaveUserTrips(updated);
    setSelectedTripId(newTripId);
    setCurrentModule('travel-book');
    localStorage.removeItem('generated_ai_plan');
  };

  const handleUpdateTravelBook = (updatedFields: Partial<TravelBook>) => {
    if (!selectedTripId || session.isDemoMode) return;
    
    const tripIndex = userTrips.findIndex(t => t.id === selectedTripId);
    if (tripIndex === -1) return;
    
    const current = userTrips[tripIndex];
    const newFullData = { ...(current.fullData || {}), ...updatedFields };
    
    const updatedTrip: TripSummary = {
      ...current,
      title: updatedFields.title || current.title,
      coverImage: updatedFields.coverImage || current.coverImage,
      fullData: newFullData
    };
    
    const newTrips = [...userTrips];
    newTrips[tripIndex] = updatedTrip;
    handleSaveUserTrips(newTrips);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-[#18201E] font-sans flex flex-col justify-between pb-16 md:pb-0">
      <div>
        {/* Unified Top Navigation Header */}
        <Navigation
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          session={session}
          onOpenAuth={handleOpenAuth}
          onSwitchToDemo={handleSwitchToDemo}
          onLogout={handleLogout}
          travelBook={currentTravelBook}
        />

        {/* Main Content View Container */}
        <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentModule === 'my-trips' && (
            <MyTripsModule
              trips={currentTrips}
              travelBook={currentTravelBook}
              onSelectTrip={handleSelectTrip}
              onNavigateToPlanner={handleNavigateToPlanner}
              onNavigateToPlaces={() => setCurrentModule('my-places')}
              onNavigateToDiary={() => setCurrentModule('travel-diary')}
              onOpenFullMap={() => setCurrentModule('travel-book')}
            />
          )}

          {currentModule === 'ai-planner' && (
            <AIPlannerModule
              onGenerateSuccess={handleGenerateSuccess}
              onNavigateHome={() => setCurrentModule('my-trips')}
              session={session}
              onShowPaywall={() => setIsPaywallOpen(true)}
            />
          )}

          {currentModule === 'travel-book' && (
            <TravelBookModule trip={currentTravelBook} />
          )}

          {currentModule === 'my-places' && (
            <MyPlacesPage
              trips={formattedTripsForPlaces}
              onAddActivityToTrip={(tripId, dayNumber, activityType, startTime, place) => {
                if (session.isDemoMode) {
                  handleTriggerDemoRestriction('Thêm địa điểm vào chuyến đi');
                  return;
                }
                console.log('Added place to trip:', tripId, dayNumber, place.name);
              }}
            />
          )}

          {currentModule === 'travel-diary' && (
            <TravelDiaryModule session={session} />
          )}

          {currentModule === 'account' && (
            session.isLoggedIn && session.familyAccount && session.currentUser ? (
              <AccountPage
                familyAccount={session.familyAccount}
                currentUser={session.currentUser}
                onUpdateAccount={handleUpdateAccount}
                onLogout={handleLogout}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto border border-[#E2E3DE]">
                <div className="w-16 h-16 rounded-2xl bg-[#E9F0ED] text-[#183B35] flex items-center justify-center mx-auto font-semibold text-2xl">
                  🔒
                </div>
                <h3 className="text-xl font-semibold text-[#1D211F]">Vui lòng đăng nhập</h3>
                <p className="text-[#606864] text-xs leading-relaxed">
                  Hãy Đăng nhập hoặc Đăng ký tài khoản gia đình để xem trang quản lý hồ sơ và các thành viên.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAuth('login')}
                    className="w-full bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAuth('register')}
                    className="w-full bg-[#F7F5F0] hover:bg-[#EFEAE1] text-[#1D211F] font-semibold text-xs py-3 rounded-xl border border-[#E2E3DE] transition-colors cursor-pointer"
                  >
                    Đăng ký gia đình
                  </button>
                </div>
              </div>
            )
          )}

          {currentModule === 'admin-dashboard' && (
            // 🔒 Admin guard: Chỉ render AdminDashboard khi user là Super Admin đã xác thực qua Supabase
            session.isLoggedIn && session.isAdmin === true ? (
              <AdminDashboard onNavigateToModule={(mod) => setCurrentModule(mod)} />
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto border border-rose-200">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
                  🔒
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Truy cập bị từ chối</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Trang Admin Dashboard chỉ dành cho Quản trị viên hệ thống đã được xác thực.
                  Nếu bạn là admin, vui lòng đăng nhập bằng tài khoản admin.
                </p>
              </div>
            )
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer onSelectModule={(mod) => setCurrentModule(mod)} />

      {/* Mobile Bottom Navigation Bar (Fixed bottom under 768px) */}
      <MobileBottomNavigation
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
      />

      {/* Auth Modal (Login / Register / Invite) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultTab={authModalTab}
      />

      {/* Demo Restriction Modal */}
      <DemoRestrictionModal
        isOpen={isDemoRestrictionOpen}
        onClose={() => setIsDemoRestrictionOpen(false)}
        onOpenAuth={(tab) => {
          setIsDemoRestrictionOpen(false);
          handleOpenAuth(tab);
        }}
        actionName={demoRestrictionAction}
      />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        userId={session.currentUser?.id}
      />

      {/* Back to Top Floating Button */}
      <BackToTopButton />
    </div>
  );
}
