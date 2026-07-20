import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { NotificationListener } from "@/components/NotificationListener";
import "./globals.css";
import ClarityProvider from "@/components/ClarityProvider";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KodaSync - Turn customer conversations into Jira tickets with AI",
  description: "Stop rewatching user interviews. KodaSync automatically extracts high-signal friction points from Fireflies or Fathom calls and turns them into ready-to-code Jira tickets—complete with user stories, acceptance criteria, and timestamped links to the evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClarityProvider>
          {children}
          <NotificationListener />
        </ClarityProvider>



      </body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-L0MQG65CFH"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-L0MQG65CFH');
        `}
      </Script>
    </html>
  );
}