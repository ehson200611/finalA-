import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Настройка заголовков для разрешения cross-origin запросов
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "89.169.2.116",
        port: "8080",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "aplus.tj",
        pathname: "/media/**",
      },
    ],
    // Разрешить неоптимизированные изображения для внешних источников
    unoptimized: false,
    // Обработка ошибок изображений
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Игнорировать ошибки загрузки изображений
    minimumCacheTTL: 60,
    // Используем default loader, но для внешних URL лучше использовать unoptimized
    loader: 'default',
    // Разрешить загрузку изображений с любыми расширениями
    formats: ['image/avif', 'image/webp'],
  },
};

// Оборачиваем конфиг в плагин
export default withNextIntl(nextConfig);
