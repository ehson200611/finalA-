//app/[locale]/layout.jsx
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

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const safeLocale = locale || "en";

  const seo = {
    en: {
      title: "A+ Education Center — English courses in Tajikistan",
      description:
        "A+ Education Center offers professional English courses for children and adults. Online and offline learning in Tajikistan.",
      keywords:
        "English courses, English language, study English, APlusTJ, education center",
    },
    ru: {
      title: "A+ Education Center — Курсы английского языка",
      description:
        "A+ Education Center — курсы английского языка для детей и взрослых. Онлайн и офлайн обучение.",
      keywords:
        "курсы английского, английский язык, обучение английскому, APlusTJ",
    },
    tj: {
      title: "A+ Education Center — Курси забони англисӣ",
      description:
        "A+ Education Center курси касбии забони англисӣ барои кӯдакон ва калонсолон.",
      keywords: "курси англисӣ, забони англисӣ, омӯзиши англисӣ, APlusTJ",
    },
  };

  const current = seo[safeLocale] || seo.en;

  const baseUrl = "https://aplus.tj";
  const currentUrl = `${baseUrl}/${safeLocale}`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,

    metadataBase: new URL(baseUrl),

    openGraph: {
      title: current.title,
      description: current.description,
      url: currentUrl,
      siteName: "A+ Education Center",
      locale: safeLocale,
      type: "website",
      images: [
        {
          url: `${baseUrl}/seo-preview.jpg`,
          width: 1200,
          height: 630,
          alt: "A+ Education Center",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
      images: [`${baseUrl}/seo-preview.jpg`],
    },

    alternates: {
      canonical: currentUrl,
      languages: {
        en: `${baseUrl}/en`,
        ru: `${baseUrl}/ru`,
        tj: `${baseUrl}/tj`,
        "x-default": `${baseUrl}/en`,
      },
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    icons: {
      icon: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  const supportedLocales = ["en", "ru", "tj"];
  const safeLocale = supportedLocales.includes(locale) ? locale : "en";

  const messages = await getMessages(safeLocale);

  // SEO data for structured data
  const seo = {
    en: {
      description:
        "A+ Education Center offers professional English courses for children and adults. Online and offline learning in Tajikistan.",
    },
    ru: {
      description:
        "A+ Education Center — курсы английского языка для детей и взрослых. Онлайн и офлайн обучение.",
    },
    tj: {
      description:
        "A+ Education Center курси касбии забони англисӣ барои кӯдакон ва калонсолон.",
    },
  };

  const current = seo[safeLocale] || seo.en;

  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "A+ Education Center",
    url: "https://aplus.tj",
    logo: "https://aplus.tj/logo.jpg",
    description: current.description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "TJ",
      addressLocality: "Dushanbe",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["en", "ru", "tj"],
    },
    sameAs: [
      // Add social media links here if available
    ],
  };

  return (
    <html lang={safeLocale} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
