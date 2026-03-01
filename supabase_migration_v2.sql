create table if not exists categories (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text not null,
  icon        text not null default '📦',
  color       text not null default '#94a3b8',
  sort_order  int default 0,
  created_at  timestamptz default now(),
  unique(user_id, name)
);

create table if not exists dashboard_widgets (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  widget_type text not null,
  position    int not null default 0,
  visible     boolean default true,
  unique(user_id, widget_type)
);

create table if not exists user_settings (
  user_id                 uuid references auth.users(id) on delete cascade primary key,
  currency                text default 'RON',
  monthly_income_target   numeric(10,2) default 0,
  monthly_savings_target  numeric(10,2) default 0,
  updated_at              timestamptz default now()
);

alter table categories enable row level security;
alter table dashboard_widgets enable row level security;
alter table user_settings enable row level security;

drop policy if exists "user_own_cat" on categories;
drop policy if exists "user_own_dw" on dashboard_widgets;
drop policy if exists "user_own_us" on user_settings;

create policy "user_own_cat" on categories for all using (auth.uid() = user_id);
create policy "user_own_dw" on dashboard_widgets for all using (auth.uid() = user_id);
create policy "user_own_us" on user_settings for all using (auth.uid() = user_id);

create or replace function insert_default_data(p_user_id uuid)
returns void as $$
begin
  insert into categories (user_id, name, icon, color, sort_order) values
    (p_user_id, 'Chirie/Utilitati',     '🏠', '#6366f1', 1),
    (p_user_id, 'Mancare/Grocery',      '🛒', '#f59e0b', 2),
    (p_user_id, 'Transport',            '🚗', '#3b82f6', 3),
    (p_user_id, 'Abonamente',           '📱', '#8b5cf6', 4),
    (p_user_id, 'Divertisment',         '🎬', '#ec4899', 5),
    (p_user_id, 'Sanatate',             '💊', '#10b981', 6),
    (p_user_id, 'Investitii/Economii',  '📈', '#06b6d4', 7),
    (p_user_id, 'Altele',               '📦', '#94a3b8', 8)
  on conflict do nothing;

  insert into dashboard_widgets (user_id, widget_type, position, visible) values
    (p_user_id, 'kpi_venit',            1,  true),
    (p_user_id, 'kpi_cheltuieli',       2,  true),
    (p_user_id, 'kpi_economii',         3,  true),
    (p_user_id, 'kpi_rata_economii',    4,  true),
    (p_user_id, 'kpi_tranzactii',       5,  true),
    (p_user_id, 'kpi_cea_mai_mare',     6,  true),
    (p_user_id, 'chart_venit_chelt',    7,  true),
    (p_user_id, 'chart_categorii',      8,  true),
    (p_user_id, 'chart_economii',       9,  true),
    (p_user_id, 'list_recente',         10, true)
  on conflict do nothing;

  insert into user_settings (user_id) values (p_user_id)
  on conflict do nothing;
end;
$$ language plpgsql security definer;
