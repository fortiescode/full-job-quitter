import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://fulljogquitter.netlify.app"),
  title: "Full Jog Quitter — Plan Your Escape from the 9-to-5 race and achieve financial freedom",
  icons: {
    icon: "/faviconnew.svg",
  },
  description:
    "Track savings, calculate your financial runway, and execute your exit strategy with confidence.",
  openGraph: {
    title: "Full Jog Quitter — Plan Your Escape from the 9-to-5 race and achieve financial freedom",
    description:
      "Track savings, calculate your financial runway, and execute your exit strategy with confidence.",
    url: "https://fulljogquitter.netlify.app",
    siteName: "Full Jog Quitter",
    locale: "en_US",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Full Jog Quitter — Plan Your Escape from the 9-to-5 race and achieve financial freedom",
    description:
      "Track savings, calculate your financial runway, and execute your exit strategy with confidence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#f5f5f7] text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
