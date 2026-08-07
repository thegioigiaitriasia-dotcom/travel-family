export type ModuleType = 'my-trips' | 'ai-planner' | 'travel-book' | 'my-places' | 'travel-diary' | 'account' | 'admin-dashboard';

/**
 * Trạng thái gói thành viên của người dùng
 * - 'none'    : Chưa đăng ký gói nào
 * - 'trial'   : Đang trong thời gian dùng thử 30 ngày
 * - 'active'  : Đã thanh toán, gói đang hoạt động
 * - 'expired' : Gói đã hết hạn, cần gia hạn
 * - 'suspended': Tài khoản bị tạm khóa bởi admin
 */
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'suspended';

/**
 * Loại gói thành viên
 */
export type SubscriptionPlan = 'free' | 'quarterly' | 'yearly';

/**
 * Thông tin gói đăng ký của người dùng
 */
export interface UserSubscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trialEndsAt?: string;       // ISO date — thời điểm kết thúc dùng thử
  currentPeriodEnd?: string;  // ISO date — thời điểm hết hạn gói trả phí
  sepayTransactionId?: string; // Mã giao dịch SePay
}

export interface FamilyMember {
  id: string;
  name: string;
  username: string;
  role: 'Trưởng nhóm' | 'Thành viên' | 'Quản trị viên' | 'Super Admin';
  avatar: string;
  email?: string;
  joinedDate?: string;
  relationship?: string; // e.g., 'Vợ', 'Con gái', 'Bà nội'
  isAdmin?: boolean;    // True nếu là Super Admin / quản trị viên hệ thống
  status?: 'active' | 'suspended' | 'pending';
  lastActive?: string;
}

export interface FamilyAccount {
  id: string;
  familyName: string; // e.g. "Gia đình anh Phúc"
  ownerUsername: string;
  ownerName: string;
  avatar: string;
  inviteCode: string;
  createdAt: string;
  members: FamilyMember[];
}

export interface UserAuthSession {
  isLoggedIn: boolean;
  isDemoMode: boolean;
  currentUser: FamilyMember | null;
  familyAccount: FamilyAccount | null;
  /** True chỉ khi user có role Super Admin và được xác thực qua Supabase */
  isAdmin?: boolean;
  /** Thông tin gói thành viên — null nếu chưa đăng nhập hoặc demo mode */
  subscription?: UserSubscription | null;
}

export type TripStatus = 'planning' | 'upcoming' | 'ongoing' | 'completed';

export interface TripSummary {
  id: string;
  title: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  durationNights: number;
  memberCount: number;
  status: TripStatus;
  destinations: string[];
  placeCount: number;
  foodCount: number;
  accommodationCount: number;
  budgetMin?: number;
  budgetMax?: number;
  countdownDays?: number;
  /** Dữ liệu đầy đủ từ AI/Supabase, dùng để render TravelBook */
  fullData?: any;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  category: 'Ăn uống' | 'Tham quan' | 'Di chuyển' | 'Nghỉ ngơi' | 'Lưu ý';
  locationName: string;
  address?: string;
  notes?: string;
  estimatedCost?: number;
  imageUrl?: string;
}

export interface TripDay {
  id: string;
  tripId: string;
  dayNumber: number;
  dateStr: string;
  title: string;
  activities: Activity[];
}

export interface PlaceCategory {
  id: string;
  name: string;
  iconName: string;
  count: number;
}

export interface FavoritePlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  address: string;
  notes: string;
  imageUrl: string;
  coordinates?: { lat: number; lng: number };
}

export interface DiaryEntry {
  id: string;
  tripId: string;
  tripName: string;
  date: string;
  photos: string[];
  videoUrl?: string;
  totalSpent: number;
  rating: number;
  notes: string;
}

// Module 5 - Travel Diary (Nhật ký du lịch) Data Types
export type DiaryStatus = 'draft' | 'in_progress' | 'completed';
export type DiaryVisibility = 'private' | 'shared_link';

export interface DiaryShareSettings {
  showMemberNames: boolean;
  showExpenses: boolean;
  showPersonalNotes: boolean;
  allowPhotoDownload: boolean;
}

export interface DiaryPhoto {
  id: string;
  diaryId: string;
  dayId?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  placeId?: string;
  placeName?: string;
  takenAt?: string;
  uploadedAt: string;
  isCover: boolean;
  isHighlight: boolean;
  sortOrder: number;
}

export interface DiaryActivity {
  id: string;
  sourceActivityId?: string;
  title: string;
  placeId?: string;
  placeName?: string;
  plannedTime?: string;
  actualTime?: string;
  status: 'visited' | 'skipped' | 'changed' | 'added_during_trip';
  note?: string;
  actualCost?: number;
  photoIds: string[];
}

export interface DiaryFoodEntry {
  id: string;
  name: string;
  placeId?: string;
  placeName?: string;
  photoId?: string;
  personalRating?: number;
  note?: string;
}

export interface TripReflection {
  overallRating: number;
  bestThings?: string;
  inconveniences?: string;
  memorablePlaceIds: string[];
  favoriteFoodIds: string[];
  returnIntent: 'yes' | 'yes_with_changes' | 'unsure' | 'no';
  futureChanges: string[];
  futureNote?: string;
  recommendToFamily: 'yes' | 'yes_with_notes' | 'no';
}

export interface DiaryBudgetSummary {
  total: number;
  originalBudget?: number;
  categories: {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    other: number;
  };
}

export interface DiaryDay {
  id: string;
  diaryId: string;
  dayNumber: number;
  date: string;
  title: string;
  story?: string;
  mood?: {
    primary: 'very_happy' | 'happy' | 'neutral' | 'tired' | 'difficult';
    tags: string[];
  };
  memorableMoment?: {
    text: string;
    photoId?: string;
  };
  activities: DiaryActivity[];
  foodEntries: DiaryFoodEntry[];
  actualCost?: number;
  isCompleted: boolean;
  updatedAt: string;
}

export interface TravelDiary {
  id: string;
  tripId: string;
  title: string;
  introduction?: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  memberIds: string[];
  status: DiaryStatus;
  visibility: DiaryVisibility;
  shareSettings: DiaryShareSettings;
  days: DiaryDay[];
  photos: DiaryPhoto[];
  reflection?: TripReflection;
  actualBudget?: DiaryBudgetSummary;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DiariesFilterState {
  search: string;
  years: number[];
  destinations: string[];
  statuses: DiaryStatus[];
  hasPhotos?: boolean;
  visibility?: DiaryVisibility;
  sort: 'updated_desc' | 'trip_recent' | 'oldest' | 'photos_desc';
}

// My Places (Địa điểm yêu thích của tôi) Data Types
export type PlaceCategoryType =
  | 'food'
  | 'cafe'
  | 'sightseeing'
  | 'accommodation'
  | 'nature'
  | 'entertainment'
  | 'shopping'
  | 'spiritual'
  | 'transport'
  | 'other';

export type VisitStatus = 'want_to_visit' | 'visited' | 'favorite';

export interface SavedPlace {
  id: string;
  name: string;
  category: PlaceCategoryType;
  city?: string;
  province?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  images?: string[];
  visited: boolean;
  favorite: boolean;
  visitedAt?: string;
  personalNote?: string;
  personalRating?: number;
  priceLevel?: 'free' | 'budget' | 'moderate' | 'expensive' | 'unknown';
  suitabilityTags: string[];
  collectionIds: string[];
  sourceTripIds?: string[];
  sourceActivityIds?: string[];
  verificationStatus: 'verified' | 'needs_check' | 'unknown';
  createdAt: string;
  updatedAt: string;
}

export interface PlaceCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  placeCount: number;
  visibility: 'private' | 'shared_view';
  createdAt: string;
  updatedAt: string;
}

export interface PlaceTripUsage {
  tripId: string;
  tripTitle: string;
  dayNumber?: number;
  activityId?: string;
  usedAt?: string;
}

export interface PlacesFilterState {
  search: string;
  categories: PlaceCategoryType[];
  cities: string[];
  collectionIds: string[];
  visited?: boolean;
  favorite?: boolean;
  priceLevels: string[];
  sort: 'recent' | 'name_asc' | 'rating_desc' | 'visited_recent' | 'most_used';
}


// Module 2 - AI Trip Planner Data Types (Multi-City Multi-Leg Upgrade)
export type RouteStopType = 'origin' | 'stay' | 'transit' | 'destination';

export interface RouteStopInput {
  id: string;
  order: number;
  type: RouteStopType;
  name: string;
  province?: string;
  placeId?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  departureDate?: string;
  departureTime?: string;
  nights?: number;
  purposes?: string[];
  note?: string;
}

export type TransportMode =
  | 'flight'
  | 'train'
  | 'coach'
  | 'limousine'
  | 'private_car'
  | 'rental_with_driver'
  | 'ferry'
  | 'other'
  | 'unknown';

export interface JourneyLegInput {
  id: string;
  fromStopId: string;
  toStopId: string;
  transportMode: TransportMode;
  bookingStatus: 'confirmed' | 'not_booked' | 'not_needed';
  departure: {
    date: string;
    time?: string;
    timeStatus: 'confirmed' | 'preferred' | 'unknown';
    stationOrTerminal?: string;
  };
  arrival: {
    date: string;
    time?: string;
    timeStatus: 'confirmed' | 'estimated' | 'unknown';
    stationOrTerminal?: string;
  };
  providerName?: string;
  bookingCode?: string;
  bufferMinutes?: number;
  preferredWindow?: string;
  maxTravelHours?: number;
  notes?: string;
}

export interface StopAccommodationInput {
  stopId: string;
  status: 'booked' | 'not_booked' | 'not_needed';
  name?: string;
  address?: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  luggageDropAvailable?: boolean;
  notes?: string;
}

export interface MultiCityTripPlannerInput {
  tripWindow: {
    startDate: string;
    startTime?: string;
    startTimeStatus?: 'confirmed' | 'preferred' | 'unknown';
    endDate: string;
    endTime?: string;
    endTimeStatus?: 'confirmed' | 'preferred' | 'unknown';
  };
  routeStops: RouteStopInput[];
  journeyLegs: JourneyLegInput[];
  accommodations: StopAccommodationInput[];
  travelers: {
    adults: number;
    children: {
      age: number;
    }[];
    seniors: number;
  };
  mobilityAndComfortNeeds: string[];
  specialNote?: string;
  travelStyles: string[];
  pace: 'relaxed' | 'balanced' | 'active';
  avoidPreferences: string[];
  foodPreferences: string[];
  budget: {
    total: number;
    currency: 'VND';
    alreadyPaid: {
      transport: number;
      accommodation: number;
      other: number;
    };
    includedItems: string[];
  };
}

export interface TripPlanWarning {
  code:
    | 'tight_connection'
    | 'missing_transport'
    | 'missing_accommodation'
    | 'late_arrival'
    | 'early_departure'
    | 'schedule_conflict'
    | 'insufficient_buffer'
    | 'unverified_information';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  relatedStopId?: string;
  relatedLegId?: string;
  suggestedAction?: string;
}

export interface GeneratedRouteSummary {
  stops: {
    stopId: string;
    name: string;
    arrivalDate?: string;
    arrivalTime?: string;
    departureDate?: string;
    departureTime?: string;
    nights?: number;
  }[];
  legs: {
    legId: string;
    from: string;
    to: string;
    departureDate: string;
    departureTime?: string;
    arrivalDate: string;
    arrivalTime?: string;
    transportMode: string;
    bookingStatus: string;
    leaveAccommodationAt?: string;
    arriveTerminalBy?: string;
    bufferMinutes?: number;
  }[];
}

export interface GeneratedMultiCityTripPlan {
  tripTitle: string;
  summary: string;
  routeSummary: GeneratedRouteSummary;
  days: GeneratedTripDay[];
  unresolvedItems: {
    title: string;
    description: string;
    actionNeeded: string;
  }[];
  warnings: TripPlanWarning[];
  estimatedBudget: {
    totalMin: number;
    totalMax: number;
    alreadyPaid: number;
    remainingMin: number;
    remainingMax: number;
    currency: 'VND';
  };
}

export interface InterProvinceLeg {
  from: string;
  to: string;
  transportMethod: string;
  estimatedHours?: number;
  note?: string;
}

export interface TripPlannerInput {
  origin: {
    name: string;
    placeId?: string;
  };
  destinations: {
    name: string;
    placeId?: string;
  }[];
  dateMode: 'fixed' | 'flexible';
  startDate?: string;
  endDate?: string;
  departureTime?: string; // e.g., '06:30'
  estimatedArrivalTime?: string; // e.g., '10:30'
  hotelCheckInTime?: string; // e.g., '14:00'
  hotelCheckOutTime?: string; // e.g., '12:00'
  returnDepartureTime?: string; // e.g., '15:30'
  returnArrivalTime?: string; // e.g., '19:30'
  interProvinceLegs?: InterProvinceLeg[];
  expectedDays?: number;
  expectedMonth?: string;
  travelers: {
    adults: number;
    children: {
      age: number;
    }[];
    seniors: number;
  };
  specialNeeds: string[];
  specialNote?: string;
  travelStyles: string[];
  pace: 'relaxed' | 'balanced' | 'active';
  avoidPreferences: string[];
  foodPreferences: string[];
  preferredAttractions?: string[];
  mainTransport: string;
  localTransports: string[];
  accommodation: {
    bookingStatus: 'booked' | 'not_booked';
    bookedPlaces?: {
      name: string;
      address?: string;
      checkInDate?: string;
      checkOutDate?: string;
    }[];
    preferredTypes?: string[];
    comfortLevel?: 'budget' | 'standard' | 'comfortable' | 'premium';
  };
  budget: {
    total: number;
    currency: 'VND';
    includedItems: string[];
  };
  // Reference to new MultiCity object if present
  multiCity?: MultiCityTripPlannerInput;
}

export interface GeneratedActivity {
  startTime: string;
  endTime?: string;
  type: 'transport' | 'food' | 'sightseeing' | 'accommodation' | 'rest' | 'experience';
  title: string;
  description: string;
  place?: {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  transportFromPrevious?: {
    method: string;
    estimatedMinutes: number;
    note?: string;
  };
  estimatedCost?: {
    min: number;
    max: number;
  };
  familyTips?: string[];
  bookingRequired?: boolean;
}

export interface GeneratedTripDay {
  dayNumber: number;
  date?: string;
  title: string;
  summary: string;
  activities: GeneratedActivity[];
  estimatedDayCost?: {
    min: number;
    max: number;
  };
  alternativePlan?: {
    condition: string;
    description: string;
  };
}

export interface GeneratedTripPlan {
  tripTitle: string;
  summary: string;
  startDate?: string;
  endDate?: string;
  estimatedBudget: {
    min: number;
    max: number;
    currency: 'VND';
    note: string;
  };
  days: GeneratedTripDay[];
  recommendedFoods: {
    name: string;
    description: string;
    suggestedPlaces: string[];
  }[];
  importantNotes: string[];
  packingSuggestions: string[];
}

// Module 3 - Travel Book Extended Specification Types
export type ActivityStatus = 'upcoming' | 'current' | 'completed' | 'skipped' | 'changed';

export type TravelActivityType =
  | 'transport'
  | 'food'
  | 'sightseeing'
  | 'accommodation'
  | 'rest'
  | 'experience'
  | 'note';

export interface TravelPlace {
  name: string;
  address?: string;
  phone?: string;
  googleMapUrl?: string;
  suitableFor?: string[];
  notes?: string;
  bookingCode?: string;
}

export interface TransportDetail {
  method: string;
  durationMinutes: number;
  distanceKm?: number;
  note?: string;
}

export interface BookingDocument {
  id: string;
  type: 'flight' | 'hotel' | 'ticket' | 'transport' | 'other';
  title: string;
  provider?: string;
  bookingCode?: string;
  fileUrl: string;
  fileType?: 'image' | 'pdf' | 'qr';
  associatedDayNumber?: number;
  associatedActivityId?: string;
  notes?: string;
  uploadedBy?: string;
  uploadedAt: string;
  status: 'confirmed' | 'pending';
}

export interface TravelActivity {
  id: string;
  type: TravelActivityType;
  startTime: string;
  endTime?: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  place?: TravelPlace;
  transportFromPrevious?: TransportDetail;
  estimatedCost?: number;
  actualCost?: number;
  familyTips?: string[];
  imageUrl?: string;
  notes?: string;
  bookingDocumentId?: string;
  bookingCode?: string;
  bookingStatus?: 'confirmed' | 'pending' | 'none';
}

export interface AlternativePlan {
  id: string;
  condition: string;
  title: string;
  description: string;
  replacementActivities: string[];
  isApplied?: boolean;
}

export interface DayExpenseItem {
  id: string;
  category: 'di_chuyen' | 'an_uong' | 'tham_quan' | 'luu_tru' | 'khac';
  title: string;
  amount: number;
  time?: string;
}

export interface DayPackingItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface TravelBookDay {
  id: string;
  dayNumber: number;
  dateStr: string;
  destinationName?: string;
  title: string;
  summary?: string;
  pace?: 'relaxed' | 'balanced' | 'active';
  weatherForecast?: string;
  mainTransport?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  actualCostTotal?: number;
  activities: TravelActivity[];
  alternativePlans?: AlternativePlan[];
  familyNote?: string;
  expenses?: DayExpenseItem[];
  packingItems?: DayPackingItem[];
  mustTryFoods?: string[];
}

export interface PrepItem {
  id: string;
  name: string;
  status: 'confirmed' | 'booked' | 'pending';
}

export interface TravelBook {
  id: string;
  title: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  countdownDays?: number;
  durationDays: number;
  durationNights: number;
  memberCount: number;
  members?: {
    adults: number;
    children: number;
    seniors: number;
    list?: string[];
  };
  destinations: string[];
  routeFlow?: {
    from: string;
    to: string;
    transport: string;
  }[];
  accommodations: {
    period: string;
    name: string;
    address?: string;
    bookingCode?: string;
  }[];
  budgetEstimatedMin: number;
  budgetEstimatedMax: number;
  budgetExcluded?: string[];
  prepItems: PrepItem[];
  bookingDocuments?: BookingDocument[];
  days: TravelBookDay[];
  importantNotes?: string[];
}



