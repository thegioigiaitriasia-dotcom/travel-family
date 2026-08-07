-- Tạo dữ liệu mẫu công khai (Demo Mode)

INSERT INTO public.trips (id, title, cover_image, start_date, end_date, duration_days, status, is_public, destinations, budget, data)
VALUES (
  'trip-demo-1',
  'Đà Lạt Mộng Mơ 3N2Đ',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
  '2024-06-15',
  '2024-06-17',
  3,
  'upcoming',
  true,
  '["Đà Lạt", "Lâm Đồng"]'::jsonb,
  '{"min": 5000000, "max": 8000000}'::jsonb,
  '{"memberCount": 4, "placeCount": 12, "foodCount": 6, "accommodationCount": 1}'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trips (id, title, cover_image, start_date, end_date, duration_days, status, is_public, destinations, budget, data)
VALUES (
  'trip-demo-2',
  'Phú Quốc Mùa Hè',
  'https://images.unsplash.com/photo-1551694672-ce2a48858e72?w=800&q=80',
  '2024-07-10',
  '2024-07-14',
  5,
  'planning',
  true,
  '["Phú Quốc", "Kiên Giang"]'::jsonb,
  '{"min": 15000000, "max": 25000000}'::jsonb,
  '{"memberCount": 4, "placeCount": 8, "foodCount": 10, "accommodationCount": 1}'::jsonb
) ON CONFLICT (id) DO NOTHING;
