# Event Business Cards

Jednoduchá webová aplikácia pre zdieľanie digitálnych vizitiek na eventoch. Hostia sa prihlásia cez magic link, vyplnia svoj profil a môžu si prehliadať a stiahnuť kontakty ostatných účastníkov.

## Funkcie

- **Passwordless autentifikácia** - Magic link cez e-mail
- **Profil účastníka** - Meno, firma, pozícia, fotka, kontaktné údaje
- **Zoznam účastníkov** - Prehľad všetkých účastníkov s vyhľadávaním
- **vCard export** - Stiahnutie kontaktu do telefónu
- **QR kódy** - Zdieľanie profilu cez QR kód
- **Admin panel** - Správa účastníkov a export dát
- **GDPR súhlas** - Povinný súhlas so spracovaním údajov

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Link)
- **Storage**: Supabase Storage (fotky)
- **Styling**: TailwindCSS
- **Deployment**: Vercel

## Inštalácia

1. **Klonujte repozitár**
   ```bash
   git clone <repository-url>
   cd meet-greet-by-ggk
   ```

2. **Nainštalujte závislosti**
   ```bash
   npm install
   ```

3. **Nastavte Supabase**
   - Vytvorte nový projekt na [supabase.com](https://supabase.com)
   - Vyberte EU región
   - Spustite migrácie:
     ```bash
     npx supabase db push
     ```
   - Vytvorte Storage bucket "photos" v Supabase dashboard

4. **Nastavte environment premenné**
   ```bash
   cp .env.example .env.local
   ```
   
   Vyplňte v `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  NEXT_PUBLIC_SUPABASE_CAPTCHA_SITE_KEY=your_hcaptcha_site_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Spustite aplikáciu**
   ```bash
   npm run dev
   ```

6. **Otvorte v prehliadači**
   ```
   http://localhost:3000
   ```

## Použitie

### Pre účastníkov

1. **Prihlásenie**: Zadajte e-mail, skontrolujte e-mail a kliknite na magic link
2. **Profil**: Vyplňte svoje údaje a nahrajte fotku
3. **Zoznam**: Prehliadajte ostatných účastníkov a hľadajte podľa mena/firmy
4. **Kontakty**: Stiahnite si vCard alebo zdieľajte svoj profil

### Pre administrátorov

1. **Admin panel**: Prístup na `/admin` (len pre používateľov s `is_admin = true`)
2. **Správa**: Skrývanie/zobrazovanie profilov účastníkov
3. **Export**: CSV a vCard export všetkých údajov

## Databázová schéma

### profiles
- `id` (UUID, PK) - Referencia na auth.users
- `email` (TEXT) - E-mailová adresa
- `first_name`, `last_name` (TEXT) - Meno a priezvisko
- `company`, `position` (TEXT) - Spoločnosť a pozícia
- `phone`, `linkedin_url` (TEXT) - Kontaktné údaje
- `about` (TEXT) - O mne / hobby
- `photo_path` (TEXT) - Cesta k fotke v Storage
- `hidden` (BOOLEAN) - Skrytý profil
- `is_admin` (BOOLEAN) - Admin oprávnenia
- `agreed_gdpr` (BOOLEAN) - GDPR súhlas
- `created_at`, `updated_at` (TIMESTAMPTZ) - Časové značky

## Bezpečnosť

- **RLS (Row Level Security)** - Používatelia vidia len svoje profily a ne-skryté profily
- **Storage policies** - Používatelia môžu nahrávať len svoje fotky
- **Magic link autentifikácia** - Žiadne heslá
- **GDPR compliance** - Povinný súhlas so spracovaním údajov

## 🚀 Deployment

### Rýchle nasadenie

Pozrite si [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) pre 5-minútové nasadenie.

### Podrobné nasadenie

Kompletný postup nájdete v [DEPLOYMENT.md](./DEPLOYMENT.md).

### Vercel (odporúčané)

1. **Pripojte repozitár k Vercel**
2. **Nastavte environment premenné** v Vercel dashboard
3. **Deploy** - automaticky sa spustí build

### Environment premenné pre produkciu

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_SUPABASE_CAPTCHA_SITE_KEY=your_production_hcaptcha_site_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Vývoj

### Spustenie lokálneho vývoja

```bash
npm run dev
```

### Build pre produkciu

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Licencia

MIT License# Trigger redeploy
# Vercel Cache Buster - Sat Sep 13 11:29:01 CEST 2025
