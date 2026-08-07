-- Cho phép xem các chuyến đi công khai (Demo)
CREATE POLICY "trips_select_public" ON public.trips
  FOR SELECT USING (is_public = true);
