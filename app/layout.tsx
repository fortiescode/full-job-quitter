import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AccentColorProvider } from "@/components/providers/accent-color-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://fulljogquitter.netlify.app"),
  title: "Full Jog Quitter — Plan Your Escape from the 9-to-5",
  icons: {
    icon: "/fjq-logo.png",
  },
  description:
    "Track savings, calculate your financial runway, and execute your exit strategy with confidence.",
  openGraph: {
    title: "Full Jog Quitter — Plan Your Escape from the 9-to-5",
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
    title: "Full Jog Quitter — Plan Your Escape from the 9-to-5",
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
        <Script
          id="accent-color-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const DEFAULT = '#E8B92F';
                  const color = localStorage.getItem('accent_color') || DEFAULT;
                  const r = parseInt(color.slice(1, 3), 16);
                  const g = parseInt(color.slice(3, 5), 16);
                  const b = parseInt(color.slice(5, 7), 16);
                  const toLinear = (c) => {
                    const s = c / 255;
                    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
                  };
                  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
                  const foreground = lum > 0.5 ? '#1d1d1f' : '#ffffff';
                  const root = document.documentElement;
                  root.style.setProperty('--accent-color', color);
                  root.style.setProperty('--accent-foreground', foreground);
                  root.style.setProperty('--accent-color-10', 'rgba(' + r + ',' + g + ',' + b + ',0.1)');
                  root.style.setProperty('--accent-color-15', 'rgba(' + r + ',' + g + ',' + b + ',0.15)');
                  root.style.setProperty('--accent-color-20', 'rgba(' + r + ',' + g + ',' + b + ',0.2)');
                  root.style.setProperty('--accent-color-30', 'rgba(' + r + ',' + g + ',' + b + ',0.3)');
                  root.style.setProperty('--accent-color-50', 'rgba(' + r + ',' + g + ',' + b + ',0.5)');
                  root.style.setProperty('--accent-color-80', 'rgba(' + r + ',' + g + ',' + b + ',0.8)');
                } catch (e) {}
              })();
            `,
          }}
        />
        <AccentColorProvider>
          {children}
        </AccentColorProvider>
      </body>
    </html>
  );
}
