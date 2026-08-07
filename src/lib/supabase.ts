import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Provide dummy values if not configured to prevent instant crash on boot
export const supabase = createClient(
  SUPABASE_URL || 'https://dummy.supabase.co', 
  SUPABASE_ANON_KEY || 'dummy_key', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://dummy.supabase.co');
};

// Test live connection to Supabase instance
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('trips').select('id').limit(1);
    const latency = Date.now() - start;

    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('relation "public.trips" does not exist')) {
        return {
          success: true,
          message: `Kết nối Supabase thành công! (${latency}ms). Cần chạy file SQL schema để khởi tạo các bảng dữ liệu.`,
        };
      }
      return {
        success: false,
        message: `Lỗi truy vấn Supabase: ${error.message} (${error.code || 'UNKNOWN'})`,
      };
    }

    return {
      success: true,
      message: `Kết nối & truy vấn bảng dữ liệu Supabase thành công! (${latency}ms)`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ngoại lệ kết nối: ${err.message || String(err)}`,
    };
  }
}

// Fetch user trips from Supabase
export async function fetchSupabaseTrips(userId?: string) {
  try {
    let query = supabase.from('trips').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_public', true);
    }
    const { data, error } = await query;

    if (error) {
      console.warn('Supabase fetchTrips error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetchTrips exception:', err);
    return null;
  }
}

// Save trip to Supabase
export async function saveSupabaseTrip(userId: string, trip: any) {
  try {
    const { data, error } = await supabase.from('trips').upsert({
      id: trip.id,
      user_id: userId,
      title: trip.title,
      cover_image: trip.coverImage,
      start_date: trip.startDate,
      end_date: trip.endDate,
      duration_days: trip.durationDays,
      status: trip.status,
      destinations: trip.destinations,
      data: trip,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase saveTrip error:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Supabase saveTrip exception:', err);
    return null;
  }
}

// Delete trip from Supabase
export async function deleteSupabaseTrip(tripId: string) {
  try {
    const { error } = await supabase.from('trips').delete().eq('id', tripId);
    if (error) {
      console.warn('Supabase deleteTrip error:', error.message);
    }
    return !error;
  } catch (err) {
    console.warn('Supabase deleteTrip exception:', err);
    return false;
  }
}

// Fetch user saved places from Supabase
export async function fetchSupabasePlaces(userId?: string) {
  try {
    let query = supabase.from('saved_places').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;

    if (error) {
      console.warn('Supabase fetchPlaces error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetchPlaces exception:', err);
    return null;
  }
}

// Save place to Supabase
export async function saveSupabasePlace(userId: string, place: any) {
  try {
    const { data, error } = await supabase.from('saved_places').upsert({
      id: place.id,
      user_id: userId,
      name: place.name,
      category: place.category,
      address: place.address,
      rating: place.rating,
      image_url: place.imageUrl,
      description: place.description,
      price_level: place.priceLevel,
      is_favorite: place.isFavorite || false,
      tags: place.tags || [],
    });

    if (error) {
      console.warn('Supabase savePlace error:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Supabase savePlace exception:', err);
    return null;
  }
}

// Fetch user diaries from Supabase
export async function fetchSupabaseDiaries(userId?: string) {
  try {
    let query = supabase.from('diaries').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;

    if (error) {
      console.warn('Supabase fetchDiaries error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetchDiaries exception:', err);
    return null;
  }
}

// Save diary to Supabase
export async function saveSupabaseDiary(userId: string, diary: any) {
  try {
    const { data, error } = await supabase.from('diaries').upsert({
      id: diary.id,
      user_id: userId,
      title: diary.title,
      cover_image: diary.coverImage,
      introduction: diary.introduction,
      data: diary,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase saveDiary error:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('Supabase saveDiary exception:', err);
    return null;
  }
}

export async function deleteSupabaseDiary(diaryId: string) {
  try {
    const { error } = await supabase.from('diaries').delete().eq('id', diaryId);
    return !error;
  } catch {
    return false;
  }
}

// ==================== AUTH & PROFILES INTEGRATION ====================

// Supabase Real Sign Up
export async function supabaseSignUp(email: string, password: string, fullName: string, familyName?: string) {
  try {
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          family_name: familyName || `Gia đình ${fullName}`,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message, user: null };
    }

    const user = authData.user;
    if (user) {
      // 2. Insert or update profile in public.profiles table
      const profileData = {
        id: user.id,
        email: user.email || email,
        full_name: fullName,
        role: 'Trưởng nhóm',
        family_account_id: `fam-${user.id.slice(0, 8)}`,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      await supabase.from('profiles').upsert(profileData);

      // 3. Create family account in public.family_accounts table
      const familyData = {
        id: `fam-${user.id.slice(0, 8)}`,
        family_name: familyName || `Gia đình ${fullName}`,
        owner_id: user.id,
        invite_code: `VIVU-${Math.floor(1000 + Math.random() * 9000)}`,
        members_count: 1,
        created_at: new Date().toISOString(),
      };

      await supabase.from('family_accounts').upsert(familyData);
    }

    return { success: true, error: null, user };
  } catch (err: any) {
    return { success: false, error: err.message || String(err), user: null };
  }
}

// Supabase Real Sign In
export async function supabaseSignIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message, session: null, profile: null };
    }

    // Fetch user profile from public.profiles
    let profile = null;
    if (data.user) {
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profile = profData;
    }

    return { success: true, error: null, session: data.session, user: data.user, profile };
  } catch (err: any) {
    return { success: false, error: err.message || String(err), session: null, profile: null };
  }
}

// ==================== ADMIN API ENDPOINTS ====================

// Fetch all profiles from Supabase for Admin
export async function fetchSupabaseProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSupabaseProfiles error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetchSupabaseProfiles exception:', err);
    return null;
  }
}

// Update profile role or status for Admin
export async function updateSupabaseProfileStatus(userId: string, updates: { role?: string; status?: string; full_name?: string }) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.warn('Supabase updateSupabaseProfileStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateSupabaseProfileStatus exception:', err);
    return false;
  }
}

// Fetch all trips for Admin moderation
export async function fetchSupabaseTripsAdmin() {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchSupabaseTripsAdmin error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetchSupabaseTripsAdmin exception:', err);
    return null;
  }
}

// Update trip moderation flags (is_public, is_featured, status)
export async function updateSupabaseTripModeration(tripId: string, updates: { is_public?: boolean; is_featured?: boolean; status?: string }) {
  try {
    const { error } = await supabase
      .from('trips')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId);

    if (error) {
      console.warn('Supabase updateSupabaseTripModeration error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateSupabaseTripModeration exception:', err);
    return false;
  }
}

// Get Real Platform KPI Statistics from Supabase
export async function fetchSupabaseStats() {
  try {
    const [profilesRes, tripsRes, placesRes, diariesRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('trips').select('id', { count: 'exact', head: true }),
      supabase.from('poi_database').select('id', { count: 'exact', head: true }), // Thay vì saved_places
      supabase.from('diaries').select('id', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: profilesRes.count || 0,
      totalTrips: tripsRes.count || 0,
      totalPlaces: placesRes.count || 0,
      totalDiaries: diariesRes.count || 0,
    };
  } catch (err) {
    console.warn('Supabase fetchSupabaseStats exception:', err);
    return {
      totalUsers: 0,
      totalTrips: 0,
      totalPlaces: 0,
      totalDiaries: 0,
    };
  }
}

// ==================== POI ACCUMULATION & REUSE ENGINE ====================

// Fetch accumulated public POIs for reuse in AI Planner & Places directory
export async function fetchAccumulatedPOIs(category?: string, city?: string) {
  try {
    let query = supabase.from('poi_database').select('*').order('created_at', { ascending: false });
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data, error } = await query.limit(50);
    if (error) {
      console.warn('fetchAccumulatedPOIs error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('fetchAccumulatedPOIs exception:', err);
    return null;
  }
}

// Automatically accumulate POIs (places, restaurants, hotels, attractions) from generated trip plans into database
export async function accumulateTripPOIs(userId: string, places: Array<{
  id?: string;
  name: string;
  category: string;
  address?: string;
  city?: string;
  rating?: number;
  imageUrl?: string;
  description?: string;
  priceLevel?: string;
  tags?: string[];
}>) {
  try {
    if (!places || places.length === 0) return;

    const records = places.map((p, index) => ({
      id: p.id || `poi-acc-${Date.now()}-${index}`,
      name: p.name,
      category: p.category || 'Attraction',
      address: p.address || 'Địa điểm công cộng',
      city: p.city || 'Unknown',
      rating: p.rating || 4.8,
      image_url: p.imageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
      description: p.description || 'Địa điểm du lịch tham khảo tích lũy dữ liệu.',
      price_level: p.priceLevel || 'Medium',
      tags: p.tags || ['Public Common POI', 'Tham khảo'],
      source: 'ai_generated',
      contributed_by: userId || null,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('poi_database').upsert(records, { onConflict: 'name,city' });
    if (error) {
      console.warn('accumulateTripPOIs notice:', error.message);
    } else {
      console.log(`Successfully accumulated ${records.length} POIs into public library.`);
    }
    return data;
  } catch (err) {
    console.warn('accumulateTripPOIs exception:', err);
    return null;
  }
}

export async function updateFamilySettings(familyId: string, updates: any) {
  try {
    const { data, error } = await supabase.from('family_accounts').update(updates).eq('id', familyId).select().single();
    if (error) throw error;
    return data;
  } catch (err: any) {
    console.warn('Supabase updateFamilySettings error:', err.message);
    return null;
  }
}

// ====================================================================
// STORAGE: AVATARS
// ====================================================================

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Lỗi upload avatar:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    if (data?.publicUrl) {
      // Cập nhật URL vào profile
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
      return data.publicUrl;
    }
    
    return null;
  } catch (err) {
    console.error('Exception upload avatar:', err);
    return null;
  }
}
