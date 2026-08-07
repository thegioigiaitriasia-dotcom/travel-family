import React, { useState } from 'react';
import { TravelDiary, DiaryDay, DiaryPhoto } from '../../types';
import { X, Save, Image as ImageIcon, Calendar, FileText, Lock, Globe, Sparkles, Check, Trash2, Plus, Star, Upload, Mic } from 'lucide-react';
import { VoiceInputButton } from './VoiceInputButton';

interface DiaryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  diary: TravelDiary;
  onSaveDiary: (updated: TravelDiary) => void;
}

export const DiaryEditor: React.FC<DiaryEditorProps> = ({
  isOpen,
  onClose,
  diary,
  onSaveDiary,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'days' | 'photos' | 'privacy'>('general');
  const [editedDiary, setEditedDiary] = useState<TravelDiary>(diary);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Vừa xong');
  const [newPhotoCaption, setNewPhotoCaption] = useState<string>('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');

  if (!isOpen) return null;

  const currentDay = editedDiary.days.find((d) => d.dayNumber === selectedDayNumber) || editedDiary.days[0];

  const handleGeneralChange = (field: keyof TravelDiary, value: any) => {
    const updated = { ...editedDiary, [field]: value };
    setEditedDiary(updated);
    setLastSavedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleDayStoryChange = (storyText: string) => {
    if (!currentDay) return;
    const updatedDays = editedDiary.days.map((d) =>
      d.dayNumber === currentDay.dayNumber ? { ...d, story: storyText, updatedAt: new Date().toISOString() } : d
    );
    const updated = { ...editedDiary, days: updatedDays };
    setEditedDiary(updated);
    setLastSavedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const newPhoto: DiaryPhoto = {
      id: `photo-${Date.now()}`,
      diaryId: editedDiary.id,
      dayId: currentDay?.id,
      fileUrl: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Kỷ niệm đẹp',
      uploadedAt: new Date().toISOString(),
      isCover: false,
      isHighlight: false,
      sortOrder: editedDiary.photos.length + 1,
    };
    const updatedPhotos = [...editedDiary.photos, newPhoto];
    const updated = { ...editedDiary, photos: updatedPhotos };
    setEditedDiary(updated);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhoto = (photoId: string) => {
    const updatedPhotos = editedDiary.photos.filter((p) => p.id !== photoId);
    setEditedDiary({ ...editedDiary, photos: updatedPhotos });
  };

  const handleSetCover = (photoUrl: string) => {
    setEditedDiary({ ...editedDiary, coverImage: photoUrl });
  };

  const handleSave = () => {
    onSaveDiary(editedDiary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full sm:w-[620px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-base">Chỉnh sửa Nhật ký</h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Tự động lưu {lastSavedTime}
              </span>
            </div>
            <p className="text-xs text-slate-500">{editedDiary.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-white border-b border-slate-100 flex gap-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'general', label: 'Thông tin chung', icon: FileText },
            { id: 'days', label: 'Nội dung các ngày', icon: Calendar },
            { id: 'photos', label: 'Quản lý kho ảnh', icon: ImageIcon },
            { id: 'privacy', label: 'Quyền riêng tư', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#183B35] text-[#183B35] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Tên nhật ký</label>
                <input
                  type="text"
                  value={editedDiary.title}
                  onChange={(e) => handleGeneralChange('title', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Lời mở đầu chuyến đi</label>
                  <VoiceInputButton
                    targetFieldTitle="Lời mở đầu chuyến đi"
                    currentText={editedDiary.introduction || ''}
                    onTranscribed={(text, mode) => {
                      const prev = editedDiary.introduction || '';
                      handleGeneralChange('introduction', mode === 'append' && prev ? `${prev}\n${text}` : text);
                    }}
                    variant="secondary"
                    size="sm"
                    label="Nói lời mở đầu"
                  />
                </div>
                <textarea
                  rows={4}
                  value={editedDiary.introduction || ''}
                  onChange={(e) => handleGeneralChange('introduction', e.target.value)}
                  placeholder="Viết lời cảm nhận mở đầu của gia đình hoặc ghi âm bằng giọng nói..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35] leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Trạng thái nhật ký</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'draft', label: 'Bản nháp' },
                    { id: 'in_progress', label: 'Đang viết' },
                    { id: 'completed', label: 'Đã hoàn thành' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleGeneralChange('status', st.id)}
                      className={`py-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                        editedDiary.status === st.id
                          ? 'bg-[#183B35] text-white border-[#183B35] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Ảnh bìa nhật ký</label>
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {editedDiary.coverImage ? (
                    <img
                      src={editedDiary.coverImage}
                      alt="Cover preview"
                      className="w-full sm:w-28 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-28 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0">
                      Chưa có ảnh
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-[#183B35] hover:bg-[#28584E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ thiết bị</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  handleGeneralChange('coverImage', ev.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">hoặc dán URL</span>
                    </div>

                    <input
                      type="text"
                      value={editedDiary.coverImage || ''}
                      onChange={(e) => handleGeneralChange('coverImage', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#183B35]/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'days' && (
            <div className="space-y-5 text-xs">
              {/* Day selection */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {editedDiary.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setSelectedDayNumber(day.dayNumber)}
                    className={`px-3 py-2 rounded-xl font-bold border transition-all shrink-0 cursor-pointer ${
                      selectedDayNumber === day.dayNumber
                        ? 'bg-[#183B35] text-white border-[#183B35] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Ngày {day.dayNumber}
                  </button>
                ))}
              </div>

              {currentDay && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900">
                      Ngày {currentDay.dayNumber} – {currentDay.date}
                    </span>
                    <span className="text-slate-500">{currentDay.title}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">
                        Câu chuyện trong ngày ({currentDay.story?.length || 0}/5000 ký tự)
                      </label>
                      <VoiceInputButton
                        targetFieldTitle={`Câu chuyện Ngày ${currentDay.dayNumber}`}
                        currentText={currentDay.story || ''}
                        onTranscribed={(text, mode) => {
                          const prev = currentDay.story || '';
                          handleDayStoryChange(mode === 'append' && prev ? `${prev}\n${text}` : text);
                        }}
                        variant="secondary"
                        size="sm"
                        label="Ghi âm cảm nghĩ"
                      />
                    </div>
                    <textarea
                      rows={6}
                      value={currentDay.story || ''}
                      onChange={(e) => handleDayStoryChange(e.target.value)}
                      placeholder="Kể lại chi tiết những điều thực tế đã xảy ra hoặc nhấn 'Ghi âm cảm nghĩ' để nói..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35] leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-5 text-xs">
              {/* Add Photo Input */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#183B35]" />
                    <span>Thêm ảnh mới vào kho nhật ký</span>
                  </span>

                  <label className="px-3 py-1.5 rounded-xl bg-[#183B35] hover:bg-[#28584E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn ảnh từ thiết bị</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const fileList = e.target.files;
                        if (!fileList) return;
                        const files = Array.from(fileList);
                        files.forEach((file: File, index: number) => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              const newPhoto: DiaryPhoto = {
                                id: `photo-${Date.now()}-${index}`,
                                diaryId: editedDiary.id,
                                fileUrl: ev.target.result as string,
                                caption: file.name.replace(/\.[^/.]+$/, '') || 'Kỷ niệm đẹp',
                                uploadedAt: new Date().toISOString(),
                                isCover: false,
                                isHighlight: false,
                                sortOrder: editedDiary.photos.length + index + 1,
                              };
                              setEditedDiary((prev) => ({
                                ...prev,
                                photos: [...prev.photos, newPhoto],
                              }));
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                      className="hidden"
                    />
                  </label>
                </h4>

                <div className="pt-1 space-y-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500">Hoặc thêm ảnh bằng URL liên kết:</span>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="Dán URL hình ảnh (ví dụ: https://...)"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="Chú thích ảnh ngắn..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs"
                    />
                    <button
                      onClick={handleAddPhoto}
                      disabled={!newPhotoUrl.trim()}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer"
                    >
                      Thêm qua URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Photos List */}
              <div className="grid grid-cols-2 gap-3">
                {editedDiary.photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img src={photo.fileUrl} alt={photo.caption} className="w-full h-32 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2 text-white">
                      <p className="text-[11px] truncate font-medium">{photo.caption}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleSetCover(photo.fileUrl)}
                        title="Đặt làm ảnh bìa"
                        className="p-1 bg-black/60 hover:bg-[#183B35] text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        title="Xóa ảnh"
                        className="p-1 bg-black/60 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900">Cấu hình riêng tư mặc định</h4>
                <p className="text-slate-500 text-[11px]">
                  Mọi nhật ký du lịch gia đình đều mặc định ở chế độ Riêng tư chỉ mình bạn truy cập được.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#183B35] hover:bg-[#28584E] rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
