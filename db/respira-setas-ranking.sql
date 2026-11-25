create table public.quit_setas_ranking (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 24),
  classic integer not null default 0 check (classic between 0 and 100000),
  extreme integer not null default 0 check (extreme between 0 and 100000)
);
alter table public.quit_setas_ranking enable row level security;
revoke all on public.quit_setas_ranking from public, anon, authenticated;
create index quit_setas_ranking_classic_idx on public.quit_setas_ranking (classic desc, nickname);
create index quit_setas_ranking_extreme_idx on public.quit_setas_ranking (extreme desc, nickname);
