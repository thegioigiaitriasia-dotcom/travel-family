import React, { useState, useEffect } from 'react';
import { MultiCityTripPlannerInput, UserAuthSession } from '../types';
import { PlannerIntro } from './planner/PlannerIntro';
import { PlannerProgress } from './planner/PlannerProgress';
import { TripWindowStep } from './planner/TripWindowStep';
import { MultiStopRouteBuilder } from './planner/MultiStopRouteBuilder';
import { JourneyLegEditor } from './planner/JourneyLegEditor';
import { TravelerAndNeedsStep } from './planner/TravelerAndNeedsStep';
import { PreferencesAndBudgetStep } from './planner/PreferencesAndBudgetStep';
import { RouteTimelineReview } from './planner/RouteTimelineReview';
import { GeneratingPlanState } from './planner/GeneratingPlanState';
import { GenerationSuccessState } from './planner/GenerationSuccessState';
import { GenerationErrorState } from './planner/GenerationErrorState';
import { Sparkles } from 'lucide-react';

interface AIPlannerModuleProps {
  onGenerateSuccess: (destination: string, days: number) => void;
  onNavigateHome?: () => void;
  session: UserAuthSession;
  onShowPaywall: () => void;
}

const defaultMultiCityInput: MultiCityTripPlannerInput = {
  tripWindow: {
    startDate: '2026-08-08',
    startTime: '07:00',
    startTimeStatus: 'confirmed',
    endDate: '2026-08-11',
    endTime: '18:00',
    endTimeStatus: 'confirmed',
  },
  routeStops: [
    {
      id: 'stop-origin',
      order: 1,
      type: 'origin',
      name: 'TP. Hồ Chí Minh',
      departureDate: '2026-08-08',
      departureTime: '07:00',
    },
    {
      id: 'stop-1',
      order: 2,
      type: 'stay',
      name: 'Buôn Ma Thuột',
      arrivalDate: '2026-08-08',
      arrivalTime: '08:20',
      departureDate: '2026-08-09',
      departureTime: '12:30',
      nights: 1,
      purposes: ['Khám phá văn hóa', 'Ẩm thực Tây Nguyên'],
    },
    {
      id: 'stop-2',
      order: 3,
      type: 'stay',
      name: 'Cam Ranh',
      arrivalDate: '2026-08-09',
      arrivalTime: '18:00',
      departureDate: '2026-08-11',
      departureTime: '15:30',
      nights: 2,
      purposes: ['Tắm biển', 'Nghỉ dưỡng resort'],
    },
    {
      id: 'stop-destination',
      order: 4,
      type: 'destination',
      name: 'TP. Hồ Chí Minh',
      arrivalDate: '2026-08-11',
      arrivalTime: '16:40',
    },
  ],
  journeyLegs: [
    {
      id: 'leg-1',
      fromStopId: 'stop-origin',
      toStopId: 'stop-1',
      transportMode: 'flight',
      bookingStatus: 'confirmed',
      departure: {
        date: '2026-08-08',
        time: '07:00',
        timeStatus: 'confirmed',
        stationOrTerminal: 'Sân bay Tân Sơn Nhất (SGN)',
      },
      arrival: {
        date: '2026-08-08',
        time: '08:20',
        timeStatus: 'confirmed',
        stationOrTerminal: 'Sân bay Buôn Ma Thuột (BMV)',
      },
      providerName: 'VN1412',
      bufferMinutes: 90,
    },
    {
      id: 'leg-2',
      fromStopId: 'stop-1',
      toStopId: 'stop-2',
      transportMode: 'limousine',
      bookingStatus: 'not_booked',
      departure: {
        date: '2026-08-09',
        time: '12:30',
        timeStatus: 'preferred',
      },
      arrival: {
        date: '2026-08-09',
        time: '18:00',
        timeStatus: 'estimated',
      },
      preferredWindow: 'Chuyến từ 12:00–13:30',
      maxTravelHours: 6,
      bufferMinutes: 20,
    },
    {
      id: 'leg-3',
      fromStopId: 'stop-2',
      toStopId: 'stop-destination',
      transportMode: 'flight',
      bookingStatus: 'confirmed',
      departure: {
        date: '2026-08-11',
        time: '15:30',
        timeStatus: 'confirmed',
        stationOrTerminal: 'Sân bay Cam Ranh (CXR)',
      },
      arrival: {
        date: '2026-08-11',
        time: '16:40',
        timeStatus: 'confirmed',
        stationOrTerminal: 'Sân bay Tân Sơn Nhất (SGN)',
      },
      providerName: 'VJ602',
      bufferMinutes: 90,
    },
  ],
  accommodations: [
    {
      stopId: 'stop-1',
      status: 'booked',
      name: 'Mường Thanh Luxury Buôn Ma Thuột',
      address: 'Trung tâm Buôn Ma Thuột',
      checkInDate: '2026-08-08',
      checkInTime: '14:00',
      checkOutDate: '2026-08-09',
      checkOutTime: '12:00',
      luggageDropAvailable: true,
    },
    {
      stopId: 'stop-2',
      status: 'booked',
      name: 'The Arena Cam Ranh Resort',
      address: 'Bãi Dài, Cam Ranh',
      checkInDate: '2026-08-09',
      checkInTime: '14:00',
      checkOutDate: '2026-08-11',
      checkOutTime: '12:00',
      luggageDropAvailable: true,
    },
  ],
  travelers: {
    adults: 2,
    children: [{ age: 8 }, { age: 14 }],
    seniors: 0,
  },
  mobilityAndComfortNeeds: ['Có người dễ say xe', 'Cần ăn đúng giờ'],
  specialNote: 'Muốn ghé quán cà phê ngon ở Buôn Ma Thuột',
  travelStyles: ['Gia đình & Trẻ em', 'Ẩm thực & Đặc sản', 'Nghỉ dưỡng & Relax'],
  pace: 'balanced',
  avoidPreferences: ['Không dậy quá sớm (trước 7:00)'],
  foodPreferences: ['Đặc sản nổi tiếng địa phương', 'Hải sản tươi sống'],
  budget: {
    total: 20000000,
    currency: 'VND',
    alreadyPaid: {
      transport: 6500000,
      accommodation: 5000000,
      other: 0,
    },
    includedItems: [
      'Ăn uống',
      'Vé tham quan & vui chơi',
      'Di chuyển nội thành',
    ],
  },
};

export const AIPlannerModule: React.FC<AIPlannerModuleProps> = ({
  onGenerateSuccess,
  onNavigateHome,
  session,
  onShowPaywall,
}) => {
  const [plannerState, setPlannerState] = useState<
    'intro' | 'wizard' | 'generating' | 'success' | 'error'
  >('intro');

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<MultiCityTripPlannerInput>(
    defaultMultiCityInput
  );
  const [errorType, setErrorType] = useState<
    'connection' | 'missing_info' | 'limited_destination'
  >('connection');
  const [saveDraftNotification, setSaveDraftNotification] = useState<string | null>(
    null
  );

  // Auto load draft from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('family_multicity_planner_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleUpdateFormData = (updated: Partial<MultiCityTripPlannerInput>) => {
    const nextData = { ...formData, ...updated };
    setFormData(nextData);
    try {
      localStorage.setItem(
        'family_multicity_planner_draft',
        JSON.stringify(nextData)
      );
    } catch {
      // ignore
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        'family_multicity_planner_draft',
        JSON.stringify(formData)
      );
      setSaveDraftNotification('Đã lưu bản nháp đa chặng thành công!');
      setTimeout(() => setSaveDraftNotification(null), 3000);
    } catch {
      // ignore
    }
  };

  const handleStartAI = () => {
    setPlannerState('wizard');
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (
        session.isDemoMode ||
        !session.subscription ||
        (session.subscription.status !== 'active' && session.subscription.status !== 'trial')
      ) {
        onShowPaywall();
      } else {
        setPlannerState('generating');
      }
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPlannerState('intro');
    }
  };

  const handleGenerationFinish = () => {
    setPlannerState('success');
  };

  const handleViewItinerary = () => {
    const routeTitle =
      formData.routeStops.map((s) => s.name).join(' → ') ||
      'TP.HCM → Buôn Ma Thuột → Cam Ranh → TP.HCM';
    const totalDays = 4;
    onGenerateSuccess(routeTitle, totalDays);
  };

  const handleRegenerate = () => {
    setPlannerState('generating');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-2 px-4 sm:px-6">
      {/* Toast Notification for Draft Save */}
      {saveDraftNotification && (
        <div className="fixed top-20 right-4 z-50 bg-[#2E8B57] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{saveDraftNotification}</span>
        </div>
      )}

      {/* Mode 1: INTRO */}
      {plannerState === 'intro' && (
        <PlannerIntro onStartAI={handleStartAI} />
      )}

      {/* Mode 2: WIZARD FORM (6 Steps) */}
      {plannerState === 'wizard' && (
        <div className="space-y-6">
          <PlannerProgress
            currentStep={currentStep}
            totalSteps={6}
            onSelectStep={(step) => setCurrentStep(step)}
          />

          {/* Step 1: Khung thời gian chuyến đi */}
          {currentStep === 1 && (
            <TripWindowStep
              data={formData}
              onUpdate={handleUpdateFormData}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* Step 2: Tuyến hành trình (Multi-Stop Route Builder) */}
          {currentStep === 2 && (
            <MultiStopRouteBuilder
              data={formData}
              onUpdate={handleUpdateFormData}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* Step 3: Phương tiện & thời gian từng chặng */}
          {currentStep === 3 && (
            <JourneyLegEditor
              data={formData}
              onUpdate={handleUpdateFormData}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* Step 4: Thành viên & nhu cầu gia đình */}
          {currentStep === 4 && (
            <TravelerAndNeedsStep
              data={formData}
              onUpdate={handleUpdateFormData}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* Step 5: Trải nghiệm, Lưu trú theo điểm dừng & Tách Ngân sách */}
          {currentStep === 5 && (
            <PreferencesAndBudgetStep
              data={formData}
              onUpdate={handleUpdateFormData}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {/* Step 6: Kiểm tra toàn tuyến, Validation & Lập kế hoạch */}
          {currentStep === 6 && (
            <RouteTimelineReview
              data={formData}
              onGoToStep={(s) => setCurrentStep(s)}
              onConfirmGenerate={() => setPlannerState('generating')}
              onSaveDraft={handleSaveDraft}
            />
          )}
        </div>
      )}

      {/* Mode 3: GENERATING */}
      {plannerState === 'generating' && (
        <GeneratingPlanState
          formData={formData}
          onComplete={handleGenerationFinish}
        />
      )}

      {/* Mode 4: SUCCESS */}
      {plannerState === 'success' && (
        <GenerationSuccessState
          onViewItinerary={handleViewItinerary}
          onEditPreferences={() => {
            setPlannerState('wizard');
            setCurrentStep(6);
          }}
          onRegenerate={handleRegenerate}
        />
      )}

      {/* Mode 5: ERROR */}
      {plannerState === 'error' && (
        <GenerationErrorState
          errorType={errorType}
          onRetry={() => setPlannerState('generating')}
          onReturnHome={() =>
            onNavigateHome ? onNavigateHome() : setPlannerState('intro')
          }
          onGoToMissingStep={() => {
            setPlannerState('wizard');
            setCurrentStep(1);
          }}
          onChangeDestination={() => {
            setPlannerState('wizard');
            setCurrentStep(2);
          }}
          onContinueBasic={handleGenerationFinish}
        />
      )}
    </div>
  );
};
