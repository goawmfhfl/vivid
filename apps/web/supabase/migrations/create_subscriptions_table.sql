-- Subscriptions 테이블 생성 (서버 검증용)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due')) DEFAULT 'active',
  stripe_subscription_id TEXT UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_expires_idx ON public.subscriptions(status, expires_at);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON public.subscriptions(stripe_subscription_id);

-- Row Level Security (RLS) 설정
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 구독 정보만 조회 가능, 어드민은 모든 구독 정보 조회 가능
CREATE POLICY "Users can view their own subscription or admins can view all" ON public.subscriptions
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 서버 사이드에서만 구독 정보를 생성/수정할 수 있도록 (클라이언트 직접 접근 차단)
-- 필요시 서비스 롤로만 접근 가능하도록 설정

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.set_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_subscriptions_updated_at();

-- 코멘트 추가
COMMENT ON TABLE public.subscriptions IS '사용자 구독 정보 테이블 (서버 검증용)';
COMMENT ON COLUMN public.subscriptions.plan IS '구독 플랜: free 또는 pro';
COMMENT ON COLUMN public.subscriptions.status IS '구독 상태: active, canceled, expired, past_due';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'Stripe 구독 ID (결제 시스템 연동용)';
COMMENT ON COLUMN public.subscriptions.expires_at IS '구독 만료일 (null이면 무제한)';

