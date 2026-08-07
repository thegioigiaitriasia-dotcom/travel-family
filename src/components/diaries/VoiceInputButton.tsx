import React, { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { VoiceRecorderModal } from './VoiceRecorderModal';

interface VoiceInputButtonProps {
  onTranscribed: (text: string, mode: 'append' | 'replace') => void;
  currentText?: string;
  targetFieldTitle?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscribed,
  currentText = '',
  targetFieldTitle = 'Cảm nghĩ nhật ký',
  variant = 'secondary',
  size = 'md',
  className = '',
  label = 'Ghi âm cảm nghĩ',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#183B35] hover:bg-[#28584E] text-white shadow-sm border border-transparent';
      case 'outline':
        return 'bg-white hover:bg-[#E9F0ED] text-[#183B35] border border-[#183B35]/20 shadow-sm';
      case 'ghost':
        return 'bg-transparent hover:bg-[#E9F0ED] text-[#183B35] hover:text-[#28584E] border border-transparent';
      case 'icon-only':
        return 'p-2 bg-[#E9F0ED] hover:bg-[#183B35]/20 text-[#183B35] rounded-xl border border-[#183B35]/20 transition-colors';
      case 'secondary':
      default:
        return 'bg-[#E9F0ED] hover:bg-[#183B35]/20 text-[#183B35] border border-[#183B35]/20 shadow-sm';
    }
  };

  const getSizeClasses = () => {
    if (variant === 'icon-only') return '';
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1 text-[11px] rounded-lg gap-1';
      case 'lg':
        return 'px-4 py-2.5 text-xs font-bold rounded-2xl gap-2';
      case 'md':
      default:
        return 'px-3 py-1.5 text-xs font-semibold rounded-xl gap-1.5';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center justify-center font-semibold transition-all cursor-pointer active:scale-95 ${getVariantClasses()} ${getSizeClasses()} ${className}`}
        title="Ghi âm giọng nói và chuyển thành văn bản"
      >
        <Mic className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} strokeWidth={2} />
        {variant !== 'icon-only' && <span>{label}</span>}
      </button>

      <VoiceRecorderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyText={onTranscribed}
        currentText={currentText}
        targetFieldTitle={targetFieldTitle}
      />
    </>
  );
};
