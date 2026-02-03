import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

const ibmPlexSansKR = IBM_Plex_Sans_KR({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "도담 | 우리아이 도담하개 예쁘개",
  description: "사랑스러운 우리아이의 새로운 스타일을 AI로 미리 시뮬레이션하고 맞춤형 케어 제품을 추천받으세요.",
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
    description: "사랑스러운 우리아이의 새로운 스타일을 AI로 미리 시뮬레이션하세요.",
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
