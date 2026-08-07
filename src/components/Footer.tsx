import React from 'react';
import { Compass, Sparkles, BookOpen, MapPin, Bookmark } from 'lucide-react';
import { ModuleType } from '../types';
import { GiaDinhViVuLogo } from './common/GiaDinhViVuLogo';

interface FooterProps {
  onSelectModule?: (module: ModuleType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectModule }) => {
  return (
    <footer className="bg-[#183B35] text-[#E9F0ED] border-t border-[#28584E] pt-12 pb-24 md:pb-12 mt-16 text-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#28584E]">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <GiaDinhViVuLogo variant="inverse" size="md" />
            </div>
            <p className="text-[#C2D1CC] text-xs leading-relaxed font-normal">
              Cẩm nang lập kế hoạch và lưu giữ khoảnh khắc du lịch gia đình trọn vẹn. Thiết kế tối ưu cho trải nghiệm đa thế hệ cùng người già và trẻ nhỏ.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Tính năng chính</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectModule?.('my-trips')}
                  className="hover:text-white text-[#C2D1CC] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#A46F3D]" />
                  <span>Chuyến đi của tôi</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectModule?.('ai-planner')}
                  className="hover:text-white text-[#C2D1CC] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A46F3D]" />
                  <span>Lập kế hoạch AI</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectModule?.('travel-book')}
                  className="hover:text-white text-[#C2D1CC] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#A46F3D]" />
                  <span>Lịch trình chi tiết</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectModule?.('my-places')}
                  className="hover:text-white text-[#C2D1CC] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#A46F3D]" />
                  <span>Địa điểm yêu thích</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectModule?.('travel-diary')}
                  className="hover:text-white text-[#C2D1CC] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#A46F3D]" />
                  <span>Nhật ký du lịch gia đình</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Utilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Tiện ích gia đình</h4>
            <ul className="space-y-2 text-xs text-[#C2D1CC] font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A46F3D]"></span>
                <span>Kho lưu trữ vé & Booking xác nhận</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A46F3D]"></span>
                <span>Checklist đồ đạc cho em bé & người già</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A46F3D]"></span>
                <span>Sổ thu chi & Quản lý ngân sách</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A46F3D]"></span>
                <span>Xuất file PDF cẩm nang in ấn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#95A8A2] font-medium">
          <p>© {new Date().getFullYear()} Gia Đình Vi Vu. Cẩm nang du lịch gia đình cao cấp.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-white transition-colors cursor-pointer">Điều khoản sử dụng</span>
            <span className="hover:text-white transition-colors cursor-pointer">Hướng dẫn ứng dụng</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
