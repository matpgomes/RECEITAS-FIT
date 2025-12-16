import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { QueryProvider } from "@/lib/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Receitas Fit - Receitas Saudáveis e Deliciosas",
    template: "%s | Receitas Fit",
  },
  description: "Descubra receitas fit deliciosas e saudáveis. Planeje suas refeições, crie listas de compras inteligentes e acompanhe seu progresso.",
  keywords: ["receitas fit", "receitas saudáveis", "alimentação saudável", "dieta", "low carb", "fitness"],
  authors: [{ name: "Receitas Fit" }],
  creator: "Receitas Fit",
  manifest: "/manifest.json",
  themeColor: "#9B6FFF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Receitas Fit",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Receitas Fit",
    title: "Receitas Fit - Receitas Saudáveis e Deliciosas",
    description: "Descubra receitas fit deliciosas e saudáveis. Planeje suas refeições e acompanhe seu progresso.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
