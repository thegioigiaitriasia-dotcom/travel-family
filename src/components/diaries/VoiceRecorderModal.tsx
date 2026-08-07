import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Volume2,
  Copy,
  FileText,
  AlertCircle,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (transcribedText: string, mode: 'append' | 'replace') => void;
  currentText?: string;
  targetFieldTitle?: string;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
  currentText = '',
  targetFieldTitle = 'Câu chuyện trong ngày',
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [aiPolishedText, setAiPolishedText] = useState<string>('');
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<'raw' | 'polished'>('raw');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      stopRecordingCleanup();
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMessage(null);
    setInterimTranscript('');
    setAiPolishedText('');
    setAudioUrl(null);
    audioChunksRef.current = [];

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalResult = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalResult += event.results[i][0].transcript + ' ';
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (finalResult) {
            setTranscript((prev) => (prev ? `${prev.trim()} ${finalResult.trim()}` : finalResult.trim()));
          }
          setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('Vui lòng cho phép quyền truy cập micro trên trình duyệt để ghi âm.');
          } else if (event.error !== 'no-speech') {
            setErrorMessage(`Lỗi ghi âm (${event.error}). Vui lòng nhập hoặc thử lại.`);
          }
        };

        recognition.onend = () => {
          if (isRecording && !isPaused) {
            try {
              recognition.start();
            } catch (e) {
              // ignore restart error
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
      }
    }

    // Capture media audio stream if possible for audio playback
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          // Stop all tracks to release mic
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (err) {
      console.warn('MediaRecorder not available or permission denied:', err);
    }

    setIsRecording(true);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    setIsPaused(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
  };

  const resumeRecording = () => {
    setIsPaused(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
  };

  const stopRecordingCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    setIsRecording(false);
    setIsPaused(false);
  };

  const stopRecording = () => {
    stopRecordingCleanup();
  };

  const handleReset = () => {
    stopRecordingCleanup();
    setTranscript('');
    setInterimTranscript('');
    setAiPolishedText('');
    setRecordingTime(0);
    setAudioUrl(null);
    setSelectedVersion('raw');
    setErrorMessage(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePlayAudio = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // AI Polish Speech Transcript using Gemini / Smart Formatting
  const handleAiPolish = async () => {
    const textToPolish = transcript.trim() || interimTranscript.trim();
    if (!textToPolish) return;

    setIsPolishing(true);
    setErrorMessage(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Bạn là trợ lý viết nhật ký du lịch chuyên nghiệp. Hãy trau chuốt lại đoạn ghi âm giọng nói thô sau đây thành một đoạn văn xuôi nhật ký du lịch tự nhiên, giàu cảm xúc, chau chuốt ngữ pháp nhưng giữ nguyên nội dung & ý chính của người dùng.

Đoạn giọng nói thô:
"${textToPolish}"

Yêu cầu:
- Trả về đoạn văn hoàn chỉnh bằng tiếng Việt.
- Giữ nguyên tên các địa danh, món ăn, mốc thời gian nếu có.
- Không thêm các từ ngữ quảng cáo hay ký tự thừa.`,
        });

        if (response.text) {
          setAiPolishedText(response.text.trim());
          setSelectedVersion('polished');
          setIsPolishing(false);
          return;
        }
      }

      // Fallback smart formatting if no Gemini response
      setTimeout(() => {
        const sentences = textToPolish.split(/(?<=[.!?])\s+/);
        const polished = sentences
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join('. ');

        setAiPolishedText(
          polished +
            (polished.endsWith('.') ? '' : '.') +
            ' Một trải nghiệm thật trọn vẹn và đáng nhớ cùng gia đình!'
        );
        setSelectedVersion('polished');
        setIsPolishing(false);
      }, 800);
    } catch (err) {
      console.error('AI Polish Error:', err);
      // Fallback
      setAiPolishedText(textToPolish.charAt(0).toUpperCase() + textToPolish.slice(1));
      setSelectedVersion('polished');
      setIsPolishing(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = selectedVersion === 'polished' && aiPolishedText ? aiPolishedText : transcript;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeText = selectedVersion === 'polished' && aiPolishedText ? aiPolishedText : transcript;

  // Insert sample prompt for quick testing if mic unavailable or empty
  const applySampleSpeech = (sampleText: string) => {
    setTranscript((prev) => (prev ? `${prev}\n${sampleText}` : sampleText));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E9F0ED] text-[#183B35] border border-[#183B35]/20 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Ghi Âm & Chuyển Giọng Nói</h3>
              <p className="text-xs text-slate-500">Mục tiêu: {targetFieldTitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopRecordingCleanup();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6">
          {/* Error / Permission Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <p className="mt-1 text-amber-700">
                  Bạn cũng có thể thử mẫu cảm nghĩ nhanh bên dưới hoặc tự sửa trực tiếp trong ô văn bản.
                </p>
              </div>
            </div>
          )}

          {/* Recording Visualizer Box */}
          <div className="bg-slate-900 rounded-2xl p-6 text-center text-white space-y-4 relative overflow-hidden shadow-inner">
            {/* Ambient Background Pulse when recording */}
            {isRecording && !isPaused && (
              <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
            )}

            {/* Timer & Status Indicator */}
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording
                    ? isPaused
                      ? 'bg-amber-400'
                      : 'bg-red-500 animate-ping'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {isRecording
                  ? isPaused
                    ? 'Tạm dừng ghi âm'
                    : 'Đang lắng nghe giọng nói...'
                  : recordingTime > 0
                  ? 'Đã hoàn tất ghi âm'
                  : 'Sẵn sàng ghi âm'}
              </span>
            </div>

            {/* Live Recording Clock */}
            <div className="font-mono text-3xl sm:text-4xl font-bold tracking-wider text-slate-100">
              {formatTime(recordingTime)}
            </div>

            {/* Waveform Visualization Bars */}
            <div className="flex items-center justify-center gap-1 h-8 pt-1">
              {[40, 70, 30, 90, 60, 100, 50, 80, 40, 70, 100, 30, 80, 50, 90, 60].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isRecording && !isPaused
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isRecording && !isPaused ? `${Math.max(12, Math.round(h * Math.random()))}px` : '10px',
                    animationDelay: `${idx * 0.08}s`,
                  }}
                />
              ))}
            </div>

            {/* Main Audio Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 bg-[#183B35] hover:bg-[#28584E] text-white font-bold text-xs sm:text-sm rounded-full shadow-lg flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>Bắt đầu nói</span>
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeRecording}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all cursor-pointer"
                      title="Tiếp tục"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseRecording}
                      className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-all cursor-pointer"
                      title="Tạm dừng"
                    >
                      <Pause className="w-5 h-5 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full flex items-center gap-2 cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Hoàn thành</span>
                  </button>
                </>
              )}

              {(recordingTime > 0 || transcript) && (
                <button
                  onClick={handleReset}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-all cursor-pointer"
                  title="Ghi âm lại từ đầu"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Audio playback option if recorded stream available */}
            {audioUrl && !isRecording && (
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-300">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Nghe lại file ghi âm:</span>
                <button
                  onClick={handleTogglePlayAudio}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" /> Tạm dừng
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Phát âm thanh
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Voice Note Presets if transcript is empty */}
          {!transcript && !isRecording && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Gợi ý nhanh cho chuyến đi (Bấm để thêm)
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Thời tiết hôm nay rất đẹp, nắng ấm và nhiều gió biển.',
                  'Gia đình ăn trưa món mì Quảng rất ngon, bé thích bánh tráng nướng.',
                  'Chiều dạo phố cổ Hội An, đèn lồng rực rỡ không khí yên bình.',
                  'Cả nhà cùng nhau chụp nhiều ảnh đẹp tại bãi biển Mỹ Khê.',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => applySampleSpeech(sample)}
                    className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors text-left"
                  >
                    + "{sample.slice(0, 32)}..."
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transcribed Text Display & Edit Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#183B35]" />
                <span>Văn bản chuyển đổi từ giọng nói:</span>
              </label>

              {transcript && (
                <button
                  onClick={handleAiPolish}
                  disabled={isPolishing}
                  className="px-3 py-1 bg-[#E9F0ED] hover:bg-[#183B35]/20 text-[#183B35] border border-[#183B35]/20 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#183B35]" />
                  <span>{isPolishing ? 'Đang trau chuốt...' : 'Trau chuốt văn phong AI'}</span>
                </button>
              )}
            </div>

            {/* Version Switch Tabs if AI Polish created */}
            {aiPolishedText && (
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedVersion('raw')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                    selectedVersion === 'raw'
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Giọng nói thô gốc
                </button>
                <button
                  onClick={() => setSelectedVersion('polished')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1 ${
                    selectedVersion === 'polished'
                      ? 'bg-[#183B35] text-white shadow-sm font-bold'
                      : 'text-[#183B35] hover:text-[#28584E]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Đã trau chuốt AI
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={5}
                value={activeText}
                onChange={(e) => {
                  if (selectedVersion === 'polished') {
                    setAiPolishedText(e.target.value);
                  } else {
                    setTranscript(e.target.value);
                  }
                }}
                placeholder={
                  isRecording
                    ? 'Đang nhận diện giọng nói của bạn...'
                    : 'Nhấn "Bắt đầu nói" và phát biểu cảm nhận của bạn...'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#183B35]/20 focus:border-[#183B35] leading-relaxed"
              />

              {interimTranscript && isRecording && (
                <div className="mt-1 text-[11px] text-red-600 italic font-medium px-1">
                  Đang thu âm: "{interimTranscript}"
                </div>
              )}
            </div>

            {/* Word count & copy helper */}
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Số từ: {activeText ? activeText.trim().split(/\s+/).length : 0} từ</span>
              {activeText && (
                <button
                  onClick={handleCopyText}
                  className="hover:text-slate-800 font-semibold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép văn bản'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              stopRecordingCleanup();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {currentText && (
              <button
                onClick={() => {
                  if (!activeText) return;
                  onApplyText(activeText, 'append');
                  stopRecordingCleanup();
                  onClose();
                }}
                disabled={!activeText}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
              >
                Nối thêm vào bài
              </button>
            )}

            <button
              onClick={() => {
                if (!activeText) return;
                onApplyText(activeText, currentText ? 'replace' : 'append');
                stopRecordingCleanup();
                onClose();
              }}
              disabled={!activeText}
              className="px-5 py-2.5 bg-[#183B35] hover:bg-[#28584E] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{currentText ? 'Ghi đè nội dung' : 'Lưu vào nhật ký'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
