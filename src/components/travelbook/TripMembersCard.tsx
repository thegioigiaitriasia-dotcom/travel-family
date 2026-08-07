import React from 'react';
import { Users, UserPlus, Shield, Eye, Edit } from 'lucide-react';

export interface MemberItem {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  avatarUrl?: string;
}

interface TripMembersCardProps {
  members?: MemberItem[];
  onInviteMember: () => void;
}

const defaultMembers: MemberItem[] = [
  {
    id: 'm-1',
    name: 'Phúc',
    role: 'owner',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-2',
    name: 'Lan',
    role: 'editor',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-3',
    name: 'Minh',
    role: 'viewer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'm-4',
    name: 'An',
    role: 'viewer',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  },
];

export const TripMembersCard: React.FC<TripMembersCardProps> = ({
  members = defaultMembers,
  onInviteMember,
}) => {
  const getRoleBadge = (role: MemberItem['role']) => {
    switch (role) {
      case 'owner':
        return (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Người tạo
          </span>
        );
      case 'editor':
        return (
          <span className="text-[10px] font-bold text-[#DC2626] bg-red-50 px-2 py-0.5 rounded-md border border-sky-200">
            Có thể chỉnh sửa
          </span>
        );
      case 'viewer':
      default:
        return (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            Chỉ xem
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center border border-red-100">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Thành viên chuyến đi
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-[#DC2626] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
          {members.length} thành viên
        </span>
      </div>

      {/* Overlapping Avatars Header Row */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
        <div className="flex -space-x-2 overflow-hidden">
          {members.map((m) => (
            <img
              key={m.id}
              src={m.avatarUrl}
              alt={m.name}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onInviteMember}
          className="px-3 py-1.5 rounded-xl bg-[#DC2626] text-white font-bold text-xs hover:bg-[#B91C1C] transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Mời người thân</span>
        </button>
      </div>

      {/* Members List */}
      <div className="space-y-2 pt-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-extrabold text-slate-800">{member.name}</span>
            </div>

            {getRoleBadge(member.role)}
          </div>
        ))}
      </div>
    </div>
  );
};
