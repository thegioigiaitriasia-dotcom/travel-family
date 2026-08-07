import React, { useState } from 'react';
import { ModuleType, UserAuthSession, TravelBook } from '../types';
import {
  Compass,
  Sparkles,
  BookOpen,
  MapPin,
  Bookmark,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  LogIn,
  UserPlus,
  Users,
  Clock,
  Calendar,
  Utensils,
  Plane,
  Camera,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { GiaDinhViVuLogo } from './common/GiaDinhViVuLogo';

interface NavigationProps {
  currentModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  session: UserAuthSession;
  onOpenAuth: (tab?: 'login' | 'register') => void;
  onSwitchToDemo: () => void;
  onLogout: () => void;
  travelBook?: TravelBook;
}

export const Navigation: React.FC<NavigationProps> = React.memo(({
  currentModule,
  onSelectModule,
  session,
  onOpenAuth,
  onSwitchToDemo,
  onLogout,
  travelBook,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [filterTab, setFilterTab] = useState<'all' | 'schedule' | 'notes'>('all');
  const [readIds, setReadIds] = useState<string[]>([]);

  // Default fallback trip schedule if travelBook is not provided
  const daysData = travelBook?.days || [];
  const tripTitle = travelBook?.title || 'Đà Nẵng – Hội An';

  // Construct dynamic schedule notifications from Travel Book itinerary
  const scheduleNotifications = [
    {
      id: 'notif-countdown',
      type: 'countdown' as const,
      category: 'notes' as const,
      title: `Nhắc lịch: Chuyến đi ${tripTitle}`,
      subtitle: 'Còn 3 ngày nữa khởi hành (08/08/2026)',
      timeStr: 'Hôm nay',
      details: 'Vui lòng kiểm tra lại vé máy bay, CCCD trẻ em và danh sách đồ đạc gia đình.',
      badgeText: 'Sắp tới',
      badgeColor: 'bg-[#E9F0ED] text-[#183B35] border-[#183B35]/20',
      icon: Calendar,
      iconColor: 'text-[#183B35] bg-[#E9F0ED]',
    },
    ...daysData.flatMap((day) =>
      (day.activities || []).map((act) => {
        let icon = Clock;
        let iconColor = 'text-[#183B35] bg-[#E9F0ED]';
        let category: 'schedule' | 'notes' = 'schedule';

        if (act.type === 'food' || act.title.toLowerCase().includes('ăn')) {
          icon = Utensils;
          iconColor = 'text-[#A46F3D] bg-[#F3E9DD]';
        } else if (act.type === 'transport' || act.title.toLowerCase().includes('bay')) {
          icon = Plane;
          iconColor = 'text-[#183B35] bg-[#E9F0ED]';
        } else if (act.type === 'sightseeing' || act.title.toLowerCase().includes('tham quan')) {
          icon = Camera;
          iconColor = 'text-[#28584E] bg-[#E9F0ED]';
        } else if (act.type === 'accommodation' || act.title.toLowerCase().includes('check-in')) {
          icon = Building2;
          iconColor = 'text-[#183B35] bg-[#E9F0ED]';
        }

        return {
          id: `notif-${act.id}`,
          type: 'activity' as const,
          category,
          title: act.title,
          subtitle: `Ngày ${day.dayNumber} (${day.dateStr}) · ${act.startTime} - ${act.endTime}`,
          timeStr: act.startTime,
          details: act.place?.name ? `Địa điểm: ${act.place.name}` : act.description,
          badgeText: `N${day.dayNumber} · ${act.startTime}`,
          badgeColor: 'bg-[#F7F5F0] text-[#606864] border-[#E2E3DE]',
          icon,
          iconColor,
        };
      })
    ),
  ];

  // Filtered list
  const filteredNotifications = scheduleNotifications.filter((n) => {
    if (filterTab === 'schedule') return n.type === 'activity';
    if (filterTab === 'notes') return n.type === 'countdown';
    return true;
  });

  const unreadCount = scheduleNotifications.filter((n) => !readIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    setReadIds(scheduleNotifications.map((n) => n.id));
  };

  const navItems = [
    {
      id: 'my-trips' as ModuleType,
      label: 'Chuyến đi',
      icon: Compass,
    },
    {
      id: 'ai-planner' as ModuleType,
      label: 'Tạo lịch AI',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'travel-book' as ModuleType,
      label: 'Lịch trình',
      icon: BookOpen,
    },
    {
      id: 'my-places' as ModuleType,
      label: 'Địa điểm',
      icon: MapPin,
    },
    {
      id: 'travel-diary' as ModuleType,
      label: 'Nhật ký',
      icon: Bookmark,
    },
    {
      id: 'account' as ModuleType,
      label: 'Gia đình',
      icon: Users,
    },
    {
      id: 'admin-dashboard' as ModuleType,
      label: 'Admin',
      icon: Shield,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E3DE]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Logo */}
          <button
            type="button"
            onClick={() => onSelectModule('my-trips')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
            title="Gia Đình Vi Vu - Trang chủ"
          >
            <GiaDinhViVuLogo variant="full" size="md" className="group-hover:opacity-95 transition-opacity" />
          </button>

          {/* Right Controls: Notifications + User Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="p-2 sm:p-2.5 rounded-full hover:bg-[#F7F5F0] text-[#1D211F] transition-colors relative cursor-pointer"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#183B35] text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E2E3DE] p-4 z-50 space-y-3 max-h-[85vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E3DE] shrink-0">
                    <div>
                      <h4 className="font-semibold text-sm text-[#1D211F] flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-[#183B35]" />
                        <span>Lịch trình & Nhắc nhở</span>
                      </h4>
                      <p className="text-[11px] text-[#606864]">Các hoạt động theo thời gian chuyến đi</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-[#183B35] font-semibold hover:underline bg-[#E9F0ED] px-2 py-1 rounded-md"
                      >
                        Đã đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-[#F7F5F0] p-1 rounded-xl text-xs shrink-0 font-medium">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`flex-1 py-1 text-center rounded-lg transition-colors cursor-pointer ${
                        filterTab === 'all'
                          ? 'bg-white text-[#1D211F] font-semibold'
                          : 'text-[#606864] hover:text-[#1D211F]'
                      }`}
                    >
                      Tất cả ({scheduleNotifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('schedule')}
                      className={`flex-1 py-1 text-center rounded-lg transition-colors cursor-pointer ${
                        filterTab === 'schedule'
                          ? 'bg-white text-[#1D211F] font-semibold'
                          : 'text-[#606864] hover:text-[#1D211F]'
                      }`}
                    >
                      Lịch trình
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('notes')}
                      className={`flex-1 py-1 text-center rounded-lg transition-colors cursor-pointer ${
                        filterTab === 'notes'
                          ? 'bg-white text-[#1D211F] font-semibold'
                          : 'text-[#606864] hover:text-[#1D211F]'
                      }`}
                    >
                      Lưu ý
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1 divide-y divide-[#E2E3DE]/60">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-8 text-center text-[#8D9490] text-xs">
                        Không có thông báo nào.
                      </div>
                    ) : (
                      filteredNotifications.map((item) => {
                        const IconComp = item.icon;
                        const isRead = readIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (!isRead) setReadIds([...readIds, item.id]);
                              onSelectModule('travel-book');
                              setShowNotifications(false);
                            }}
                            className={`pt-2.5 first:pt-0 p-2.5 rounded-xl transition-colors cursor-pointer group flex items-start gap-3 hover:bg-[#F7F5F0] border border-transparent hover:border-[#E2E3DE] ${
                              isRead ? 'opacity-75' : 'bg-[#E9F0ED]/30'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${item.iconColor}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-semibold text-xs text-[#1D211F] truncate group-hover:text-[#183B35] transition-colors">
                                  {item.title}
                                </p>
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${item.badgeColor}`}
                                >
                                  {item.badgeText}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#606864] font-medium leading-tight">
                                {item.subtitle}
                              </p>
                              <p className="text-[11px] text-[#8D9490] line-clamp-2">
                                {item.details}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer Action button */}
                  <div className="pt-2 border-t border-[#E2E3DE] shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectModule('travel-book');
                        setShowNotifications(false);
                      }}
                      className="w-full py-2 bg-[#183B35] hover:bg-[#28584E] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem toàn bộ Lịch trình chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Login/Register Button */}
            {session.isLoggedIn && session.currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#183B35]">
                    <img
                      src={session.currentUser.avatar}
                      alt={session.currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden md:block text-xs font-semibold text-[#1D211F]">
                    {session.currentUser.name}
                  </span>
                  <ChevronDown className="hidden md:block w-3.5 h-3.5 text-[#606864]" />
                </button>

                {/* Profile Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-[#E2E3DE] p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-[#E2E3DE]">
                      <p className="font-semibold text-[#1D211F]">{session.currentUser.name}</p>
                      <p className="text-[11px] text-[#183B35] font-medium mt-0.5">
                        {session.familyAccount?.familyName || 'Gia đình'} ({session.familyAccount?.members.length || 1} thành viên)
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onSelectModule('account');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7F5F0] flex items-center gap-2 text-[#1D211F] font-medium cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#606864]" />
                        <span>Hồ sơ gia đình & Thành viên</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onSelectModule('admin-dashboard');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7F5F0] flex items-center gap-2 text-[#183B35] font-semibold cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-[#183B35]" />
                        <span>Trung tâm Quản trị Admin</span>
                      </button>
                    </div>
                    <div className="border-t border-[#E2E3DE] pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 bg-[#183B35] hover:bg-[#28584E] text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#F7F5F0] hover:bg-[#EFEAE1] text-[#1D211F] font-semibold text-xs rounded-xl border border-[#E2E3DE] transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#606864]" />
                  <span>Đăng ký</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation Modules Bar */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 border-t border-[#E2E3DE] pt-1 pb-0 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectModule(item.id)}
                className={`flex items-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-[#183B35] border-[#183B35] font-semibold'
                    : 'text-[#606864] border-transparent hover:text-[#1D211F] hover:border-[#E2E3DE]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#183B35]' : 'text-[#606864]'}`} strokeWidth={1.75} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-[#E9F0ED] text-[#183B35] border border-[#183B35]/20'
                        : 'bg-[#F7F5F0] text-[#606864]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
});


