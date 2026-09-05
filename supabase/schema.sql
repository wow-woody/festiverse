-- Supabase 대시보드 > SQL Editor 에서 전체 실행하세요.

create table if not exists festivals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  start_date date not null,
  end_date date not null,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists performances (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references festivals(id) on delete cascade,
  artist_name text not null,
  genre text,
  stage text,
  start_time timestamptz not null,
  end_time timestamptz,
  headliner boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists performances_festival_id_idx on performances(festival_id);

alter table festivals enable row level security;
alter table performances enable row level security;

-- 앱에서는 누구나 읽을 수 있어야 함
create policy "public can read festivals" on festivals
  for select using (true);

create policy "public can read performances" on performances
  for select using (true);

-- 관리자 웹은 로그인(Supabase Auth)한 사용자만 쓰기 가능
create policy "authenticated can write festivals" on festivals
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can write performances" on performances
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
