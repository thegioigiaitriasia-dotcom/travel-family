import React, { useState } from 'react';
import { Sparkles, CheckCircle2, QrCode } from 'lucide-react';
import { SubscriptionPlan } from '../../types';

interface SubscriptionPricingProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  currentPlan?: SubscriptionPlan;
  userId?: string;
}

export const SubscriptionPricing: React.FC<SubscriptionPricingProps> = ({
  onSelectPlan,
  currentPlan = 'free',
  userId = 'UNKNOWN',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [showQR, setShowQR] = useState(false);

  // Values for SePay / VietQR as per plan
  const SEPAY_BANK = import.meta.env.VITE_SEPAY_BANK || 'TPB';
  const SEPAY_ACCOUNT = import.meta.env.VITE_SEPAY_ACCOUNT || '00003554020';

  const plans = [
    {
      id: 'quarterly',
      name: 'Gói 3 Tháng',
      price: '50.000đ',
      rawPrice: 50000,
      period: '/ 3 tháng',
      description: 'Phù hợp cho một chuyến đi ngắn.',
      features: [
        'Dùng thử 30 ngày miễn phí',
        'Lên lịch trình AI không giới hạn',
        'Quản lý chi phí & ngân sách',
        'Nhật ký du lịch thông minh',
        'Lưu trữ địa điểm cá nhân',
      ],
      recommended: false,
    },
    {
      id: 'yearly',
      name: 'Gói Năm (Tiết kiệm)',
      price: '199.000đ',
      rawPrice: 199000,
      period: '/ năm',
      description: 'Lựa chọn tốt nhất cho gia đình đam mê du lịch.',
      features: [
        'Dùng thử 30 ngày miễn phí',
        'Tất cả tính năng của Gói 3 Tháng',
        'Ưu tiên hỗ trợ từ đội ngũ',
        'Dữ liệu đồng bộ realtime',
      ],
      recommended: true,
    },
  ];

  const handleSubscribe = () => {
    setShowQR(true);
  };

  if (showQR) {
    const planDetail = plans.find((p) => p.id === selectedPlan);
    const amount = planDetail?.rawPrice || 0;
    // SePay QR format: syntax depends on setup, standard VietQR syntax:
    // https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=CONTENT
    // Order info mapped to UID for webhook processing
    const orderCode = `GDVV${userId.substring(0, 6).toUpperCase()}`;
    const qrUrl = `https://qr.sepay.vn/img?acc=${SEPAY_ACCOUNT}&bank=${SEPAY_BANK}&amount=${amount}&des=${orderCode}`;

    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-md mx-auto space-y-6">
        <h3 className="text-2xl font-bold text-slate-800">Thanh toán Nâng cấp</h3>
        <p className="text-sm text-slate-500">
          Vui lòng dùng ứng dụng ngân hàng quét mã QR bên dưới để thanh toán. Hệ thống sẽ tự động xác nhận trong 1-3 phút.
        </p>
        
        <div className="bg-sand-50 p-4 rounded-2xl flex justify-center border border-slate-200">
          <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain rounded-xl shadow-sm" />
        </div>

        <div className="space-y-2 text-sm text-slate-600 bg-bronze-50 text-bronze-900 p-4 rounded-xl text-left border border-bronze-200">
          <p><strong>Số tiền:</strong> <span className="font-bold text-rose-600">{planDetail?.price}</span></p>
          <p><strong>Nội dung:</strong> <span className="font-mono bg-white px-2 py-1 rounded border border-bronze-300 font-bold">{orderCode}</span></p>
          <p className="text-xs mt-2 italic text-bronze-700">* Nội dung chuyển khoản phải ghi chính xác mã trên để tự động kích hoạt.</p>
        </div>

        <button 
          onClick={() => {
            setShowQR(false);
            onSelectPlan(selectedPlan); // optimistically update or close
          }}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          Nâng cấp trải nghiệm <span className="text-[#2E8B57]">Vi Vu</span>
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Mở khóa Trợ lý AI và tất cả tính năng quản lý chuyến đi mạnh mẽ nhất để gia đình bạn luôn có những kỳ nghỉ trọn vẹn.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id as SubscriptionPlan)}
            className={`relative rounded-3xl p-6 border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id 
                ? 'border-[#2E8B57] bg-forest-50/30 shadow-xl shadow-emerald-900/5' 
                : 'border-slate-200 bg-white hover:border-forest-200 hover:bg-sand-50'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2E8B57] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> Khuyên dùng
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                <p className="text-sm text-slate-500 min-h-10">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                <span className="text-slate-500 font-medium">{plan.period}</span>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan.id as SubscriptionPlan);
                  handleSubscribe();
                }}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-[#2E8B57] text-white hover:bg-forest-700 shadow-md shadow-emerald-900/10'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {currentPlan === plan.id ? 'Đang sử dụng' : 'Nâng cấp ngay'}
              </button>

              <div className="pt-4 space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-[#2E8B57] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
