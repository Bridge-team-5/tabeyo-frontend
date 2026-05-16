import "./globals.css";
import { LanguageProvider } from "@/context/language-context";
import {CartProvider} from "@/context/cart-context";

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </head>
        <body suppressHydrationWarning>
          <LanguageProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </LanguageProvider>
        </body>
      </html>
  );
}