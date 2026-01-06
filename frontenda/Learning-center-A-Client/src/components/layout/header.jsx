"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import logo from "@/assets/layout/images/logo.jpg";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Moon, Sun, X, Menu, ChevronDown, User2 } from "lucide-react";
import Linkto from "@/components/linkto";
import { usePathname, useRouter } from "next/navigation";
import { Select, MenuItem, Button } from "@mui/material";
import ConsultationModal from "@/components/layout/ConsultationModal";
import {
  useGetEnglishCoursesQuery,
  useGetPreSchoolCoursesQuery,
  useGetRussianCoursesQuery,
} from "@/store/slices/coursesApi";
import { useGetMeProfileQuery } from "@/store/slices/profile";

const Header = () => {
  const { data: meProfile, refetch } = useGetMeProfileQuery();
  const isAdmin =
    meProfile?.role === "superadmin" || meProfile?.role === "admin";

  const t = useTranslations("header");
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const { data: enCourses } = useGetEnglishCoursesQuery();
  const { data: ruCourses } = useGetRussianCoursesQuery();
  const { data: preSchoolCourses } = useGetPreSchoolCoursesQuery();

  const [showModal, setShowModal] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [open, setOpen] = useState(false);

  function goToProfile() {
    if (isAdmin) {
      router.push(`/${locale}/admin`);
    } else {
      router.push(`/${locale}/profile`);
    }
  }

  const routes = [
    { href: "/", label: t("main") },
    { href: "/test", label: t("test") },
    { href: "/teachers", label: t("teachers") },
    { href: "/courses", label: t("courses") },
    { href: "/vacancy", label: t("vacancy") },
    { href: "/contact", label: t("contacts") },
    { href: "/about", label: t("about") },
    { href: "/blogs", label: t("pageTitle") }
  ];

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isActive = (path) => {
    if (path === "/") {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === `/${locale}${path}`;
  };

  const handleChangeLang = (event) => {
    const newLocale = event.target.value;
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  // JUDOGONA RENDER - Har category alohida
  const renderEnglishCourses = () => {
    if (!enCourses?.length) return null;

    return (
      <div className="border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
        <div className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          Английские курсы
        </div>
        {enCourses?.map((course) => (
          <Link
            key={`english-${course.id}`}
            href={`/${locale}/courses/#${
              locale === "ru"
                ? course.level_ru
                : locale === "en"
                ? course.level_en
                : course.level_tj
            }`}
            className="px-6 py-2 hover:bg-[#34d3d6]/10 dark:hover:bg-[#34d3d6]/40 rounded-md text-sm transition block"
          >
            {locale === "ru"
              ? course.level_ru
              : locale === "en"
              ? course.level_en
              : course.level_tj || "English Course"}
          </Link>
        ))}
      </div>
    );
  };

  const renderRussianCourses = () => {
    if (!ruCourses?.length) return null;

    return (
      <div className="border-b border-gray-200 dark:border-gray-600 pb-2 mb-2">
        <div className="px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400">
          Русские курсы
        </div>
        {ruCourses?.map((course) => (
          <Link
            key={`russian-${course.id}`}
            href={`/${locale}/courses/#${
              locale === "ru"
                ? course.level_ru
                : locale === "en"
                ? course.level_en
                : course.level_tj
            }`}
            className="px-6 py-2 hover:bg-[#34d3d6]/10 dark:hover:bg-[#34d3d6]/40 rounded-md text-sm transition block"
          >
            {locale === "ru"
              ? course.level_ru
              : locale === "en"
              ? course.level_en
              : course.level_tj || "Russian Course"}
          </Link>
        ))}
      </div>
    );
  };

  const renderPreSchoolCourses = () => {
    if (!preSchoolCourses?.length) return null;

    return (
      <div className="pb-2">
        <div className="px-4 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
          Подготовка к школе
        </div>
        {preSchoolCourses?.map((course) => (
          <Link
            key={`preSchools-${course.id}`}
            href={`/${locale}/courses/#${
              locale === "ru"
                ? course.level_ru
                : locale === "en"
                ? course.level_en
                : course.level_tj
            }`}
            className="px-6 py-2 hover:bg-[#34d3d6]/10 dark:hover:bg-[#34d3d6]/40 rounded-md text-sm transition block"
          >
            {locale === "ru"
              ? course.level_ru
              : locale === "en"
              ? course.level_en
              : course.level_tj || "Preschool Course"}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      {showModal && (
        <section className="w-full bg-gradient px-[4%] py-4 flex items-center justify-center  relative">
          <div className="flex items-center justify-center gap-5 pr-10">
            <p className="text-white font-bold text-base lg:text-[20px] animate-bounce">
              {t("freeLesson")}
            </p>
            <button
              onClick={() => setOpen(true)}
              className="bg-white text-black py-1 px-4 rounded-full font-semibold text-sm"
            >
              {t("register")}
            </button>
          </div>

          <button
            onClick={() => setShowModal(false)}
            className="absolute right-2 lg:right-5 top-2 text-black cursor-pointer duration-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </section>
      )}

      <ConsultationModal isOpen={open} onClose={() => setOpen(false)} />

      <nav
        className={`${
          theme === "dark"
            ? "bg-[#0a1a23]/95 backdrop-blur-md text-white border-b border-gray-800"
            : "bg-cyan-100/95 backdrop-blur-md text-[#02202B] border-b border-cyan-200"
        } w-full mx-auto sticky top-0 z-30 flex items-center gap-2 px-[4%] py-2 shadow-modern transition-all duration-300`}
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <Link title={t("main")} href="/" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="logo"
              width={500}
              height={500}
              priority
              className="w-13 h-10"
            />
            <p className="leading-4 font-bold text-sm">
              A Plus <br /> Education center
            </p>
          </Link>

          <div className="hidden lg:flex items-center gap-5 font-medium text-sm relative">
            {routes.map(({ href, label }) => {
              if (href === "/courses") {
                return (
                  <div key={href} className="relative group">
                    <Link
                      href={href}
                      className={`flex items-center gap-1 cursor-pointer transition-all duration-300 hover:text-[#34d3d6] hover:scale-105 relative group ${
                        isActive(href) ? "text-[#34d3d6] font-semibold" : ""
                      }`}
                    >
                      {label}
                      <ChevronDown size={16} />
                    </Link>
                    {/* DROPDOWN MENU - JUDOGONA */}
                    <div
                      className={`${
                        theme === "dark" ? "bg-[#0a1a23]" : "bg-white"
                      } absolute top-full left-0 mt-0 hidden group-hover:flex flex-col rounded-lg shadow-lg py-2 w-80 z-30`}
                    >
                      {renderEnglishCourses()}
                      {renderRussianCourses()}
                      {renderPreSchoolCourses()}

                      {/* No courses message */}
                      {!enCourses?.length &&
                        !ruCourses?.length &&
                        !preSchoolCourses?.length && (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            Курсы не найдены
                          </div>
                        )}
                    </div>
                  </div>
                );
              } else {
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`transition-all duration-300 hover:text-[#34d3d6] hover:scale-105 relative group ${
                      isActive(href) ? "text-[#34d3d6] font-semibold" : ""
                    }`}
                  >
                    {label}
                  </Link>
                );
              }
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Select
              value={locale}
              onChange={handleChangeLang}
              size="small"
              sx={{
                color: theme === "dark" ? "white" : "black",
                borderRadius: "8px",
                "& .MuiOutlinedInput-notchedOutline": { border: 0 },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                },
              }}
              renderValue={(selected) => (
                <div className="flex items-center gap-2">
                  <Image
                    src={`/flags/${selected}.jpg`}
                    alt={selected}
                    width={20}
                    height={14}
                    priority
                    style={{ width: "auto" }}
                  />
                  <span className="uppercase">{selected}</span>
                </div>
              )}
            >
              <MenuItem value="ru">
                <div className="flex items-center gap-2">
                  <Image src="/flags/ru.jpg" alt="RU" width={20} height={14} />
                  Русский
                </div>
              </MenuItem>
              <MenuItem value="en">
                <div className="flex items-center gap-2">
                  <Image src="/flags/en.jpg" alt="EN" width={20} height={14} />
                  English
                </div>
              </MenuItem>
              <MenuItem value="tj">
                <div className="flex items-center gap-2">
                  <Image src="/flags/tj.jpg" alt="TJ" width={20} height={14} />
                  Тоҷикӣ
                </div>
              </MenuItem>
            </Select>

            <Button
              title="Theme"
              onClick={() => setTheme((e) => (e === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>

            {meProfile ? (
              <button
                onClick={() => goToProfile()}
                className="px-4 py-2  bg-linear-to-r from-[#FDEC01] via-[#f9e400] to-[#ffdf3a] text-black rounded-md font-semibold hover:scale-105 transition flex items-center gap-2"
              >
                <User2 size={18} />
                <span>{meProfile?.user_name}</span>
              </button>
            ) : (
              <Linkto text={t("login")} href="/login" />
            )}
          </div>

          <div className="flex lg:hidden">
            <button onClick={() => setMobileMenu(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* mobile */}
      <div
        className={`fixed inset-0 z-50 flex ${
          mobileMenu ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 transition-opacity duration-300 ${
            mobileMenu ? "bg-opacity-50 bg-black/50" : "bg-opacity-0"
          }`}
          onClick={() => setMobileMenu(false)}
        ></div>

        <div
          className={`${
            theme === "dark"
              ? "bg-[#02202B] text-white"
              : "bg-[#F5F7FA] text-black"
          } w-64 h-full shadow-lg p-6 flex flex-col gap-4 fixed right-0 top-0 transform transition-transform duration-300 ${
            mobileMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            className="absolute top-4 right-4"
            onClick={() => setMobileMenu(false)}
          >
            <X size={24} />
          </button>

          {routes.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenu(false)}
              className={`hover:text-[#34d3d6] hover:scale-102 ${
                isActive(href) ? "text-[#34d3d6] font-semibold" : ""
              }`}
            >
              {label}
            </Link>
          ))}

          {meProfile ? (
            <button
              onClick={() => goToProfile()}
              className="px-4 py-2  bg-linear-to-r from-[#FDEC01] via-[#f9e400] to-[#ffdf3a] text-black rounded-md font-semibold hover:scale-105 transition flex items-center gap-2"
            >
              <User2 size={18} />
              <span>{meProfile?.user_name}</span>
            </button>
          ) : (
            <Linkto text={t("login")} href="/login" />
          )}

          <div className="flex items-center gap-5 mt-6">
            <Select
              value={locale}
              onChange={handleChangeLang}
              size="small"
              sx={{
                color: theme === "dark" ? "white" : "black",
                bgcolor: theme === "dark" ? "#02202B" : "#F5F7FA",
                borderRadius: "8px",
                "& .MuiOutlinedInput-notchedOutline": { border: 0 },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                },
              }}
              renderValue={(selected) => (
                <div className="flex items-center gap-2">
                  <Image
                    src={`/flags/${selected}.jpg`}
                    alt={selected}
                    width={20}
                    height={14}
                    priority
                    style={{ width: "auto" }}
                  />
                  <span className="uppercase">{selected}</span>
                </div>
              )}
            >
              <MenuItem value="ru">
                <div className="flex items-center gap-2">
                  <Image src="/flags/ru.jpg" alt="RU" width={20} height={14} />
                  Русский
                </div>
              </MenuItem>
              <MenuItem value="en">
                <div className="flex items-center gap-2">
                  <Image src="/flags/en.jpg" alt="EN" width={20} height={14} />
                  English
                </div>
              </MenuItem>
              <MenuItem value="tj">
                <div className="flex items-center gap-2">
                  <Image src="/flags/tj.jpg" alt="TJ" width={20} height={14} />
                  Тоҷикӣ
                </div>
              </MenuItem>
            </Select>

            <Button
              onClick={() => setTheme((e) => (e === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
