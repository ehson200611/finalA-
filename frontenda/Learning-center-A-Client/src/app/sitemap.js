export default function sitemap() {
  const baseUrl = "https://aplus.tj";
  const locales = ["en", "ru", "tj"];
  const routes = [
    "",
    "about",
    "courses",
    "teachers",
    "test",
    "blogs",
    "contact",
    "faq",
    "vacancy",
  ];

  const sitemapEntries = [];

  // Generate entries for each locale and route
  locales.forEach((locale) => {
    routes.forEach((route) => {
      const url = route ? `${baseUrl}/${locale}/${route}` : `${baseUrl}/${locale}`;
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              route ? `${baseUrl}/${loc}/${route}` : `${baseUrl}/${loc}`,
            ])
          ),
        },
      });
    });
  });

  return sitemapEntries;
}

