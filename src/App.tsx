import React, { useState, useEffect, useMemo } from 'react';
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

      // Fetch profile từ API backend để bypass lỗi RLS vòng lặp, subscription vẫn dùng client
      const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const [profileRes, subRes] = await Promise.all([
        fetch(`${appUrl}/api/get-profile?userId=${sbUser.id}`).then(res => res.json()),
        supabase.from('subscriptions').select('*').eq('user_id', sbUser.id)
          .order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const profile = profileRes.profile || profileRes.data; // Hỗ trợ cả API và Supabase fallback
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

      // Tải family_accounts và toàn bộ profiles (thành viên) — dùng API backend để bypass RLS
      if (profile?.family_account_id) {
        const famMembersRes = await fetch(`${appUrl}/api/get-family-members?familyId=${encodeURIComponent(profile.family_account_id)}`).then(r => r.json());

        if (famMembersRes.success && famMembersRes.family) {
          familyAccount.familyName = famMembersRes.family.family_name || familyAccount.familyName;
          familyAccount.inviteCode = famMembersRes.family.invite_code || familyAccount.inviteCode;
          familyAccount.avatar = famMembersRes.family.avatar || familyAccount.avatar;
        }

        if (famMembersRes.success && famMembersRes.members && famMembersRes.members.length > 0) {
          familyAccount.members = famMembersRes.members.map((m: any) => ({
            id: m.id,
            name: m.full_name || m.email?.split('@')[0] || 'Thành viên',
            username: m.email?.split('@')[0] || '',
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

  // Xử lý URL param ?invite=VIVU-XXXX → tự mở tab Mã mời
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite');
    if (inviteParam && !session.isLoggedIn) {
      // Lưu mã vào sessionStorage để AuthModal đọc
      sessionStorage.setItem('pendingInviteCode', inviteParam.toUpperCase());
      setAuthModalTab('invite');
      setIsAuthModalOpen(true);
      // Xóa param khỏi URL để không bị lặp
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

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
    // Generate an empty/fallback TravelBook if there are no trips yet
    const fallbackTravelBook: TravelBook = {
      id: 'empty',
      title: 'Chuyến đi chưa có tên',
      coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'planning',
      durationDays: 1,
      durationNights: 0,
      budgetEstimatedMin: 0,
      budgetEstimatedMax: 0,
      members: [],
      destinations: [],
      days: []
    };

    if (session.isDemoMode && currentTrips.length === 0) {
      return fallbackTravelBook;
    }
    
    const username = session.currentUser?.username?.toLowerCase() || '';
    if (username === 'admin@giadinhvivu.com' || username === 'admin' || username === 'giadinhvivu') {
      return fallbackTravelBook;
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
          inviteCode: session.familyAccount?.inviteCode,
          familyName: session.familyAccount?.familyName,
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
        inviteCode: session.familyAccount?.inviteCode,
        familyName: session.familyAccount?.familyName,
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
    days: (t.fullData?.days || []).map((d: any) => ({
      id: d.id || `day-${d.dayNumber}`,
      dayNumber: d.dayNumber,
      dateStr: d.dateStr || d.date || '',
      title: d.title || `Ngày ${d.dayNumber}`,
      theme: d.theme || d.title || '',
      activities: (d.activities || []).map((act: any) => ({
        id: act.id || `act-${Math.random()}`,
        type: act.type || 'experience',
        startTime: act.startTime || '08:00',
        endTime: act.endTime || '09:00',
        title: act.title || '',
        status: 'upcoming' as const,
        place: act.place,
        estimatedCost: act.estimatedCost,
        note: act.note,
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
    setSelectedTripId(demoTrips[0]?.id || 'trip-demo-1');
  };

  const handleLogout = () => {
    handleSwitchToDemo();
  };

  const handleUpdateAccount = (updatedAccount: FamilyAccount) => {
    setSession((prev) => {
      // Nếu avatar của currentUser trong members thay đổi, cập nhật luôn currentUser
      const updatedCurrentUser = updatedAccount.members.find(
        (m) => m.id === prev.currentUser?.id
      );
      return {
        ...prev,
        familyAccount: updatedAccount,
        currentUser: updatedCurrentUser
          ? { ...prev.currentUser, ...updatedCurrentUser }
          : prev.currentUser,
      };
    });
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
    let normalizedDays = [];
    let prepItems = [];
    try {
      const saved = localStorage.getItem('generated_ai_plan');
      if (saved) {
        aiPlanData = JSON.parse(saved);
        
        // Normalize AI data to TravelBook schema
        if (aiPlanData.days && Array.isArray(aiPlanData.days)) {
          normalizedDays = aiPlanData.days.map((day: any, dIdx: number) => ({
            id: `day-${dIdx + 1}`,
            dayNumber: day.dayNumber || dIdx + 1,
            dateStr: day.date || new Date(Date.now() + dIdx * 86400000).toLocaleDateString('vi-VN'),
            title: day.theme || `Ngày ${dIdx + 1}`,
            destinationName: day.cityName || destination,
            activities: (day.activities || []).map((act: any, aIdx: number) => {
              // Map AI category to TravelActivityType
              let type = 'sightseeing';
              const cat = (act.category || '').toLowerCase();
              if (cat.includes('restaur') || cat.includes('food') || cat.includes('ăn')) type = 'dining';
              else if (cat.includes('trans') || cat.includes('di chuyển')) type = 'transport';
              else if (cat.includes('hotel') || cat.includes('lưu trú')) type = 'accommodation';
              else if (cat.includes('rest') || cat.includes('nghỉ')) type = 'rest';
              
              let estimatedCost = 0;
              if (act.estimatedCost) {
                const numericCost = String(act.estimatedCost).replace(/[^0-9]/g, '');
                if (numericCost) estimatedCost = parseInt(numericCost);
              }

              return {
                id: `act-${dIdx}-${aIdx}-${Date.now()}`,
                type,
                startTime: act.startTime || act.time || '08:00',
                endTime: act.endTime || (act.startTime ? `${parseInt(act.startTime.split(':')[0]) + 2}:00` : act.time ? `${parseInt(act.time.split(':')[0]) + 2}:00` : '10:00'),
                title: act.title || act.locationName || 'Hoạt động',
                description: act.description || '',
                status: 'upcoming',
                place: { name: act.locationName || act.title || '' },
                familyTips: act.familyTip ? [act.familyTip] : [],
                estimatedCost
              };
            })
          }));
        }

        // Generate some prep items from family advices
        if (aiPlanData.familyAdvice && Array.isArray(aiPlanData.familyAdvice)) {
          prepItems = aiPlanData.familyAdvice.map((advice: string, idx: number) => ({
            id: `prep-${idx}`,
            category: 'health',
            name: advice,
            status: 'pending'
          }));
        }
      }
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
      fullData: aiPlanData ? {
        ...aiPlanData,
        days: normalizedDays,
        prepItems: prepItems
      } : {},
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
            <TravelBookModule
              trip={currentTravelBook}
              onNavigateHome={() => setCurrentModule('my-trips')}
              onNavigateToPlanner={() => setCurrentModule('ai-planner')}
              onNavigateToPlaces={() => setCurrentModule('my-places')}
              onNavigateToDiary={() => setCurrentModule('travel-diary')}
              onUpdateTrip={handleUpdateTravelBook}
            />
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
