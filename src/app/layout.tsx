import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "포켓몬 챔피언스 데이터",
  description:
    "포켓몬 챔피언스 데이터를 한국어 중심으로 쉽고 친근하게 정리한 도감, 파티 빌더, 계산기 사이트입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
