# 🚀 Nasadenie Event Business Cards do produkcie

Tento dokument obsahuje presný postup nasadenia aplikácie do produkčného prostredia.

## 📋 Predpoklady

- [ ] GitHub repozitár s aplikáciou
- [ ] Vercel účet (bezplatný)
- [ ] Supabase účet (bezplatný)
- [ ] Vlastná doména (voliteľné)

## 🗄️ Krok 1: Nastavenie Supabase produkčného prostredia

### 1.1 Vytvorenie Supabase projektu

1. **Prihláste sa na [supabase.com](https://supabase.com)**
2. **Kliknite "New Project"**
3. **Vyplňte údaje:**
   - Organization: Vyberte existujúcu alebo vytvorte novú
   - Project name: `meet-greet-by-ggk-prod`
   - Database Password: Vygenerujte silné heslo (uložte si ho!)
   - Region: **Vyberte EU región** (Frankfurt, London, alebo Paris)
4. **Kliknite "Create new project"**
5. **Počkajte na dokončenie** (2-3 minúty)

### 1.2 Spustenie migrácií

1. **Nainštalujte Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Prihláste sa do Supabase:**
   ```bash
   supabase login
   ```

3. **Pripojte projekt:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Project ref nájdete v Supabase dashboard URL)

4. **Spustite migrácie:**
   ```bash
   supabase db push
   ```

### 1.3 Vytvorenie Storage bucketu

1. **V Supabase dashboard choďte na "Storage"**
2. **Kliknite "New bucket"**
3. **Nastavenia:**
   - Name: `photos`
   - Public: **FALSE** (dôležité pre bezpečnosť!)
4. **Kliknite "Create bucket"**

### 1.4 Nastavenie RLS policies

Storage policies sa vytvoria automaticky cez migrácie, ale skontrolujte ich:

1. **Choďte na "Storage" → "Policies"**
2. **Skontrolujte, že existujú tieto policies:**
   - `Users can upload their own photos`
   - `Users can view all photos`
   - `Users can update their own photos`
   - `Users can delete their own photos`

### 1.5 Získanie API kľúčov

1. **Choďte na "Settings" → "API"**
2. **Skopírujte:**
   - Project URL
   - anon public key
   - service_role key (tajný!)

## 🌐 Krok 2: Nastavenie Vercel

### 2.1 Pripojenie repozitára

1. **Prihláste sa na [vercel.com](https://vercel.com)**
2. **Kliknite "New Project"**
3. **Importujte GitHub repozitár:**
   - Vyberte váš repozitár `Meet-Greet_by_GGK`
   - Framework Preset: **Next.js**
   - Root Directory: `./` (alebo nechajte prázdne)

### 2.2 Konfigurácia projektu

1. **Project Name:** `meet-greet-by-ggk` (alebo váš názov)
2. **Framework:** Next.js
3. **Root Directory:** `./`
4. **Build Command:** `npm run build` (automaticky)
5. **Output Directory:** `.next` (automaticky)
6. **Install Command:** `npm install` (automaticky)

### 2.3 Nastavenie Environment premenných

V Vercel dashboard choďte na "Settings" → "Environment Variables" a pridajte:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Dôležité:**
- Nahraďte `your-project-ref` skutočným project ref z Supabase
- Nahraďte `your-domain` skutočnou doménou z Vercel
- Všetky premenné nastavte pre **Production** environment

### 2.4 Deploy

1. **Kliknite "Deploy"**
2. **Počkajte na dokončenie** (2-5 minút)
3. **Skontrolujte URL:** `https://your-project.vercel.app`

## 🔧 Krok 3: Post-deploy konfigurácia

### 3.1 Aktualizácia Supabase Auth nastavení

1. **V Supabase dashboard choďte na "Authentication" → "URL Configuration"**
2. **Nastavte:**
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/app`
3. **Uložte zmeny**

### 3.2 Testovanie produkčného prostredia

1. **Otvorte produkčnú URL**
2. **Otestujte registráciu nového používateľa**
3. **Skontrolujte magic link v e-maile**
4. **Otestujte všetky funkcie**

## 🌍 Krok 4: Vlastná doména (voliteľné)

### 4.1 Pridanie domény v Vercel

1. **V Vercel dashboard choďte na "Settings" → "Domains"**
2. **Pridajte svoju doménu:**
   - Domain: `app.tvoja-domena.sk`
   - Type: **Production**
3. **Kliknite "Add"**

### 4.2 DNS konfigurácia

1. **V DNS nastaveniach vašej domény pridajte CNAME záznam:**
   ```
   app.tvoja-domena.sk → cname.vercel-dns.com
   ```
2. **Počkajte na propagáciu** (až 24 hodín)

### 4.3 Aktualizácia environment premenných

1. **Aktualizujte `NEXT_PUBLIC_APP_URL`:**
   ```
   NEXT_PUBLIC_APP_URL=https://app.tvoja-domena.sk
   ```
2. **Redeploy aplikácie**

### 4.4 Aktualizácia Supabase nastavení

1. **Aktualizujte Site URL v Supabase:**
   ```
   https://app.tvoja-domena.sk
   ```
2. **Aktualizujte Redirect URLs:**
   ```
   https://app.tvoja-domena.sk/app
   ```

## 🔒 Krok 5: Bezpečnostné nastavenia

### 5.1 HTTPS a Security Headers

Vercel automaticky poskytuje HTTPS, ale môžete pridať custom headers v `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### 5.2 Environment premenné bezpečnosť

- **Nikdy necommitnite `.env.local`** do Git
- **Použite Vercel Environment Variables** pre produkciu
- **Service Role Key držte v tajnosti**

## 📊 Krok 6: Monitoring a Analytics

### 6.1 Vercel Analytics

1. **V Vercel dashboard choďte na "Analytics"**
2. **Aktivujte Vercel Analytics** (bezplatné)
3. **Sledujte performance metriky**

### 6.2 Supabase Monitoring

1. **V Supabase dashboard choďte na "Logs"**
2. **Sledujte API calls a chyby**
3. **Nastavte alerts pre kritické chyby**

## 🧪 Krok 7: Produkčné testovanie

### 7.1 Funkčné testovanie

- [ ] **Landing stránka** - animácie, CTA
- [ ] **Magic link login** - e-mail, redirect
- [ ] **Profilový formulár** - upload fotky, validácia
- [ ] **Zoznam účastníkov** - vyhľadávanie, filtrovanie
- [ ] **vCard export** - download, mobile test
- [ ] **QR kódy** - generovanie, skenovanie
- [ ] **Admin panel** - správa, exporty

### 7.2 Performance testovanie

- [ ] **PageSpeed Insights** - skontrolujte skóre
- [ ] **Mobile testovanie** - responzívnosť
- [ ] **Cross-browser testovanie** - Chrome, Firefox, Safari

### 7.3 Bezpečnostné testovanie

- [ ] **HTTPS** - všetky stránky používajú HTTPS
- [ ] **RLS policies** - používatelia vidia len svoje dáta
- [ ] **Storage access** - privátne fotky

## 🔄 Krok 8: CI/CD a automatizácia

### 8.1 Automatický deploy

Vercel automaticky deployuje pri každom push do main branch:

1. **Push do main branch**
2. **Vercel automaticky build a deploy**
3. **Dostanete notifikáciu o úspešnom deployi**

### 8.2 Environment management

- **Production:** `main` branch
- **Preview:** feature branches
- **Development:** local development

## 📈 Krok 9: Optimalizácia a škálovanie

### 9.1 Database optimalizácia

- **Indexy** - už sú vytvorené v migráciách
- **Connection pooling** - Supabase to rieši automaticky
- **Backup** - Supabase automatické zálohy

### 9.2 CDN a caching

- **Vercel Edge Network** - automatické CDN
- **Image optimization** - Next.js automaticky optimalizuje obrázky
- **Static generation** - kde je to možné

## 🚨 Krok 10: Troubleshooting

### 10.1 Bežné problémy

**Problém: Magic link nefunguje**
- Skontrolujte Supabase Auth URL configuration
- Overte redirect URLs
- Skontrolujte spam priečinok

**Problém: Fotky sa neukladajú**
- Skontrolujte Storage bucket existuje
- Overte Storage policies
- Skontrolujte file size limits

**Problém: RLS blokuje prístup**
- Skontrolujte RLS policies v Supabase
- Overte user authentication
- Skontrolujte user permissions

### 10.2 Logy a debugging

- **Vercel logs:** Vercel dashboard → Functions → View Function Logs
- **Supabase logs:** Supabase dashboard → Logs
- **Browser console:** F12 → Console

## 📞 Podpora

- **Vercel dokumentácia:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase dokumentácia:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js dokumentácia:** [nextjs.org/docs](https://nextjs.org/docs)

## ✅ Checklist nasadenia

- [ ] Supabase projekt vytvorený (EU región)
- [ ] Migrácie spustené
- [ ] Storage bucket vytvorený
- [ ] Vercel projekt pripojený
- [ ] Environment premenné nastavené
- [ ] Deploy úspešný
- [ ] Auth URL konfigurované
- [ ] Vlastná doména (ak potrebná)
- [ ] Produkčné testovanie
- [ ] Monitoring nastavený

**🎉 Gratulujeme! Vaša aplikácia je nasadená v produkcii!**
