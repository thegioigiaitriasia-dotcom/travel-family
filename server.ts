import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tcpbxxwcljnuxwprfwvm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; 
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey as string, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const supabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY || 'dummy_anon_key');

// Rate limiting đơn giản cho /api/generate-plan (chống spam)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxPerWindow = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // OK
  }
  if (entry.count >= maxPerWindow) {
    return false; // Rate limited
  }
  entry.count += 1;
  return true;
}

const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ 
    limit: '10mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

// Auto-fetch Google Places helper
async function enrichPlanWithRealPlaces(plan: any, supabaseAdminClient: any, googleApiKey: string) {
  if (!plan || !plan.days) return plan;

  for (const day of plan.days) {
    if (!day.activities) continue;

    for (const activity of day.activities) {
      const type = (activity.category || '').toLowerCase();
      // Bỏ qua các hoạt động di chuyển hoặc nghỉ ngơi chung chung
      if (type === 'transport' || type === 'di chuyển' || !activity.locationName || activity.locationName.length < 3) {
        continue;
      }

      const placeName = activity.locationName;
      let realImageUrl = null;

      try {
        // 1. Tìm trong poi_database trước
        const { data: dbMatches } = await supabaseAdminClient
          .from('poi_database')
          .select('image_url')
          .ilike('name', `%${placeName}%`)
          .limit(1);

        if (dbMatches && dbMatches.length > 0 && dbMatches[0].image_url) {
          realImageUrl = dbMatches[0].image_url;
        } else if (googleApiKey) {
          // 2. Nếu chưa có, gọi Google Places API
          const url = 'https://places.googleapis.com/v1/places:searchText';
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': googleApiKey,
              'X-Goog-FieldMask': 'places.displayName,places.photos,places.formattedAddress,places.types',
            },
            body: JSON.stringify({
              textQuery: `${placeName} ${day.cityName || ''}`,
              languageCode: 'vi',
            }),
          });
          const gData = await response.json();

          if (gData.places && gData.places.length > 0) {
            const place = gData.places[0];
            if (place.photos && place.photos.length > 0) {
              const photoName = place.photos[0].name;
              realImageUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&key=${googleApiKey}`;

              // 3. Tích lũy (Insert) vào poi_database để dùng lại
              await supabaseAdminClient.from('poi_database').upsert({
                name: placeName,
                category: activity.category || 'Attraction',
                address: place.formattedAddress || day.cityName || '',
                city: day.cityName || '',
                image_url: realImageUrl,
                description: activity.description || '',
                source: 'ai_auto_fetch'
              }, { onConflict: 'name,city' });
            }
          }
        }
      } catch (err) {
        console.warn(`[Auto Fetch Image] Failed for ${placeName}`, err);
      }

      // Gắn hình ảnh vào activity
      if (realImageUrl) {
        activity.imageUrl = realImageUrl;
        if (!activity.place) activity.place = { name: placeName };
        activity.place.imageUrl = realImageUrl;
      }
    }
  }
  return plan;
}

  // ==========================================================================
  // Phase 2.5: Profile & Family Account APIs (bypass RLS dùng supabaseAdmin)
  // ==========================================================================

  // GET /api/get-profile?userId=xxx
  app.get('/api/get-profile', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId as string).maybeSingle();
      if (error) return res.status(400).json({ success: false, message: error.message });
      return res.json({ success: true, profile: data });
    } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
  });

  // GET /api/get-profiles (admin only - all profiles)
  app.get('/api/get-profiles', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) return res.status(400).json({ success: false, message: error.message });
      return res.json({ success: true, profiles: data });
    } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
  });

  // GET /api/get-family-members?familyId=xxx
  // Bypass RLS — lấy toàn bộ thành viên gia đình bằng admin key
  app.get('/api/get-family-members', async (req, res) => {
    try {
      const { familyId } = req.query;
      if (!familyId) return res.status(400).json({ success: false, message: 'Missing familyId' });
      const [membersRes, familyRes] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('family_account_id', familyId as string),
        supabaseAdmin.from('family_accounts').select('*').eq('id', familyId as string).maybeSingle(),
      ]);
      if (membersRes.error) return res.status(400).json({ success: false, message: membersRes.error.message });
      return res.json({
        success: true,
        members: membersRes.data || [],
        family: familyRes.data || null,
      });
    } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
  });

  // POST /api/update-profile
  app.post('/api/update-profile', async (req, res) => {
    try {
      const { userId, updates } = req.body;
      if (!userId || !updates) return res.status(400).json({ success: false, message: 'Missing userId or updates' });
      const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId);
      if (error) return res.status(400).json({ success: false, message: error.message });
      return res.json({ success: true });
    } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
  });

  // ==========================================================================
  // Phase 3: Google Places API Proxy
  // POST /api/places/search
  // GET /api/places/photo
  // ==========================================================================
  app.post('/api/places/search', async (req, res) => {
    try {
      const { query } = req.body;
      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ success: false, error: 'Google Places API key is missing on server.' });
      }

      const url = 'https://places.googleapis.com/v1/places:searchText';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.location,places.nationalPhoneNumber,places.websiteUri,places.primaryType',
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'vi',
        }),
      });

      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      console.error('[Google Places API Proxy] Error:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/places/photo', async (req, res) => {
    const { name, photo_reference } = req.query;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.redirect('https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80');
    }

    if (name) {
      return res.redirect(`https://places.googleapis.com/v1/${name}/media?maxHeightPx=1000&key=${apiKey}`);
    } else if (photo_reference) {
      return res.redirect(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photoreference=${photo_reference}&key=${apiKey}`);
    }
    
    return res.status(404).send('Photo not found');
  });

  // Real Gemini AI Trip Plan Generation API
  app.post('/api/generate-plan', async (req, res) => {
    // Rate limiting: tối đa 5 lần/phút mỗi IP
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp, 5, 60_000)) {
      return res.status(429).json({
        success: false,
        error: 'Quá nhiều yêu cầu. Vui lòng đợi 1 phút trước khi thử lại.',
      });
    }

    try {
      const tripInput = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.log('[Gemini API] GEMINI_API_KEY environment variable is not set. Using smart fallback generator.');
        return res.json({
          success: true,
          source: 'smart_generator_fallback',
          message: 'Lịch trình đã được khởi tạo tối ưu với thuật toán thông minh.',
          plan: generateFallbackItinerary(tripInput),
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const startTime24h = tripInput.tripWindow?.startTime || '07:00';
      const endTime24h = tripInput.tripWindow?.endTime || '20:00';

      const prompt = `
Bạn là Chuyên gia Lập Lịch Trình Du Lịch Gia Đình Việt Nam cao cấp (AI Family Travel Planner).
Hãy tạo một Kế hoạch chuyến đi du lịch gia đình đa chặng / đa điểm đến dựa trên thông tin chi tiết được cung cấp:

THÔNG TIN CHUYẾN ĐI:
- Khung thời gian: Từ ${tripInput.tripWindow?.startDate || 'ngày xuất phát'} (Giờ khởi hành: ${startTime24h}) đến ${tripInput.tripWindow?.endDate || 'ngày về'} (Giờ kết thúc: ${endTime24h})
- Các điểm dừng trong lộ trình: ${JSON.stringify(tripInput.routeStops || [])}
- Phương tiện di chuyển các chặng: ${JSON.stringify(tripInput.journeyLegs || [])}
- Nơi lưu trú từng điểm: ${JSON.stringify(tripInput.accommodations || [])}
- Thành viên gia đình: ${JSON.stringify(tripInput.travelers || {})}
- Nhu cầu đặc biệt & sức khỏe: ${JSON.stringify(tripInput.mobilityAndComfortNeeds || [])} - ${tripInput.specialNote || ''}
- Phong cách du lịch & Nhịp độ: Nhịp độ ${tripInput.pace || 'balanced'}, Gu: ${JSON.stringify(tripInput.travelStyles || [])}
- Điều tránh: ${JSON.stringify(tripInput.avoidPreferences || [])}
- Sở thích ăn uống: ${JSON.stringify(tripInput.foodPreferences || [])}
- Ngân sách toàn chuyến: Tổng ${tripInput.budget?.total?.toLocaleString('vi-VN') || '20.000.000'} VND (Đã trả trước: ${JSON.stringify(tripInput.budget?.alreadyPaid || {})})

QUY TẮC QUAN TRỌNG VỀ THỜI GIAN:
1. Tất cả các trường "startTime" và "endTime" PHẢI ở định dạng 24 giờ (HH:MM), ví dụ "08:30", "13:00", "19:45".
2. Ngày 1: Hoạt động đầu tiên PHẢI bắt đầu đúng vào giờ khởi hành "${startTime24h}".
3. Ngày cuối: Hoạt động cuối cùng PHẢI kết thúc trước hoặc đúng giờ kết thúc "${endTime24h}".
4. Các ngày còn lại: Thường bắt đầu lúc 07:00 và kết thúc lúc 21:00-22:00 (sau bữa tối).
5. Mỗi hoạt động phải có CẢ startTime VÀ endTime hợp lý (ví dụ: tham quan 1.5-2 tiếng, ăn uống 1 tiếng, di chuyển phù hợp với khoảng cách).
6. Các hoạt động phải nối tiếp nhau liên tục, không có khoảng trống thời gian vô lý.

YÊU CẦU ĐẦU RA JSON TỰ ĐỘNG:
Hãy trả về JSON duy nhất với cấu trúc:
{
  "title": "Tên hấp dẫn cho chuyến đi gia đình",
  "totalDays": số_ngày,
  "summary": "Tóm tắt ngắn gọn 2-3 câu về hành trình",
  "familyAdvice": ["Gợi ý 1 cho sức khỏe/sự thoải mái của bé & người lớn", "Gợi ý 2", "Gợi ý 3"],
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "cityName": "Tên thành phố/điểm dừng",
      "theme": "Chủ đề ngày 1",
      "activities": [
        {
          "startTime": "08:30",
          "endTime": "10:00",
          "title": "Tên hoạt động/địa điểm",
          "category": "Attraction" | "Restaurant" | "Transport" | "Hotel" | "Rest",
          "description": "Mô tả chi tiết và lưu ý gia đình",
          "locationName": "Tên địa danh cụ thể",
          "estimatedCost": "Chi phí ước tính VND (ví dụ: 200.000đ)",
          "familyTip": "Lưu ý riêng cho gia đình (ví dụ: bãi đỗ xe, chép xe đẩy, che nắng)"
        }
      ]
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là AI lập kế hoạch du lịch chuyên nghiệp dành cho gia đình Việt Nam. Hãy trả về kết quả đúng cấu trúc JSON, bằng tiếng Việt chuẩn, tinh tế và chu đáo. Mọi trường thời gian phải ở định dạng 24 giờ HH:MM.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              totalDays: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              familyAdvice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.NUMBER },
                    date: { type: Type.STRING },
                    cityName: { type: Type.STRING },
                    theme: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          startTime: { type: Type.STRING },
                          endTime: { type: Type.STRING },
                          title: { type: Type.STRING },
                          category: { type: Type.STRING },
                          description: { type: Type.STRING },
                          locationName: { type: Type.STRING },
                          estimatedCost: { type: Type.STRING },
                          familyTip: { type: Type.STRING },
                        },
                        required: ['startTime', 'endTime', 'title', 'category', 'description'],
                      },
                    },
                  },
                  required: ['dayNumber', 'cityName', 'theme', 'activities'],
                },
              },
            },
            required: ['title', 'totalDays', 'summary', 'days'],
          },
        },
      });

      const jsonText = response.text || '';
      const parsedPlan = JSON.parse(jsonText);
      const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
      
      const enrichedPlan = await enrichPlanWithRealPlaces(parsedPlan, supabaseAdmin, googleApiKey);

      return res.json({
        success: true,
        source: 'gemini_3_6_flash',
        plan: enrichedPlan,
      });
    } catch (err: any) {
      console.error('[Gemini API Error]', err);
      // Return smart fallback if Gemini call fails
      return res.json({
        success: true,
        source: 'smart_generator_fallback',
        message: 'Lịch trình được khởi tạo thành công với dữ liệu điểm đến chuẩn.',
        plan: generateFallbackItinerary(req.body),
      });
    }
  });

  // POST /api/create-sub-account
  // Endpoint to create a family member (sub-account) without requiring a real email on the frontend
  app.post('/api/create-sub-account', async (req, res) => {
    try {
      const { email, password, name, familyId } = req.body;
      if (!email || !password || !name || !familyId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
      }

      // Create user using Supabase Admin (bypasses Auth restrictions & doesn't log them in on the client side)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: name, family_id: familyId }
      });

      if (authError) {
        console.error('[Create Sub Account Error]', authError);
        return res.status(400).json({ success: false, message: authError.message });
      }

      // Update family_accounts to increment members count
      if (authData?.user) {
        // Also map to family_accounts
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ family_account_id: familyId, role: 'Thành viên' })
          .eq('id', authData.user.id);
          
        if (!updateError) {
           await supabaseAdmin.rpc('increment_family_member', { f_id: familyId }).catch(() => {});
        }
      }

      return res.json({ success: true, userId: authData.user.id, message: 'Tạo tài khoản thành công.' });
    } catch (err: any) {
      console.error('[Create Sub Account Exception]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/join-family
  // Luồng đúng: thành viên nhập Tên + Mã mời + Mật khẩu mới → tạo tài khoản phụ trong gia đình
  app.post('/api/join-family', async (req, res) => {
    try {
      const { displayName, inviteCode, password } = req.body;
      if (!displayName || !inviteCode || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ Tên, Mã mời và Mật khẩu.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
      }

      const code = String(inviteCode).trim().toUpperCase();
      const username = String(displayName).trim().toLowerCase().replace(/\s+/g, '.');

      // 1. Tìm gia đình theo invite_code
      const { data: familyData, error: familyError } = await supabaseAdmin
        .from('family_accounts')
        .select('id, family_name, invite_code, owner_id')
        .eq('invite_code', code)
        .maybeSingle();

      if (familyError || !familyData) {
        console.warn('[JoinFamily] Invalid invite code:', code, familyError?.message);
        return res.status(404).json({ success: false, message: 'Mã lời mời không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại với Trưởng nhóm.' });
      }

      // 2. Tạo pseudo-email: username@invitecode.giadinhvivu.com
      const pseudoEmail = `${username}@${code.toLowerCase()}.giadinhvivu.com`;

      // Kiểm tra đã tồn tại chưa (tìm trong profiles)
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', pseudoEmail)
        .maybeSingle();

      if (existingProfile) {
        return res.status(409).json({ success: false, message: `Tên đăng nhập "${displayName}" đã được dùng trong gia đình này. Vui lòng chọn tên khác.` });
      }

      // 3. Tạo Supabase Auth user với admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: pseudoEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: String(displayName).trim(),
          family_id: familyData.id,
          family_name: familyData.family_name,
          invite_code: code,
        }
      });

      if (authError) {
        console.error('[JoinFamily] Auth create error:', authError.message);
        return res.status(400).json({ success: false, message: `Không thể tạo tài khoản: ${authError.message}` });
      }

      const newUserId = authData.user?.id;
      if (!newUserId) {
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tạo tài khoản.' });
      }

      // 4. Gán vào gia đình trong bảng profiles (upsert để trigger không tạo profile trùng)
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: newUserId,
        email: pseudoEmail,
        family_account_id: familyData.id,
        full_name: String(displayName).trim(),
        role: 'Thành viên',
        is_admin: false,
        status: 'active',
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn('[JoinFamily] Profile upsert warning:', profileError.message);
      }

      // 5. Tăng members_count
      await supabaseAdmin
        .from('family_accounts')
        .update({ members_count: supabaseAdmin.rpc('increment', {}) as any })
        .eq('id', familyData.id)
        .catch(() => {});

      console.log(`[JoinFamily] ✅ "${displayName}" joined family "${familyData.family_name}" (${familyData.id})`);

      return res.json({
        success: true,
        pseudoEmail,
        familyName: familyData.family_name,
        familyId: familyData.id,
        userId: newUserId,
        message: `Tài khoản "${displayName}" đã gia nhập gia đình "${familyData.family_name}" thành công!`
      });

    } catch (err: any) {
      console.error('[JoinFamily Exception]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Webhook listener for SePay payments
  app.post('/api/sepay-webhook', async (req, res) => {
    try {
      // Xác thực chữ ký HMAC-SHA256 của SePay
      const sepaySecret = process.env.VITE_SEPAY_SECRET_KEY || process.env.SEPAY_SECRET_KEY;
      if (sepaySecret) {
        const signature = req.headers['x-sepay-signature'] || '';
        const timestamp = req.headers['x-sepay-timestamp'] || '';
        const rawBody = (req as any).rawBody || '';

        if (!signature || !timestamp || !rawBody) {
          return res.status(401).json({ success: false, message: 'Missing signature headers' });
        }

        const expected = 'sha256=' + crypto.createHmac('sha256', sepaySecret)
          .update(timestamp + '.' + rawBody)
          .digest('hex');

        if (expected !== signature) {
          console.error('[SePay Webhook] Invalid signature mismatch');
          return res.status(401).json({ success: false, message: 'Invalid signature' });
        }
      }

      // SePay usually sends transaction info in the body
      const payload = req.body;
      console.log('Received SePay Webhook:', payload.id ? `Transaction ${payload.id}` : payload);

      if (!payload || !payload.id || !payload.transferContent) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
      }

      const transactionId = String(payload.id);
      const amount = Number(payload.transferAmount || 0);
      const content = String(payload.transferContent).toUpperCase();
      
      // Check if this transaction was already processed
      const { data: existingPayment } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('sepay_transaction_id', transactionId)
        .single();
        
      if (existingPayment) {
        return res.json({ success: true, message: 'Giao dịch đã được xử lý.' });
      }

      // Extract User ID / Family logic from transferContent
      // User sets it up as `GDVV${userId.substring(0,6)}` in SubscriptionPricing.tsx
      // We need to find the user via this partial match, or exact match if they put exact ID
      const orderMatch = content.match(/GDVV([A-Z0-9]+)/);
      if (!orderMatch) {
         return res.json({ success: false, message: 'Không tìm thấy mã đơn hàng hợp lệ.' });
      }
      
      const userRefCode = orderMatch[1].toLowerCase();
      
      // Find the user who has id starting with userRefCode
      const { data: users } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('id', `${userRefCode}%`)
        .limit(1);
        
      const userId = users && users.length > 0 ? users[0].id : null;
      
      if (!userId) {
         return res.json({ success: false, message: 'Không tìm thấy tài khoản người dùng khớp với mã thanh toán.' });
      }

      // Determine plan based on amount
      let plan = 'free';
      let durationDays = 0;
      if (amount >= 190000) {
        plan = 'yearly';
        durationDays = 365;
      } else if (amount >= 45000) {
        plan = 'quarterly';
        durationDays = 90;
      }

      if (durationDays > 0) {
         // Update Subscriptions
         const { data: subData } = await supabaseAdmin
            .from('subscriptions')
            .select('id, current_period_end')
            .eq('user_id', userId)
            .single();
            
         const now = new Date();
         let newEnd = new Date(now.getTime() + durationDays * 86400000);
         
         if (subData?.current_period_end) {
             const currentEnd = new Date(subData.current_period_end);
             if (currentEnd > now) {
                 newEnd = new Date(currentEnd.getTime() + durationDays * 86400000);
             }
         }

         const subUpdate = {
             user_id: userId,
             plan: plan,
             status: 'active',
             current_period_end: newEnd.toISOString(),
             sepay_transaction_id: transactionId,
             amount_paid: amount
         };

         let currentSubId = subData?.id;
         if (currentSubId) {
             await supabaseAdmin.from('subscriptions').update(subUpdate).eq('id', currentSubId);
         } else {
             const { data: newSub } = await supabaseAdmin.from('subscriptions').insert(subUpdate).select().single();
             currentSubId = newSub?.id;
         }

         // Insert Payment log
         await supabaseAdmin.from('payments').insert({
             user_id: userId,
             subscription_id: currentSubId,
             sepay_transaction_id: transactionId,
             amount: amount,
             plan: plan,
             status: 'completed',
             raw_webhook: payload,
             confirmed_at: new Date().toISOString()
         });
      }

      return res.json({ success: true, message: 'Xử lý giao dịch thành công.' });
    } catch (err: any) {
      console.error('[SePay Webhook Exception]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Vite development middleware OR Production Static Server
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    (async () => {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      
      const PORT = Number(process.env.PORT) || 3000;
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    })();
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }

export default app;

// Smart fallback itinerary generator function
function generateFallbackItinerary(input: any) {
  const stops = input.routeStops || [];
  const stayStops = stops.filter((s: any) => s.type === 'stay' || s.type === 'destination');
  const primaryDest = stayStops[0]?.name || 'Đà Nẵng & Hội An';
  const secondDest = stayStops[1]?.name || 'Cam Ranh';

  return {
    title: `Hành Trình Gia Đình Vi Vu: ${stops.map((s: any) => s.name).join(' → ') || 'Đa Điểm Đến'}`,
    totalDays: 4,
    summary: `Kế hoạch 4 ngày 3 đêm kết hợp di chuyển thông minh giữa ${primaryDest} và ${secondDest}. Lịch trình được thiết kế nhịp độ cân bằng, thời gian ăn uống nghỉ ngơi phù hợp cho cả trẻ em và người lớn.`,
    familyAdvice: [
      'Nên mang theo đồ ăn nhẹ và nước ấm cho các bé trên các chặng xe di chuyển đường dài.',
      'Lưu giữ thông tin liên hệ khách sạn & chuẩn bị kem chống nắng, xịt côn trùng cho gia đình.',
      'Sử dụng các khoảng thời gian nghỉ trưa từ 12:30 - 14:30 để bé hồi phục sức khỏe trước khi đi chơi chiều.',
    ],
    days: [
      {
        dayNumber: 1,
        date: input.tripWindow?.startDate || '2026-08-08',
        cityName: stops[1]?.name || primaryDest,
        theme: 'Khởi hành & Nhận phòng khách sạn, Khám phá văn hóa',
        activities: [
          {
            time: '07:00',
            title: 'Khởi hành chuyến đi',
            category: 'Transport',
            description: `Di chuyển từ ${stops[0]?.name || 'TP.HCM'} bằng ${input.journeyLegs?.[0]?.transportMode || 'máy bay'} đi ${stops[1]?.name || primaryDest}.`,
            locationName: stops[0]?.name || 'Sân bay Tân Sơn Nhất',
            estimatedCost: 'Đã thanh toán',
            familyTip: 'Đến sân bay/ga trước 90 phút để làm thủ tục thong thả.',
          },
          {
            time: '11:30',
            title: 'Thưởng thức bữa trưa đặc sản địa phương',
            category: 'Restaurant',
            description: 'Bữa trưa đậm đà hương vị địa phương tại quán ăn gia đình thoáng mát.',
            locationName: `Trung tâm ${stops[1]?.name || primaryDest}`,
            estimatedCost: '350.000đ / người',
            familyTip: 'Ưu tiên các món ăn dễ tiêu cho bé sau chuyến di chuyển.',
          },
          {
            time: '14:00',
            title: 'Nhận phòng Khách sạn & Nghỉ ngơi',
            category: 'Hotel',
            description: 'Làm thủ tục check-in khách sạn, cất hành lý và cho bé chợp mắt dưỡng sức.',
            locationName: input.accommodations?.[0]?.name || 'Khách sạn trung tâm',
            estimatedCost: 'Đã đặt chỗ',
            familyTip: 'Nhờ lễ tân chuẩn bị thêm gối và nước ấm cho bé.',
          },
          {
            time: '16:00',
            title: 'Tham quan & Check-in sống ảo',
            category: 'Attraction',
            description: 'Dạo quanh các khu danh thắng nổi tiếng, chụp ảnh kỉ niệm gia đình.',
            locationName: `Khu du lịch nổi tiếng ${stops[1]?.name || primaryDest}`,
            estimatedCost: '150.000đ / người',
            familyTip: 'Thời tiết chiều mát mẻ rất thích hợp cho người lớn tuổi và trẻ nhỏ.',
          },
          {
            time: '18:30',
            title: 'Bữa tối ấm cúng & Phố đêm',
            category: 'Restaurant',
            description: 'Thưởng thức hải sản tươi sống và không gian nhộn nhịp về đêm.',
            locationName: `Phố ẩm thực ${stops[1]?.name || primaryDest}`,
            estimatedCost: '400.000đ / người',
            familyTip: 'Chọn quán ăn sạch sẽ, bãi đỗ xe rộng rãi.',
          },
        ],
      },
      {
        dayNumber: 2,
        date: '2026-08-09',
        cityName: stops[2]?.name || secondDest,
        theme: 'Di chuyển chặng giữa & Trải nghiệm nghỉ dưỡng biển',
        activities: [
          {
            time: '08:00',
            title: 'Ăn sáng & Cà phê thư thái',
            category: 'Restaurant',
            description: 'Bữa sáng đong đầy năng lượng và thưởng thức ly cà phê đậm đà.',
            locationName: 'Quán cà phê sân vườn',
            estimatedCost: '100.000đ / người',
            familyTip: 'Không gian xanh mát giúp bé vui chơi an toàn.',
          },
          {
            time: '12:00',
            title: 'Di chuyển chặng thứ hai',
            category: 'Transport',
            description: `Di chuyển chặng ${stops[1]?.name || primaryDest} → ${stops[2]?.name || secondDest} bằng ${input.journeyLegs?.[1]?.transportMode || 'xe limousine'}.`,
            locationName: `Chặng ${stops[1]?.name || primaryDest} - ${stops[2]?.name || secondDest}`,
            estimatedCost: '250.000đ / người',
            familyTip: 'Dừng nghỉ giữa chặng 15 phút nếu thành viên bị say xe.',
          },
          {
            time: '17:30',
            title: 'Tắm biển & Dạo bãi Dài',
            category: 'Attraction',
            description: 'Cả nhà hòa mình vào làn nước biển trong xanh và cát trắng mịn.',
            locationName: `Bãi biển ${stops[2]?.name || secondDest}`,
            estimatedCost: 'Miễn phí',
            familyTip: 'Mặc áo phao cho các bé khi xuống biển.',
          },
        ],
      },
    ],
  };
}

startServer();
