# FinTrack — Finance Tracker Personal

Dashboard personal pentru urmărirea cheltuielilor, integrat cu BT CSV export.

## Stack
- **Frontend**: React 18 + Recharts
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel (free)

---

## Setup complet (30 minute)

### 1. Supabase
1. Creează cont gratuit pe [supabase.com](https://supabase.com)
2. New project → alege un nume și parolă
3. Du-te la **SQL Editor** → paste conținutul din `supabase_schema.sql` → Run
4. Du-te la **Authentication → Users → Add user** → adaugă email + parolă
5. Du-te la **Settings → API** → copiază:
   - `Project URL`
   - `anon public` key

### 2. Repo GitHub
```bash
git init
git add .
git commit -m "init: FinTrack"
git remote add origin https://github.com/TU/finance-tracker.git
git push -u origin main
```

### 3. Vercel
1. [vercel.com](https://vercel.com) → New Project → Import din GitHub
2. **Environment Variables** — adaugă:
   ```
   REACT_APP_SUPABASE_URL     = https://xxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJ...
   ```
3. Deploy → gata, primești un URL de forma `finance-tracker.vercel.app`

---

## Utilizare

### Import BT
1. BT24 → Conturi → Căutare tranzacții → Export CSV
2. Pe site → **Import BT** → drag & drop CSV
3. Review categorii → Import

### Manual
Site → **Tranzacții** → butonul **Adaugă**

### Buget
Site → **Buget** → completează sumele per categorie per lună → Salvează

---

## Structura proiect
```
src/
  components/Layout.jsx    — sidebar + topbar
  pages/
    Dashboard.jsx          — grafice + KPIs
    Transactions.jsx       — lista + adăugare
    Budget.jsx             — buget vs real
    Import.jsx             — import CSV BT
  hooks/useData.js         — queries Supabase
  lib/
    supabase.js            — client
    constants.js           — categorii + reguli auto-detectie
supabase_schema.sql        — schema DB
```
