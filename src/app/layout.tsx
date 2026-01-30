import type { Metadata } from "next";
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
  title: "도담 도담 | 우리 아이의 새로운 스타일 시각화",
  description: "우리 강아지의 새로운 스타일을 미리 보고, 맞춤형 케어 제품을 추천받으세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} ${ibmPlexSansKR.variable} font-ibm-plex antialiased`}>
        {children}
      </body>
    </html>
  );
}
