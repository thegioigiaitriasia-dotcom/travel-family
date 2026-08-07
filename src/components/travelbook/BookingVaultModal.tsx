import React, { useState } from 'react';
import {
  X,
  Upload,
  Ticket,
  Plane,
  Hotel,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  Plus,
  QrCode,
  Trash2,
  FileText,
  User,
  Calendar,
  Sparkles,
  Download,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { BookingDocument, TravelBook } from '../../types';

interface BookingVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TravelBook;
  onUpdateTrip: (updatedFields: Partial<TravelBook>) => void;
  initialTypeFilter?: string;
}

export const BookingVaultModal: React.FC<BookingVaultModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
  initialTypeFilter = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTypeFilter);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<BookingDocument | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for new booking document
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<BookingDocument['type']>('ticket');
  const [newProvider, setNewProvider] = useState('');
  const [newBookingCode, setNewBookingCode] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newUploadedBy, setNewUploadedBy] = useState('Gia đình');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const docs = trip.bookingDocuments || [];

  const filteredDocs = docs.filter((doc) => {
    if (activeTab === 'all') return true;
    return doc.type === activeTab;
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNewFileUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDoc: BookingDocument = {
      id: `booking-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      provider: newProvider.trim() || undefined,
      bookingCode: newBookingCode.trim() || undefined,
      fileUrl:
        newFileUrl ||
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      uploadedBy: newUploadedBy.trim() || 'Gia đình',
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      notes: newNotes.trim() || undefined,
      status: 'confirmed',
    };

    const updatedDocs = [newDoc, ...docs];
    onUpdateTrip({ bookingDocuments: updatedDocs });

    // Reset Form
    setNewTitle('');
    setNewProvider('');
    setNewBookingCode('');
    setNewFileUrl('');
    setNewNotes('');
    setShowUploadForm(false);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa vé / xác nhận booking này khỏi chuyến đi?')) {
      const updatedDocs = docs.filter((d) => d.id !== id);
      onUpdateTrip({ bookingDocuments: updatedDocs });
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  const getTypeBadge = (type: BookingDocument['type']) => {
    switch (type) {
      case 'flight':
        return {
          label: 'Vé máy bay',
          icon: Plane,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'hotel':
        return {
          label: 'Xác nhận khách sạn',
          icon: Hotel,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'ticket':
        return {
          label: 'Vé tham quan',
          icon: Ticket,
          bg: 'bg-red-50 text-[#DC2626] border-red-200',
        };
      case 'transport':
      default:
        return {
          label: 'Vé xe / Phương tiện',
          icon: FileText,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center border border-[#FECACA] shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Kho Vé Máy Bay & Booking Xác Nhận
                </h3>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Dùng chung gia đình
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Tải lên và lưu trữ vé máy bay, booking khách sạn, vé tham quan để xuất trình tại quầy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 font-bold cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/60">
          {/* Action Row & Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Tất cả ({docs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('flight')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'flight'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Vé máy bay</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hotel')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'hotel'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Hotel className="w-3.5 h-3.5" />
                <span>Khách sạn</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ticket')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'ticket'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Vé tham quan</span>
              </button>
            </div>

            {/* Add New Ticket Button */}
            <button
              type="button"
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-600/20 shrink-0"
            >
              {showUploadForm ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Đóng form</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Tải lên vé/booking mới</span>
                </>
              )}
            </button>
          </div>

          {/* Upload Form Drawer */}
          {showUploadForm && (
            <form
              onSubmit={handleCreateDocument}
              className="p-5 bg-white border border-red-200 rounded-2xl shadow-lg space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#DC2626]" />
                  <span>Tải lên xác nhận booking hoặc vé từ thiết bị</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  Mọi thành viên gia đình đều có thể xem
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên vé / Booking dịch vụ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Vé máy bay SGN ➔ BMV (Vietnam Airlines)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại dịch vụ</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as BookingDocument['type'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#DC2626] font-bold"
                  >
                    <option value="flight">✈️ Vé máy bay (Đi / Về)</option>
                    <option value="hotel">🏨 Booking Khách sạn / Resort</option>
                    <option value="ticket">🎟️ Vé tham quan / Cổng vào</option>
                    <option value="transport">🚗 Vé xe / Phương tiện di chuyển</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã đặt chỗ / Mã PNR / Mã phòng
                  </label>
                  <input
                    type="text"
                    value={newBookingCode}
                    onChange={(e) => setNewBookingCode(e.target.value)}
                    placeholder="VD: VN-89231 / AGD-99812"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#DC2626] font-bold font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hãng / Đối tác cấp</label>
                  <input
                    type="text"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    placeholder="VD: Vietnam Airlines, Traveloka, Agoda..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thành viên tải lên</label>
                  <input
                    type="text"
                    value={newUploadedBy}
                    onChange={(e) => setNewUploadedBy(e.target.value)}
                    placeholder="VD: Bố Minh, Mẹ Mai..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú khi xuất trình</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="VD: Đã bao gồm 20kg ký gửi, xuất trình mã QR tại quầy 4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
              </div>

              {/* Upload Image Section */}
              <div className="space-y-2 pt-1">
                <label className="block font-bold text-slate-700 text-xs">
                  Hình ảnh vé / Mã QR / Cuống vé xác nhận từ thiết bị
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                  {newFileUrl ? (
                    <img
                      src={newFileUrl}
                      alt="Uploaded preview"
                      className="w-24 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-20 rounded-lg bg-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <QrCode className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">Chưa chọn ảnh</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5 w-full">
                    <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn file ảnh từ điện thoại / máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <p className="text-[11px] text-slate-500">
                      Hoặc dán URL hình ảnh nếu đã có trên mạng
                    </p>
                    <input
                      type="text"
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs cursor-pointer shadow-sm"
                >
                  Lưu vé vào kho gia đình
                </button>
              </div>
            </form>
          )}

          {/* Documents Grid List */}
          {filteredDocs.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Chưa có vé / booking nào trong mục này</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hãy bấm nút "Tải lên vé/booking mới" ở trên để lưu trữ vé máy bay, xác nhận phòng khách sạn hoặc vé tham quan cho chuyến đi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => {
                const badge = getTypeBadge(doc.type);
                const BadgeIcon = badge.icon;
                const isCopied = copiedId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group"
                  >
                    {/* Status & Type Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã có booking
                      </span>
                    </div>

                    {/* Title & Details */}
                    <div className="flex gap-3 items-start">
                      {/* Image Thumbnail */}
                      <div
                        onClick={() => setPreviewDoc(doc)}
                        className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shrink-0 cursor-pointer group-hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={doc.fileUrl}
                          alt={doc.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Text info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                          {doc.title}
                        </h4>

                        {doc.provider && (
                          <p className="text-[11px] font-semibold text-slate-500">
                            Hãng/Đơn vị: <span className="text-slate-800">{doc.provider}</span>
                          </p>
                        )}

                        {doc.bookingCode && (
                          <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-xs font-extrabold font-mono text-slate-900">
                            <span>Mã: {doc.bookingCode}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(doc.bookingCode!, doc.id)}
                              className="text-slate-500 hover:text-[#DC2626] ml-1 cursor-pointer"
                              title="Sao chép mã booking"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes & Footer */}
                    {doc.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                        💡 {doc.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{doc.uploadedBy || 'Gia đình'}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Xóa vé này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mở vé xuất trình</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Đã có <strong className="text-slate-900">{docs.length}</strong> chứng nhận vé & booking trong kho chuyến đi
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Presenter Full-screen Modal (Chế độ xuất trình vé tại quầy) */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-[28px] max-w-xl w-full overflow-hidden shadow-2xl relative border border-slate-700 my-auto flex flex-col max-h-[95vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#DC2626] text-white rounded-lg">
                  <Ticket className="w-4 h-4" />
                </span>
                <span className="font-extrabold text-sm tracking-tight">
                  Xuất trình vé / Booking tại quầy
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Details & Image */}
            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#DC2626] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    {previewDoc.type === 'flight'
                      ? 'Vé máy bay'
                      : previewDoc.type === 'hotel'
                      ? 'Xác nhận khách sạn'
                      : 'Vé tham quan'}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ĐÃ XÁC NHẬN BOOKING
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {previewDoc.title}
                </h3>

                {previewDoc.bookingCode && (
                  <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                        Mã đặt chỗ / Mã PNR / Mã vé
                      </span>
                      <span className="text-lg font-black font-mono text-yellow-300 tracking-widest">
                        {previewDoc.bookingCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(previewDoc.bookingCode!, previewDoc.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === previewDoc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy mã</span>
                    </button>
                  </div>
                )}

                {previewDoc.notes && (
                  <p className="text-xs text-slate-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                    📌 <strong>Ghi chú xuất trình:</strong> {previewDoc.notes}
                  </p>
                )}
              </div>

              {/* Display Big Image for Scanning */}
              <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 text-center space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Đưa màn hình này cho nhân viên quét mã QR hoặc đối soát
                </span>
                <div className="rounded-xl overflow-hidden bg-white p-2 inline-block max-w-full">
                  <img
                    src={previewDoc.fileUrl}
                    alt="Ticket QR Code"
                    className="max-h-[380px] w-auto mx-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <a
                href={previewDoc.fileUrl}
                download={`Ve-Booking-${previewDoc.id}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải ảnh về điện thoại</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-6 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold text-xs cursor-pointer shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
