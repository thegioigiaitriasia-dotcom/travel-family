import express from 'express';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tcpbxxwcljnuxwprfwvm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const app = express();
app.use(express.json({ limit: '10mb', verify: (req, _res, buf) => { (req as any).rawBody = buf.toString(); } }));

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, max = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) { rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs }); return true; }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/create-sub-account', async (req, res) => {
  try {
    const { email, password, name, familyId, role } = req.body;
    if (!email || !password || !name || !familyId) return res.status(400).json({ success: false, message: 'Thieu thong tin.' });
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name, family_id: familyId } });
    if (authError) return res.status(400).json({ success: false, message: authError.message });
    if (authData?.user) {
      await supabaseAdmin.from('profiles').update({ family_account_id: familyId, role: role || 'Thanh vien' }).eq('id', authData.user.id);
    }
    return res.json({ success: true, userId: authData.user.id, message: 'Tao tai khoan thanh cong.' });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
});

/**
 * /api/join-family
 * Luá»“ng má»i thÃ nh viÃªn ÄÃšNG:
 *  1. XÃ¡c thá»±c invite_code â†’ láº¥y family_account_id
 *  2. Táº¡o Supabase Auth user vá»›i pseudo-email: username@invitecode.giadinhvivu.com
 *  3. GÃ¡n profile vÃ o gia Ä‘Ã¬nh (family_account_id, role = ThÃ nh viÃªn)
 *  4. Tráº£ vá» pseudo_email Ä‘á»ƒ client tá»± Ä‘Äƒng nháº­p
 */
app.post('/api/join-family', async (req, res) => {
  try {
    const { displayName, inviteCode, password } = req.body;
    if (!displayName || !inviteCode || !password) {
      return res.status(400).json({ success: false, message: 'Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ TÃªn, MÃ£ má»i vÃ  Máº­t kháº©u.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±.' });
    }

    const code = inviteCode.trim().toUpperCase();
    const username = displayName.trim().toLowerCase().replace(/\s+/g, '.');

    // 1. TÃ¬m gia Ä‘Ã¬nh theo invite_code
    const { data: familyData, error: familyError } = await supabaseAdmin
      .from('family_accounts')
      .select('id, family_name, invite_code, owner_id')
      .eq('invite_code', code)
      .maybeSingle();

    if (familyError || !familyData) {
      return res.status(404).json({ success: false, message: 'MÃ£ lá» i má» i khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng kiá»ƒm tra láº¡i vá»›i TrÆ°á»Ÿng nhÃ³m.' });
    }

    // 2. Táº¡o pseudo-email: username@invitecode.giadinhvivu.com
    const pseudoEmail = `${username}@${code.toLowerCase()}.giadinhvivu.com`;

    // Kiểm tra pseudo-email đã tồn tại chưa (query profiles - hiệu quả hơn listUsers)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', pseudoEmail)
      .maybeSingle();
    if (existingProfile) {
      return res.status(409).json({ success: false, message: `Tên đăng nhập "${displayName}" đã được dùng trong gia đình này. Vui lòng chọn tên khác.` });
    }

    // 3. Táº¡o Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: pseudoEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: displayName.trim(),
        family_id: familyData.id,
        family_name: familyData.family_name,
        invite_code: code,
      }
    });

    if (authError) {
      return res.status(400).json({ success: false, message: `KhÃ´ng thá»ƒ táº¡o tÃ i khoáº£n: ${authError.message}` });
    }

    const newUserId = authData.user?.id;
    if (!newUserId) {
      return res.status(500).json({ success: false, message: 'Lá»—i há»‡ thá»‘ng khi táº¡o tÃ i khoáº£n.' });
    }

    // 4. GÃ¡n vÃ o gia Ä‘Ã¬nh trong báº£ng profiles
    await supabaseAdmin.from('profiles').upsert({
      id: newUserId,
      family_account_id: familyData.id,
      full_name: displayName.trim(),
      role: 'ThÃ nh viÃªn',
      is_admin: false,
      status: 'active',
      updated_at: new Date().toISOString(),
    });

    return res.json({
      success: true,
      pseudoEmail,
      familyName: familyData.family_name,
      userId: newUserId,
      message: `TÃ i khoáº£n "${displayName}" Ä‘Ã£ Ä‘Æ°á»£c táº¡o vÃ  gia nháº­p gia Ä‘Ã¬nh "${familyData.family_name}" thÃ nh cÃ´ng!`
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.post('/api/setup-new-user', async (req, res) => {
  try {
    const { userId, email, fullName, familyName } = req.body;
    if (!userId || !email || !fullName) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const familyId = `fam-${userId.slice(0, 8)}`;
    const inviteCode = `VIVU-${Math.floor(1000 + Math.random() * 9000)}`;

    // Tạo profile với Service Role Key (bypass RLS hoàn toàn)
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      role: 'Trưởng nhóm',
      family_account_id: familyId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error('[setup-new-user] Profile upsert error:', profileError.message);
    }

    // Tạo family_account
    const { error: familyError } = await supabaseAdmin.from('family_accounts').upsert({
      id: familyId,
      family_name: familyName,
      owner_id: userId,
      invite_code: inviteCode,
      members_count: 1,
      created_at: new Date().toISOString(),
    });

    if (familyError) {
      console.error('[setup-new-user] Family account upsert error:', familyError.message);
    }

    return res.json({ success: true, familyId, inviteCode });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/update-profile', async (req, res) => {
  try {
    const { userId, updates } = req.body;
    if (!userId || !updates) return res.status(400).json({ success: false, message: 'Missing userId or updates' });
    const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId);
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/get-profile', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId as string).maybeSingle();
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, profile: data });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/get-profiles', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Missing authorization header' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ success: false, message: 'Invalid token' });

    // Láº¥y táº¥t cáº£ profile vÃ¬ admin cÃ³ quyá»n xem (thá»±c táº¿ nÃªn check is_admin = true)
    const { data, error } = await supabaseAdmin.from('profiles').select('*');
    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, profiles: data });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/get-family-members', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'Missing authorization header' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('family_account_id')
      .eq('id', user.id)
      .single();
    
    if (profileError) return res.status(400).json({ success: false, message: profileError.message });
    if (!profile?.family_account_id) return res.json({ success: true, members: [], familyInfo: null });

    const familyId = profile.family_account_id;

    const [membersRes, familyRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('family_account_id', familyId),
      supabaseAdmin.from('family_accounts').select('*').eq('id', familyId).maybeSingle(),
    ]);
    if (membersRes.error) return res.status(400).json({ success: false, message: membersRes.error.message });
    return res.json({
      success: true,
      members: membersRes.data || [],
      familyInfo: familyRes.data || null
    });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/places/search', async (req, res) => {
  try {
    const { query } = req.body;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey || !query) return res.status(400).json({ error: 'Missing' });
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'places.displayName,places.photos,places.formattedAddress,places.types,places.rating' },
      body: JSON.stringify({ textQuery: query, languageCode: 'vi' })
    });
    return res.json(await r.json());
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

app.get('/api/places/photo', async (req, res) => {
  try {
    const { name, photo_reference } = req.query as Record<string, string>;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing API key' });
    const photoUrl = name
      ? 'https://places.googleapis.com/v1/' + name + '/media?maxHeightPx=800&key=' + apiKey
      : photo_reference
      ? 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=' + photo_reference + '&key=' + apiKey
      : '';
    if (!photoUrl) return res.status(400).json({ error: 'Missing params' });
    const r = await fetch(photoUrl);
    if (!r.ok) return res.status(r.status).json({ error: 'Photo fetch failed' });
    const buf = await r.arrayBuffer();
    res.set('Content-Type', r.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(buf));
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
});

async function enrichPlan(plan: any, googleApiKey: string) {
  if (!plan?.days) return plan;
  for (const day of plan.days) {
    for (const act of (day.activities || [])) {
      const type = (act.category || '').toLowerCase();
      if (type === 'transport' || !act.locationName || act.locationName.length < 3) continue;
      try {
        const { data: db } = await supabaseAdmin.from('poi_database').select('image_url').ilike('name', '%' + act.locationName + '%').limit(1);
        if (db?.[0]?.image_url) { act.imageUrl = db[0].image_url; continue; }
        if (!googleApiKey) continue;
        const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': googleApiKey, 'X-Goog-FieldMask': 'places.photos,places.formattedAddress' },
          body: JSON.stringify({ textQuery: act.locationName + ' ' + (day.cityName || ''), languageCode: 'vi' })
        });
        const gd = await r.json();
        if (gd.places?.[0]?.photos?.[0]) {
          const img = 'https://places.googleapis.com/v1/' + gd.places[0].photos[0].name + '/media?maxHeightPx=800&key=' + googleApiKey;
          act.imageUrl = img;
          await supabaseAdmin.from('poi_database').upsert({ name: act.locationName, category: act.category || 'Attraction', address: gd.places[0].formattedAddress || '', city: day.cityName || '', image_url: img, description: act.description || '', source: 'ai_auto_fetch' }, { onConflict: 'name,city' });
        }
      } catch {}
    }
  }
  return plan;
}

async function callAIModel(sysPrompt: string, prompt: string, responseFormat: 'json_object' | 'text' = 'json_object'): Promise<string> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (deepseekKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          response_format: { type: responseFormat },
          messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: prompt }]
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Lỗi DeepSeek API');
      }
      const resData = await response.json();
      return resData.choices[0].message.content;
    } catch (e) {
      if (!geminiKey) throw e;
      console.log('DeepSeek failed, falling back to Gemini', e);
    }
  }

  if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: sysPrompt,
        responseMimeType: responseFormat === 'json_object' ? 'application/json' : 'text/plain',
      }
    });
    return response.text || '';
  }

  throw new Error('Chưa cấu hình API Key cho DeepSeek hoặc Gemini');
}

app.post('/api/generate-plan', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 'unknown';
  if (!checkRateLimit(ip, 50, 60000)) return res.status(429).json({ success: false, error: 'Qua nhieu yeu cau.' });
  try {
    const tripInput = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'Chưa cấu hình API Key (DEEPSEEK_API_KEY hoặc GEMINI_API_KEY)' });
    const startTime24h = tripInput.tripWindow?.startTime || '07:00';
    const endTime24h = tripInput.tripWindow?.endTime || '20:00';
    const prompt = 'Lap lich trinh du lich gia dinh. Tu ' + (tripInput.tripWindow?.startDate || '') + ' (' + startTime24h + ') den ' + (tripInput.tripWindow?.endDate || '') + ' (' + endTime24h + '). Diem dung: ' + JSON.stringify(tripInput.routeStops || []) + '. Thanh vien: ' + JSON.stringify(tripInput.travelers || {}) + '. YEU CAU: startTime/endTime HH:MM 24h. Ngay 1 bat dau ' + startTime24h + '. Ngay cuoi ket thuc ' + endTime24h + '.';
    const sysPrompt = 'Bạn là chuyên gia thiết kế lịch trình. Luôn xuất kết quả dạng JSON nguyên bản hợp lệ, KHÔNG dùng markdown. BẠN PHẢI TẠO DỮ LIỆU THỰC TẾ. Trả về JSON Object có: title, totalDays, summary, familyAdvice (array), days (array các ngày: dayNumber, date, cityName, theme, activities (array: startTime, endTime, title, category, description, locationName, estimatedCost, familyTip)).';
    let jsonText = await callAIModel(sysPrompt, prompt, 'json_object');
    if (jsonText.startsWith('```')) { const match = jsonText.match(/```(?:json)?([\s\S]*?)```/); if (match) jsonText = match[1].trim(); }
    const plan = JSON.parse(jsonText);
    const gKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    const enriched = await enrichPlan(plan, gKey);
    return res.json({ success: true, source: 'deepseek_chat', plan: enriched });
  } catch (err: any) { return res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/sepay-webhook', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload?.id || !payload?.transferContent) return res.status(400).json({ success: false, message: 'Invalid payload' });
    const transactionId = String(payload.id);
    const amount = Number(payload.transferAmount || 0);
    const content = String(payload.transferContent).toUpperCase();
    const { data: ep } = await supabaseAdmin.from('payments').select('id').eq('sepay_transaction_id', transactionId).single();
    if (ep) return res.json({ success: true, message: 'Da xu ly.' });
    const m = content.match(/GDVV([A-Z0-9]+)/);
    if (!m) return res.json({ success: false, message: 'Khong tim thay ma.' });
    const { data: users } = await supabaseAdmin.from('profiles').select('id').ilike('id', m[1].toLowerCase() + '%').limit(1);
    if (!users?.[0]?.id) return res.json({ success: false, message: 'Khong tim thay nguoi dung.' });
    const userId = users[0].id;
    const plan = amount >= 990000 ? 'yearly' : 'quarterly';
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + (plan === 'yearly' ? 12 : 3));
    const sub = { user_id: userId, plan, status: 'active', sepay_transaction_id: transactionId, trial_ends_at: endsAt.toISOString(), current_period_end: endsAt.toISOString() };
    const { data: sd } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', userId).single();
    if (sd?.id) { await supabaseAdmin.from('subscriptions').update(sub).eq('id', sd.id); }
    else { await supabaseAdmin.from('subscriptions').insert(sub); }
    await supabaseAdmin.from('payments').insert({ user_id: userId, sepay_transaction_id: transactionId, amount, plan, status: 'completed', confirmed_at: new Date().toISOString() });
    return res.json({ success: true });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/suggest-alternative', async (req, res) => {
  try {
    const { activity, reason, city } = req.body;
    if (!activity || !reason) return res.status(400).json({ success: false, message: 'Missing parameters' });
    
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, error: 'DEEPSEEK_API_KEY hoặc GEMINI_API_KEY chưa được cấu hình' });
    
    const prompt = `Gia đình đang đi du lịch tại ${city || 'Việt Nam'}. Họ có hoạt động '${activity}' nhưng muốn đổi vì lý do '${reason}'. Hãy gợi ý 2 địa điểm/hoạt động thay thế gần đó, phù hợp với gia đình.`;
    const sysPrompt = `Bạn là chuyên gia du lịch. Trả về JSON nguyên bản, KHÔNG dùng markdown. Định dạng: { "options": [{ "id": "ai-opt-1", "title": "Tên hoạt động gợi ý", "placeName": "Tên địa điểm", "distance": "Khoảng cách ước tính", "reason": "Lý do gợi ý", "cost": 150000 }] }`;
    let jsonText = await callAIModel(sysPrompt, prompt, 'json_object');
    if (jsonText.startsWith('```')) { const match = jsonText.match(/```(?:json)?([\s\S]*?)```/); if (match) jsonText = match[1].trim(); }
    const data = JSON.parse(jsonText);
    
    return res.json({ success: true, options: data.options });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default app;