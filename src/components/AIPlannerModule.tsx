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

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const threeDaysLater = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];

const defaultMultiCityInput: MultiCityTripPlannerInput = {
  tripWindow: {
    startDate: todayStr,
    startTime: '07:00',
    startTimeStatus: 'confirmed',
    endDate: threeDaysLater,
    endTime: '18:00',
    endTimeStatus: 'confirmed',
  },
  routeStops: [],
  journeyLegs: [],
  accommodations: [],
  travelers: {
    adults: 2,
    children: [],
    seniors: 0,
  },
  mobilityAndComfortNeeds: [],
  specialNote: '',
  travelStyles: [],
  pace: 'balanced',
  avoidPreferences: [],
  foodPreferences: [],
  budget: {
    total: 0,
    currency: 'VND',
    alreadyPaid: {
      transport: 0,
      accommodation: 0,
      other: 0,
    },
    includedItems: [],
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
      'Chuyến đi gia đình';
    
    // Tính số ngày thật từ tripWindow
    let totalDays = 4;
    if (formData.tripWindow?.startDate && formData.tripWindow?.endDate) {
      const start = new Date(formData.tripWindow.startDate);
      const end = new Date(formData.tripWindow.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      if (!isNaN(diffDays) && diffDays > 0) {
        totalDays = diffDays;
      }
    }

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
