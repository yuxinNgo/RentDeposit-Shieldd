import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { AppClientProvider } from "@/components/providers/app-client-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "RentDeposit Shield",
  description: "Rental deposit protection infrastructure powered by Stellar and Soroban.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--app-bg)] text-[var(--text-primary)]">
        <AppClientProvider>
          {children}
          <ToasterProvider />
        </AppClientProvider>
      </body>
    </html>
  );
}
