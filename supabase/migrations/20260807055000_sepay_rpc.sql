CREATE OR REPLACE FUNCTION process_sepay_payment(
  p_content TEXT,
  p_amount NUMERIC,
  p_secret TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_plan_id TEXT;
  v_period_end TIMESTAMP;
BEGIN
  -- Basic auth check
  IF p_secret != 'SEPAY_SECRET_123' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Determine user ID based on GDVV + substring
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE p_content ILIKE '%GDVV' || UPPER(SUBSTRING(id::TEXT FROM 1 FOR 6)) || '%'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found in content: ' || p_content);
  END IF;

  -- Determine plan based on amount
  IF p_amount >= 199000 THEN
    v_plan_id := 'yearly';
    v_period_end := NOW() + INTERVAL '1 year';
  ELSIF p_amount >= 50000 THEN
    v_plan_id := 'quarterly';
    v_period_end := NOW() + INTERVAL '3 months';
  ELSE
    RETURN jsonb_build_object('success', false, 'message', 'Amount too low: ' || p_amount);
  END IF;

  -- Update or insert subscription
  INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_end, updated_at)
  VALUES (v_user_id, v_plan_id, 'active', v_period_end, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET plan_id = EXCLUDED.plan_id,
      status = 'active',
      current_period_end = EXCLUDED.current_period_end,
      updated_at = NOW();

  -- Log payment
  INSERT INTO public.payments (user_id, amount, status, metadata)
  VALUES (v_user_id, p_amount, 'completed', jsonb_build_object('content', p_content));

  RETURN jsonb_build_object('success', true, 'user_id', v_user_id, 'plan', v_plan_id);
END;
$$;
