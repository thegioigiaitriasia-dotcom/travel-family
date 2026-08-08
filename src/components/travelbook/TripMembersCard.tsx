import React from 'react';
import { Users, UserPlus, UserX } from 'lucide-react';

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

export const TripMembersCard: React.FC<TripMembersCardProps> = ({
  members = [],
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
            m.avatarUrl ? (
              <img key={m.id} src={m.avatarUrl} alt={m.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs" />
            ) : (
              <div key={m.id} className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 items-center justify-center text-xs font-bold text-slate-600">
                {m.name.charAt(0).toUpperCase()}
              </div>
            )
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

      {/* Members List or Empty State */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
            <UserX className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Chưa có thành viên nào</p>
          <p className="text-[11px] text-slate-400">Nhấn "Mời người thân" để thêm thành viên vào chuyến đi.</p>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">{member.name.charAt(0).toUpperCase()}</div>
                )}
                <span className="text-xs font-extrabold text-slate-800">{member.name}</span>
              </div>
              {getRoleBadge(member.role)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
