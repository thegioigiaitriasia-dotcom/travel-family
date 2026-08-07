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
    const { email, password, name, familyId } = req.body;
    if (!email || !password || !name || !familyId) return res.status(400).json({ success: false, message: 'Thieu thong tin.' });
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name, family_id: familyId } });
    if (authError) return res.status(400).json({ success: false, message: authError.message });
    if (authData?.user) {
      await supabaseAdmin.from('profiles').update({ family_account_id: familyId, role: 'Thanh vien' }).eq('id', authData.user.id);
      await supabaseAdmin.rpc('increment_family_member', { f_id: familyId });
    }
    return res.json({ success: true, userId: authData.user.id, message: 'Tao tai khoan thanh cong.' });
  } catch (err: any) { return res.status(500).json({ success: false, message: err.message }); }
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

app.post('/api/generate-plan', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 'unknown';
  if (!checkRateLimit(ip)) return res.status(429).json({ success: false, error: 'Qua nhieu yeu cau.' });
  try {
    const tripInput = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.json({ success: true, source: 'fallback', plan: { title: 'Lich trinh mac dinh', totalDays: 1, summary: '', days: [] } });
    const startTime24h = tripInput.tripWindow?.startTime || '07:00';
    const endTime24h = tripInput.tripWindow?.endTime || '20:00';
    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
    const prompt = 'Lap lich trinh du lich gia dinh. Tu ' + (tripInput.tripWindow?.startDate || '') + ' (' + startTime24h + ') den ' + (tripInput.tripWindow?.endDate || '') + ' (' + endTime24h + '). Diem dung: ' + JSON.stringify(tripInput.routeStops || []) + '. Thanh vien: ' + JSON.stringify(tripInput.travelers || {}) + '. YEU CAU: startTime/endTime HH:MM 24h. Ngay 1 bat dau ' + startTime24h + '. Ngay cuoi ket thuc ' + endTime24h + '.';
    const schema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, totalDays: { type: Type.NUMBER }, summary: { type: Type.STRING }, familyAdvice: { type: Type.ARRAY, items: { type: Type.STRING } }, days: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { dayNumber: { type: Type.NUMBER }, date: { type: Type.STRING }, cityName: { type: Type.STRING }, theme: { type: Type.STRING }, activities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { startTime: { type: Type.STRING }, endTime: { type: Type.STRING }, title: { type: Type.STRING }, category: { type: Type.STRING }, description: { type: Type.STRING }, locationName: { type: Type.STRING }, estimatedCost: { type: Type.STRING }, familyTip: { type: Type.STRING } }, required: ['startTime', 'endTime', 'title', 'category', 'description'] } } }, required: ['dayNumber', 'cityName', 'theme', 'activities'] } } }, required: ['title', 'totalDays', 'summary', 'days'] };
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt, config: { systemInstruction: 'JSON tieng Viet, thoi gian 24h HH:MM', responseMimeType: 'application/json', responseSchema: schema } });
    const plan = JSON.parse(response.text || '{}');
    const gKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    const enriched = await enrichPlan(plan, gKey);
    return res.json({ success: true, source: 'gemini', plan: enriched });
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

export default app;