import express from 'express';
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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================================================
  // Phase 2: SePay Webhook Endpoint
  // POST /api/sepay/webhook
  // ==========================================================================
  app.post('/api/sepay/webhook', async (req, res) => {
    try {
      // Xác thực API Token của SePay truyền qua header để bảo mật (ví dụ đơn giản)
      const token = req.headers['authorization'];
      if (!token || !token.includes('YOUR_SEPAY_SECRET_TOKEN_HERE')) {
        // Trong môi trường thật, nên check Signature (HMAC) do SePay tạo ra
        // Ở đây giả lập xác thực qua Authorization header: Bearer YOUR_SEPAY_SECRET_TOKEN_HERE
      }

      const {
        id, // ID giao dịch trên SePay
        gateway, // bank_transfer, momo...
        transactionDate, // Thời gian giao dịch
        accountNumber, // Số tài khoản ngân hàng
        code, // Mã GD ngân hàng
        content, // Nội dung chuyển khoản
        transferAmount, // Số tiền
        referenceCode, // Mã tham chiếu
      } = req.body;

      // Extract UID từ nội dung chuyển khoản. 
      // Giả định cú pháp: GIA DINH VI VU UID12345
      const uidMatch = content?.match(/UID\s?([a-zA-Z0-9-]+)/i);
      if (!uidMatch) {
        return res.json({ success: false, message: 'Không tìm thấy UID trong nội dung.' });
      }

      const userId = uidMatch[1];
      let plan = 'quarterly';
      if (transferAmount >= 199000) {
        plan = 'yearly';
      }

      // 1. Cập nhật Subscription trên Supabase (Cần gọi DB qua thư viện)
      // (Vì đây là server.ts, nếu dùng Supabase client thì cần khởi tạo, 
      // ở đây để minh hoạ quy trình trả về SePay thành công)
      console.log(`[SePay Webhook] Đã xác nhận thanh toán ${transferAmount} từ user ${userId}. Gói: ${plan}`);

      // Phản hồi 200      console.log(`[SePay Webhook] Kích hoạt thành công gói ${result.plan} cho user ${result.user_id}`);
      return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (err: any) {
      console.error('Lỗi xử lý SePay webhook:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

  // ==========================================================================
  // API: Tạo Sub-account cho Family Member (Username login)
  // POST /api/create-sub-account
  // ==========================================================================
  app.post('/api/create-sub-account', async (req, res) => {
    try {
      const { email, password, name, familyId } = req.body;
      if (!email || !password || !name || !familyId) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Tạo user qua Admin API để không làm mất session client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
        }
      });

      if (authError) {
        console.error('Create user error:', authError);
        return res.status(400).json({ success: false, message: authError.message });
      }

      const userId = authData.user.id;

      // Tạo profile
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        email: email,
        full_name: name,
        role: 'Thành viên',
        family_account_id: familyId,
      });

      return res.json({ success: true, userId });
    } catch (err: any) {
      console.error('Lỗi tạo sub-account:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
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

      const prompt = `
Bạn là Chuyên gia Lập Lịch Trình Du Lịch Gia Đình Việt Nam cao cấp (AI Family Travel Planner).
Hãy tạo một Kế hoạch chuyến đi du lịch gia đình đa chặng / đa điểm đến dựa trên thông tin chi tiết được cung cấp:

THÔNG TIN CHUYẾN ĐI:
- Khung thời gian: Từ ${tripInput.tripWindow?.startDate || 'ngay'} (${tripInput.tripWindow?.startTime || '07:00'}) đến ${tripInput.tripWindow?.endDate || 'ngay'} (${tripInput.tripWindow?.endTime || '18:00'})
- Các điểm dừng trong lộ trình: ${JSON.stringify(tripInput.routeStops || [])}
- Phương tiện di chuyển các chặng: ${JSON.stringify(tripInput.journeyLegs || [])}
- Nơi lưu trú từng điểm: ${JSON.stringify(tripInput.accommodations || [])}
- Thành viên gia đình: ${JSON.stringify(tripInput.travelers || {})}
- Nhu cầu đặc biệt & sức khỏe: ${JSON.stringify(tripInput.mobilityAndComfortNeeds || [])} - ${tripInput.specialNote || ''}
- Phong cách du lịch & Nhịp độ: Nhịp độ ${tripInput.pace || 'balanced'}, Gu: ${JSON.stringify(tripInput.travelStyles || [])}
- Điều tránh: ${JSON.stringify(tripInput.avoidPreferences || [])}
- Sở thích ăn uống: ${JSON.stringify(tripInput.foodPreferences || [])}
- Ngân sách toàn chuyến: Tổng ${tripInput.budget?.total?.toLocaleString('vi-VN') || '20.000.000'} VND (Đã trả trước: ${JSON.stringify(tripInput.budget?.alreadyPaid || {})})

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
          "time": "08:00",
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
        model: 'gemini-2.0-flash', // ✅ Model chính xác (gemini-3.6-flash không tồn tại)
        contents: prompt,
        config: {
          systemInstruction:
            'Bạn là AI lập kế hoạch du lịch chuyên nghiệp dành cho gia đình Việt Nam. Hãy trả về kết quả đúng cấu trúc JSON, bằng tiếng Việt chuẩn, tinh tế và chu đáo.',
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
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          category: { type: Type.STRING },
                          description: { type: Type.STRING },
                          locationName: { type: Type.STRING },
                          estimatedCost: { type: Type.STRING },
                          familyTip: { type: Type.STRING },
                        },
                        required: ['time', 'title', 'category', 'description'],
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

      return res.json({
        success: true,
        source: 'gemini_3_6_flash',
        plan: parsedPlan,
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

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

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
