import "../globals.css";
import ProgressProvider from "../providers/ProgressProvider";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/header";
import ProvidersStore from "@/components/ProvidersStore";
import Footer from "@/components/layout/footer";
import MuiThemeProvider from "@/app/providers/MuiThemeProvider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

// Define supported locales for reuse
const supportedLocales = ["en", "ru", "tj"];

export async function generateMetadata(props) {
  const params = await props.params; // ✅ Correctly awaited
  const locale = params.locale;
  const safeLocale = supportedLocales.includes(locale) ? locale : "en";

  const messages = (await import(`../../../messages/${safeLocale}.json`))
    .default;
  const t = messages.Layout;

  return { title: "A+ Education center" };
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  const supportedLocales = ["en", "ru", "tj"];
  const safeLocale = supportedLocales.includes(locale) ? locale : "en";

  const messages = await getMessages(safeLocale);

  return (
    <html lang={safeLocale} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <NextIntlClientProvider locale={safeLocale} messages={messages}>
            <ProvidersStore>
              <ProgressProvider />
              <Header />
              <MuiThemeProvider>{children}</MuiThemeProvider>
              <Footer />
            </ProvidersStore>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
