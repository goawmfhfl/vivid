-- 공개 계정삭제요청 접수를 위해 inquiries 스키마 확장
-- 1) 비로그인 요청 저장을 위해 user_id nullable 허용
-- 2) 요청자 식별/출처 필드 추가
-- 3) public_account_deletion 출처일 때 requester_email 필수

alter table public.inquiries
  alter column user_id drop not null;

alter table public.inquiries
  add column if not exists requester_email text,
  add column if not exists requester_name text,
  add column if not exists request_source text not null default 'app_inquiry',
  add column if not exists is_authenticated_request boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inquiries_public_source_requester_email_check'
  ) then
    alter table public.inquiries
      add constraint inquiries_public_source_requester_email_check
      check (
        request_source <> 'public_account_deletion'
        or requester_email is not null
      );
  end if;
end
$$;

create index if not exists idx_inquiries_request_source_created_at
  on public.inquiries (request_source, created_at desc);

create index if not exists idx_inquiries_type_created_at
  on public.inquiries (type, created_at desc);
