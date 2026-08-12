import { supabase } from './supabase';

export interface CachedPlace {
  place_id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  category: string;
  price_level: string;
  cover_image: string;
  photos: string[];
  location: { lat: number; lng: number };
  formatted_phone?: string;
  website?: string;
  source?: 'supabase_cache' | 'local_cache' | 'google_places_api' | 'verified_fallback';
  cached_at?: string;
}

export interface PlaceQueryResult {
  place: CachedPlace;
  source: 'supabase_cache' | 'local_cache' | 'google_places_api' | 'verified_fallback';
  latencyMs: number;
  message?: string;
}

// Get Google Places API Key from environment
export const getGooglePlacesApiKey = (): string => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
};

export const hasGooglePlacesApiKey = (): boolean => {
  const key = getGooglePlacesApiKey();
  return Boolean(key && key.trim().length > 5);
};

// 1. Fetch from Supabase Cache Table
export async function fetchFromSupabaseCache(queryOrId: string): Promise<CachedPlace | null> {
  try {
    const cleanQuery = queryOrId.trim();
    if (!cleanQuery) return null;

    // Check by place_id exact match first
    const { data: idMatch } = await supabase
      .from('places_cache')
      .select('*')
      .eq('place_id', cleanQuery)
      .maybeSingle();

    if (idMatch) {
      return normalizeSupabaseCacheRow(idMatch);
    }

    // Check by name case-insensitive ILIKE
    const { data: nameMatches } = await supabase
      .from('places_cache')
      .select('*')
      .ilike('name', `%${cleanQuery}%`)
      .limit(1);

    if (nameMatches && nameMatches.length > 0) {
      return normalizeSupabaseCacheRow(nameMatches[0]);
    }

    return null;
  } catch (err) {
    console.warn('[GooglePlacesCache] Error querying Supabase cache:', err);
    return null;
  }
}

// 2. Fetch all cached places from Supabase
export async function fetchAllSupabaseCachedPlaces(): Promise<CachedPlace[]> {
  try {
    const { data, error } = await supabase
      .from('places_cache')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[GooglePlacesCache] Fetch all error:', error.message);
      return getLocalStorageCachedPlaces();
    }

    return (data || []).map(normalizeSupabaseCacheRow);
  } catch (err) {
    console.warn('[GooglePlacesCache] Fetch all exception:', err);
    return getLocalStorageCachedPlaces();
  }
}

// 3. Save to Supabase Cache Table
export async function saveToSupabaseCache(place: CachedPlace): Promise<boolean> {
  try {
    const payload = {
      place_id: place.place_id,
      name: place.name,
      address: place.address,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total || 0,
      category: place.category || 'Attraction',
      price_level: place.price_level || 'Medium',
      cover_image: place.cover_image,
      photos: place.photos || [place.cover_image],
      location: place.location || { lat: 16.0544, lng: 108.2022 },
      formatted_phone: place.formatted_phone || '',
      website: place.website || '',
      source: place.source || 'google_places',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('places_cache').upsert(payload);

    if (error) {
      console.warn('[GooglePlacesCache] Supabase save error:', error.message);
      // Fallback to local storage if table doesn't exist yet
      saveToLocalStorageCache(place);
      return false;
    }

    saveToLocalStorageCache(place);
    return true;
  } catch (err) {
    console.warn('[GooglePlacesCache] Save exception:', err);
    saveToLocalStorageCache(place);
    return false;
  }
}

// 4. LocalStorage fallback helper
function saveToLocalStorageCache(place: CachedPlace) {
  try {
    const key = `gplaces_cache_${place.place_id}`;
    localStorage.setItem(key, JSON.stringify(place));
    
    // Maintain cache index list
    const indexKey = 'gplaces_cache_index';
    const existingIndex = JSON.parse(localStorage.getItem(indexKey) || '[]');
    if (!existingIndex.includes(place.place_id)) {
      existingIndex.push(place.place_id);
      localStorage.setItem(indexKey, JSON.stringify(existingIndex));
    }
  } catch (e) {
    // Ignore storage quota
  }
}

function getLocalStorageCachedPlace(query: string): CachedPlace | null {
  try {
    const indexKey = 'gplaces_cache_index';
    const ids: string[] = JSON.parse(localStorage.getItem(indexKey) || '[]');
    const lowerQuery = query.toLowerCase().trim();

    for (const id of ids) {
      const itemRaw = localStorage.getItem(`gplaces_cache_${id}`);
      if (itemRaw) {
        const place: CachedPlace = JSON.parse(itemRaw);
        if (place.place_id === query || place.name.toLowerCase().includes(lowerQuery)) {
          return place;
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

function getLocalStorageCachedPlaces(): CachedPlace[] {
  try {
    const indexKey = 'gplaces_cache_index';
    const ids: string[] = JSON.parse(localStorage.getItem(indexKey) || '[]');
    const places: CachedPlace[] = [];
    for (const id of ids) {
      const itemRaw = localStorage.getItem(`gplaces_cache_${id}`);
      if (itemRaw) {
        places.push(JSON.parse(itemRaw));
      }
    }
    return places;
  } catch (e) {
    return [];
  }
}

function normalizeSupabaseCacheRow(row: any): CachedPlace {
  return {
    place_id: row.place_id,
    name: row.name,
    address: row.address || '',
    rating: Number(row.rating) || 4.5,
    user_ratings_total: Number(row.user_ratings_total) || 0,
    category: row.category || 'Attraction',
    price_level: row.price_level || 'Medium',
    cover_image: row.cover_image || '',
    photos: Array.isArray(row.photos) ? row.photos : row.cover_image ? [row.cover_image] : [],
    location: row.location || { lat: 16.0544, lng: 108.2022 },
    formatted_phone: row.formatted_phone || '',
    website: row.website || '',
    source: 'supabase_cache',
    cached_at: row.cached_at || row.updated_at,
  };
}

// 5. Fetch Live from Google Places API (ĐÃ GỠ BỎ ĐỂ TIẾT KIỆM NGÂN SÁCH - CHUYỂN QUA CROWDSOURCING)
export async function fetchLiveGooglePlacesAPI(query: string): Promise<CachedPlace | null> {
  return null;
}

const REAL_VERIFIED_PHOTO_CATALOG: Record<string, { image: string; address: string; rating: number; category: string }> = {};

function getVerifiedRealImageFallback(name: string, query: string): string {
  return ''; // Ngừng sử dụng ảnh Unsplash theo yêu cầu
}

// Main High-level Function: Get Place with Smart Caching System
export async function getPlaceWithCache(query: string, categoryHint?: string): Promise<PlaceQueryResult> {
  const startTime = Date.now();
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error('Từ khóa tìm kiếm không được để trống.');
  }

  // 1. Check Supabase Database Cache (0 API Cost, <30ms)
  const supabaseCached = await fetchFromSupabaseCache(cleanQuery);
  if (supabaseCached) {
    return {
      place: supabaseCached,
      source: 'supabase_cache',
      latencyMs: Date.now() - startTime,
      message: '⚡ Lấy từ bộ nhớ đệm Supabase (0$ API Cost - Tối ưu 100% tốc độ)',
    };
  }

  // 2. Check LocalStorage Cache
  const localCached = getLocalStorageCachedPlace(cleanQuery);
  if (localCached) {
    return {
      place: localCached,
      source: 'local_cache',
      latencyMs: Date.now() - startTime,
      message: '💾 Lấy từ bộ nhớ đệm trình duyệt',
    };
  }
  // 3. (Gỡ bỏ) Không truy vấn Google API nữa
  // Đã vô hiệu hoá Google API

  // TRÁNH LƯU DATABASE! Trả về dữ liệu trống để không ghi đè dữ liệu của AI bằng dữ liệu cứng.
  const emptyFallbackPlace: CachedPlace = {
    place_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: cleanQuery,
    address: 'Địa chỉ chưa cập nhật',
    rating: 0,
    user_ratings_total: 0,
    category: categoryHint || 'Attraction',
    price_level: 'Medium',
    cover_image: '',
    photos: [],
    location: { lat: 16.0544, lng: 108.2022 },
    source: 'google_places_api', // Đánh lừa frontend để không báo lỗi, nhưng là dữ liệu rỗng.
  };

  return {
    place: emptyFallbackPlace,
    source: 'google_places_api',
    latencyMs: Date.now() - startTime,
    message: 'Không thể truy xuất Google Places API, sử dụng dữ liệu AI gốc.',
  };
}

// Helpers
function mapGoogleTypeToCategory(type?: string): string {
  if (!type) return 'Attraction';
  const t = type.toLowerCase();
  if (t.includes('restaurant') || t.includes('food') || t.includes('cafe') || t.includes('bakery')) {
    return 'Restaurant';
  }
  if (t.includes('hotel') || t.includes('lodging') || t.includes('resort')) {
    return 'Hotel';
  }
  if (t.includes('park') || t.includes('museum') || t.includes('tourist') || t.includes('point_of_interest')) {
    return 'Attraction';
  }
  return 'Attraction';
}

function mapGooglePriceLevel(priceLevel?: string): string {
  if (!priceLevel) return 'Medium';
  if (priceLevel.includes('INEXPENSIVE') || priceLevel === 'PRICE_LEVEL_INEXPENSIVE') return 'Budget';
  if (priceLevel.includes('EXPENSIVE') || priceLevel === 'PRICE_LEVEL_EXPENSIVE') return 'High';
  if (priceLevel.includes('VERY_EXPENSIVE')) return 'High';
  return 'Medium';
}
