"use client";

import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
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
          <div className="col-span-2 lg:col-span-1 md:col-span-1 space-y-4` lg:order-1 order-1">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Image
                src={logo}
                alt="logo"
                width={500}
                height={500}
                priority
                className="w-13 h-10"
              />
              <p className="leading-4 font-bold lg:text-xs text-sm">
                A Plus <br /> Education center
              </p>
            </Link>
            <p className="text-sm text-muted-foreground py-3">{t("description")}</p>
            <div className="space-y-2 text-sm lg:block flex gap-3">
              <Link
                target="_blank"
                href="https://www.facebook.com/aplustj"
                className="flex gap-2 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-103"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" /> Facebook
              </Link>
              <Link
                target="_blank"
                href="https://www.instagram.com/a_plus.tj"
                className="flex gap-2 rounded-lg bg-accent/10 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-103"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" /> Instagram
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:order-2 order-3 lg:pl-10">
            <h3 className="font-semibold text-foreground mb-4">
              {t("navigation.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.home")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.courses")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/faq`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("navigation.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div className="lg:order-3 order-4">
            <h3 className="font-semibold text-foreground mb-4">
              {t("courses.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}/courses/#english`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("courses.english")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses/#russian`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("courses.programming")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/courses/#preschools`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("courses.design")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:order-4 order-2 col-span-2 lg:col-span-1 md:col-span-1">
            <h3 className="font-semibold text-foreground mb-4">
              {t("contacts.title")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <Link
                    target="_blank"
                    href="mailto:a.plus.dushanbe@gmail.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    a.plus.dushanbe@gmail.com
                  </Link>

                  <Link
                    target="_blank"
                    href="mailto:hr.aplus@outlook.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    hr.aplus@outlook.com
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <Link
                    target="_blank"
                    href="tel:+992982300330"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    +992 (98) 230 03 30
                  </Link>
                  <Link
                    target="_blank"
                    href="tel:+992073100300"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    +992 (07) 310 03 00
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <Link
                  target="_blank"
                  href="https://maps.app.goo.gl/sLjhSWNk3uhezULq8"
                  className="text-sm text-muted-foreground"
                >
                  {t("contacts.address")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-300 text-center">
          <p className="text-sm text-muted-foreground">
             A+ Education Center © {currentYear}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
