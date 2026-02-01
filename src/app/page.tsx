"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Home() {
  const { theme } = useTheme();
  const { frontPage, colors, logo, logoAlt } = theme;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden main-page-container">
      <ThemeSwitcher />

      <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-[100px] relative z-10">
        <main className="text-center max-w-2xl mx-auto w-full flex flex-col items-center justify-center">
          {/* Logo: circle + icon (MullenLowe) or logo only (e.g. Audi rings) */}
          <div className="mb-12 pt-15">
            <div className="relative inline-block main-page-logo">
              {theme.mainPageLogoNoCircle ? (
                <div className="mx-auto mb-2 flex items-center justify-center image-container">
                  <Image
                    src={logo}
                    alt={logoAlt}
                    width={200}
                    height={69}
                    className="h-16 w-auto object-contain"
                    priority
                    quality={85}
                    sizes="(max-width: 768px) 160px, 200px"
                    fetchPriority="high"
                    unoptimized={logo.endsWith(".svg")}
                  />
                </div>
              ) : (
                <div
                  className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center image-container"
                  style={{ background: colors.logoContainerStyle }}
                >
                  <Image
                    src={logo}
                    alt={logoAlt}
                    width={96}
                    height={96}
                    className="w-15 h-20 object-contain"
                    priority
                    quality={85}
                    sizes="96px"
                    fetchPriority="high"
                    unoptimized={logo.endsWith(".svg")}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center mb-2">
              <div className="text-center">
                <h1 className={`text-4xl md:text-5xl text-gray-900 font-bold ${theme.mainPageLogoNoCircle ? "mb-2" : "mb-1"}`}>
                  {frontPage.title}
                </h1>
                <p className="text-sm text-gray-500 font-normal">
                  {frontPage.subtitle}
                </p>
              </div>
            </div>
            <p className="text-xl text-gray-600 font-bold">
              {frontPage.tagline}
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg transition-colors duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 theme-cta-button"
            style={{ background: colors.buttonGradient }}
          >
            {frontPage.ctaText}
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          {/* Features */}
          <div className="mt-10 mb-15 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {frontPage.features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-5 bg-gray-50 rounded-lg"
                style={{ boxShadow: "0 15px 15px 0 rgba(0,0,0,0.075)" }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: "#ffffffff" }}
                >
                  {theme.mainPageLogoNoCircle ? (
                    <span className="text-2xl font-bold text-gray-900 leading-none">
                      {index + 1}
                    </span>
                  ) : (
                    <Image
                      src={feature.icon}
                      alt={feature.iconAlt}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                      priority
                      quality={80}
                      sizes="48px"
                      fetchPriority="high"
                    />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-snug">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
