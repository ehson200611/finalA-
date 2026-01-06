"use client";

import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import logo from "../../assets/layout/images/logo.jpg";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Footer = () => {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (pathname.startsWith(`/${locale}/admin`)) {
    return null;
  }

  if (!mounted) return null;

  return (
    <footer
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-cyan-100 text-[#02202B]"
      } border-t border-gray-300`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={logo}
                alt="logo"
                width={500}
                height={500}
                priority
                className="w-13 h-10"
              />
              <p className="leading-4 font-bold text-xs">
                A Plus <br /> Education center
              </p>
            </Link>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
            <div className="flex gap-3">
              <Link
                href="#"
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-lg bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t("navigation.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.courses")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t("courses.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("courses.english")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("courses.programming")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("courses.design")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("courses.marketing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t("contacts.title")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <Link
                  href="mailto:info@educenter.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  info@educenter.com
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <Link
                  href="tel:+992000000000"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +992 (00) 000-00-00
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {t("contacts.address")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-300 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} EduCenter. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
