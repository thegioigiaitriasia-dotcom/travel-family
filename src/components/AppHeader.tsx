import React, { useState } from 'react';
import { Bell, User, ChevronDown, LogOut, Settings, HelpCircle } from 'lucide-react';
import { GiaDinhViVuLogo } from './common/GiaDinhViVuLogo';
import { UserAuthSession } from '../types';

interface AppHeaderProps {
  onNavigateHome: () => void;
  onNavigateToPlanner: () => void;
  onNavigateToPlaces: () => void;
  onNavigateToDiary: () => void;
  session?: UserAuthSession;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onNavigateHome,
  onNavigateToPlanner,
  onNavigateToPlaces,
  onNavigateToDiary,
  session,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const user = session?.currentUser;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo & System Name */}
        <div className="flex items-center gap-8">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            title="Gia Đình Vi Vu"
          >
            <GiaDinhViVuLogo variant="full" size="md" className="group-hover:opacity-95 transition-opacity" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <button
              onClick={onNavigateHome}
              className="px-3 py-2 rounded-lg text-emerald-700 bg-emerald-50 font-bold transition-colors cursor-pointer"
            >
              Chuyến đi của tôi
            </button>
            <button
              onClick={onNavigateToPlanner}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tạo chuyến đi AI
            </button>
            <button
              onClick={onNavigateToPlaces}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Địa điểm đã lưu
            </button>
            <button
              onClick={onNavigateToDiary}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Nhật ký du lịch
            </button>
          </nav>
        </div>

        {/* Right: Notifications, User Avatar & Menu */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors relative cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                2
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">Thông báo gia đình</h4>
                  <span className="text-xs text-red-600 font-semibold cursor-pointer hover:underline">
                    Đánh dấu đã đọc
                  </span>
                </div>
                <div className="space-y-3 py-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                    <p className="font-bold text-slate-900">Sắp khởi hành Đà Nẵng!</p>
                    <p className="text-slate-600">Còn 3 ngày nữa là đến chuyến đi. Hãy kiểm tra checklist đồ đạc.</p>
                    <span className="text-[10px] text-slate-400">10 phút trước</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-semibold text-slate-900">Thành viên thêm địa điểm mới</p>
                    <p className="text-slate-600">Minh vừa cập nhật 2 quán ăn ngon ở Hội An.</p>
                    <span className="text-[10px] text-slate-400">2 giờ trước</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"}
                  alt={user?.name || "Thành viên"}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:block text-sm font-bold text-slate-800">{user?.name || "Tài khoản"}</span>
              <ChevronDown className="hidden sm:block w-4 h-4 text-slate-500" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-sm">
                <div className="px-3 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{user?.name || "Tài khoản"} ({user?.role || "Thành viên"})</p>
                  <p className="text-xs text-slate-500 mt-0.5">{session?.familyAccount?.familyName || "Gia đình"}</p>
                </div>
                <div className="py-1">
                  <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Hồ sơ gia đình</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Cài đặt tài khoản</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Hướng dẫn sử dụng</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
