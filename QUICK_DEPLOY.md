# ⚡ Rýchle nasadenie Event Business Cards

## 🚀 5-minútové nasadenie

### 1. Supabase Setup (2 min)
```bash
# 1. Vytvorte projekt na supabase.com (EU región)
# 2. Spustite migrácie
npx supabase db push

# 3. Vytvorte Storage bucket "photos" (private)
# 4. Skopírujte API kľúče
```

### 2. Vercel Deploy (2 min)
```bash
# 1. Pripojte GitHub repozitár na vercel.com
# 2. Pridajte Environment Variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# 3. Deploy!
```

### 3. Post-Deploy (1 min)
```bash
# 1. V Supabase: Auth → URL Configuration
# Site URL: https://your-domain.vercel.app
# Redirect URLs: https://your-domain.vercel.app/app

# 2. Test: Otvorte URL a otestujte login
```

## 🔧 Environment Variables

```bash
# .env.local (lokálne)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel Environment Variables (produkcia)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🧪 Testovanie

1. **Otvorte produkčnú URL**
2. **Kliknite "Pokračovať na prihlásenie"**
3. **Zadajte e-mail a pošlite magic link**
4. **Skontrolujte e-mail a kliknite na link**
5. **Vyplňte profil a otestujte funkcie**

## 🆘 Riešenie problémov

**Magic link nefunguje:**
- Skontrolujte Supabase Auth URL configuration
- Overte redirect URLs

**Fotky sa neukladajú:**
- Skontrolujte Storage bucket "photos" existuje
- Overte Storage policies

**Aplikácia sa nespustí:**
- Skontrolujte Environment Variables
- Overte Supabase API kľúče

## 📞 Podpora

- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js:** [nextjs.org/docs](https://nextjs.org/docs)
