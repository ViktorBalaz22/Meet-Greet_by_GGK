import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Desktop background image */}
      <div
        aria-hidden="true"
        className="hidden md:block pointer-events-none select-none absolute inset-0 z-[0]"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.05,
        }}
      />
      {/* Mobile background image */}
      <div
        aria-hidden="true"
        className="block md:hidden pointer-events-none select-none absolute inset-0 z-[0]"
        style={{
          backgroundImage: "url('/mobile-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.05,
        }}
      />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-[100px] relative z-10">
        <main className="text-center max-w-2xl mx-auto w-full flex flex-col items-center justify-center">
          {/* Animated Logo */}
          <div className="mb-12 pt-15">
            <div className="relative inline-block">
              <div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #232323 75%, #232323 100%)",
                }}
              >
                <Image
                  src="/Octopus-icon.png"
                  alt="Octopus Icon"
                  width={96}
                  height={96}
                  className="w-15 h-20"
                  priority
                  loading="eager"
                  quality={90}
                />
              </div>
            </div>

            {/* Meet&Greet by MullenLowe GGK */}
            <div className="flex justify-center mb-2">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl text-gray-900 mb-1 font-bold">
                  Meet&Greet
                </h1>
                <p className="text-sm text-gray-500 font-normal">
                  by MullenLowe GGK
                </p>
              </div>
            </div>
            <p className="text-xl text-gray-600 font-bold">
              Pripojte sa k účastníkom eventu a zdieľajte svoje digitálne vizitky
            </p>
          </div>

          {/* CTA Button */}
          <Link
           href="/login"
  className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
  style={{
    background: "radial-gradient(ellipse at bottom, #323232 0%, #232323 100%)",
  }}
>
  Pokračovať na prihlásenie
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
            <div
              className="p-5 bg-gray-50 rounded-lg"
              style={{ boxShadow: "0 15px 15px 0 rgba(0,0,0,0.075)" }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3" style={{ background: "#ffffffff" }}>
                <Image
                  src="/1-Black.png"
                  alt="ML White Icon"
                  width={24}
                  height={24}
                  className="w-18 h-10"
                  priority
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">
                Vytvorte profil
              </h3>
              <p className="text-gray-600 leading-snug">
                Pridajte svoje údaje a fotku pre digitálnu vizitku
              </p>
            </div>

            <div
              className="p-5 bg-gray-50 rounded-lg" 
              style={{ boxShadow: "0 15px 15px 0 rgba(0,0,0,0.075)" }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3" style={{ background: "#ffffffff" }}>
                <Image
                  src="/2-Black.png"
                  alt="ML White Icon"
                  width={24}
                  height={24}
                  className="w-18 h-10"
                  priority
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">
                Hľadajte účastníkov
              </h3>
              <p className="text-gray-600 leading-snug">
                Nájdite a prepojte sa s ostatnými účastníkmi eventu
              </p>
            </div>

            <div
              className="p-5 bg-gray-50 rounded-lg"
              style={{ boxShadow: "0 15px 15px 0 rgba(0,0,0,0.075)" }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3" style={{ background: "#ffffffff" }}>
                <Image
                  src="/3-Black.png"
                  alt="ML White Icon"
                  width={24}
                  height={24}
                  className="w-18 h-10"
                  priority
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-snug">
                Zdieľajte kontakty
              </h3>
              <p className="text-gray-600 leading-snug">
                Stiahnite si vCard alebo zdieľajte svoj profil
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
