import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const outfit = localFont({
  src: "./fonts/Outfit-Variable.ttf",
  variable: "--font-outfit",
  display: "swap",
});

const ibmPlexSansKR = localFont({
  src: [
    { path: "./fonts/IBMPlexSansKR-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/IBMPlexSansKR-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSansKR-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSansKR-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/IBMPlexSansKR-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "도담 | 우리아이 도담하개 예쁘개",
  description: "사랑스러운 우리아이의 새로운 스타일을 미리 시뮬레이션하고 맞춤형 케어 제품을 추천받으세요.",
  openGraph: {
    title: "우리아이 도담하개 예쁘개 | 도담",
    description: "사진 한 장으로 확인하는 우리아이의 완벽한 변신. 도담에서 미리 경험해보세요.",
    url: "https://dodamdodam-mu.vercel.app/",
    siteName: "도담 (Dodam)",
    images: [
      {
        url: "https://dodamdodam-mu.vercel.app/hero_poodle_clean.png",
        width: 1200,
        height: 630,
        alt: "도담 반려견 스타일링 시뮬레이션",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "도담 | 우리아이 도담하개 예쁘개",
    description: "사랑스러운 우리아이의 새로운 스타일을 미리 시뮬레이션하세요.",
    images: ["https://dodamdodam-mu.vercel.app/hero_poodle_clean.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} ${ibmPlexSansKR.variable} font-ibm-plex antialiased`}>
        {/* Naver Maps Global Script */}
        <Script
          strategy="beforeInteractive"
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${(process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '').trim()}&submodules=geocoder`}
        />
        {children}
      </body>
    </html>
  );
}
