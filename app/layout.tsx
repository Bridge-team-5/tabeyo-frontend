import "./globals.css";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/context/language-context";
import { CartProvider } from "@/context/cart-context";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TABEYO",
  description: "Scan any menu · Get instant explanations",
  icons: {
    icon: "/menu.png",
  },
};

type Language = "en" | "ko" | "ja";

function getInitialLang(val: string | undefined): Language {
  if (val === "ko" || val === "ja") return val;
  return "en";
}

export default async function RootLayout({
                                           children,
                                         }: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialLang = getInitialLang(cookieStore.get("app_lang")?.value);

  return (
      <html lang={initialLang} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
      <LanguageProvider initialLang={initialLang}>
        <CartProvider>{children}</CartProvider>
      </LanguageProvider>
      </body>
      </html>
  );
}