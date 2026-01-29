import type { Metadata } from "next";
import { Inter, Gaegu, Jua } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const gaegu = Gaegu({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-gaegu" });
const jua = Jua({ weight: ["400"], subsets: ["latin"], variable: "--font-jua" });

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
      <body className={`${inter.variable} ${gaegu.variable} ${jua.variable} font-gaegu antialiased`}>
        {children}
      </body>
    </html>
  );
}
