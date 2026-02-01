/**
 * Corporate design themes: MullenLowe (default) and Audi.
 * Each theme defines fonts, logos, colors, and front-page content.
 */

export type ThemeId = "mullenlowe" | "audi";

export interface ThemeFrontPageFeature {
  title: string;
  description: string;
  icon: string; // path to icon image
  iconAlt: string;
}

export interface ThemeFrontPage {
  title: string;
  subtitle: string;
  tagline: string;
  ctaText: string;
  features: ThemeFrontPageFeature[];
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  /** CSS font-family value (must match a loaded font) */
  fontFamily: string;
  /** Path to logo image (used in header, main page, login) */
  logo: string;
  logoAlt: string;
  /** Favicon path for browser tab */
  favicon: string;
  colors: {
    primary: string;
    primaryDark: string;
    /** CSS gradient value for buttons */
    buttonGradient: string;
    /** Inline style for logo container / primary surfaces */
    logoContainerStyle: string;
  };
  frontPage: ThemeFrontPage;
}

const MULLENLOWE_FRONT_PAGE: ThemeFrontPage = {
  title: "Meet&Greet",
  subtitle: "by MullenLowe GGK",
  tagline: "Pripojte sa k účastníkom eventu a zdieľajte svoje digitálne vizitky",
  ctaText: "Pokračovať na prihlásenie",
  features: [
    {
      title: "Vytvorte profil",
      description: "Pridajte svoje údaje a fotku pre digitálnu vizitku",
      icon: "/1-Black.png",
      iconAlt: "Create Profile Icon",
    },
    {
      title: "Hľadajte účastníkov",
      description: "Nájdite a prepojte sa s ostatnými účastníkmi eventu",
      icon: "/2-Black.png",
      iconAlt: "Search Participants Icon",
    },
    {
      title: "Zdieľajte kontakty",
      description: "Stiahnite si vCard alebo zdieľajte svoj profil",
      icon: "/3-Black.png",
      iconAlt: "Share Contacts Icon",
    },
  ],
};

const AUDI_FRONT_PAGE: ThemeFrontPage = {
  title: "Meet&Greet",
  subtitle: "by Audi",
  tagline: "Digitálne vizitky a networking na vašich eventoch",
  ctaText: "Prihlásiť sa",
  features: [
    {
      title: "Vytvorte profil",
      description: "Vaše údaje a fotka v jednej digitálnej vizitke",
      icon: "/1-Black.png",
      iconAlt: "Create Profile Icon",
    },
    {
      title: "Hľadajte účastníkov",
      description: "Prepojte sa s ostatnými účastníkmi",
      icon: "/2-Black.png",
      iconAlt: "Search Participants Icon",
    },
    {
      title: "Zdieľajte kontakty",
      description: "vCard a QR kód pre jednoduché zdieľanie",
      icon: "/3-Black.png",
      iconAlt: "Share Contacts Icon",
    },
  ],
};

export const THEMES: Record<ThemeId, ThemeConfig> = {
  mullenlowe: {
    id: "mullenlowe",
    name: "MullenLowe GGK",
    fontFamily: "var(--font-wolpe-pegasus), sans-serif",
    logo: "/Octopus-icon.png",
    logoAlt: "MullenLowe GGK",
    favicon: "/Octopus-icon.png",
    colors: {
      primary: "#232323",
      primaryDark: "#323232",
      buttonGradient: "radial-gradient(ellipse at bottom, #323232 0%, #232323 100%)",
      logoContainerStyle: "linear-gradient(135deg, #232323 75%, #232323 100%)",
    },
    frontPage: MULLENLOWE_FRONT_PAGE,
  },
  audi: {
    id: "audi",
    name: "Audi",
    fontFamily: "var(--font-audi), sans-serif",
    logo: "/audi-logo.svg",
    logoAlt: "Audi",
    favicon: "/audi-favicon.svg",
    colors: {
      primary: "#000000",
      primaryDark: "#1a1a1a",
      buttonGradient: "linear-gradient(135deg, #bb0a30 0%, #8b0823 100%)",
      logoContainerStyle: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
    },
    frontPage: AUDI_FRONT_PAGE,
  },
};

export const THEME_IDS: ThemeId[] = ["mullenlowe", "audi"];

export function getTheme(id: ThemeId): ThemeConfig {
  return THEMES[id];
}
