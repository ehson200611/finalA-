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
  const { data: meProfile } = useGetMeProfileQuery();
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
    { href: `/${locale}`, label: t("main") },
    { href: `/${locale}/test`, label: t("test") },
    { href: `/${locale}/teachers`, label: t("teachers") },
    { href: `/${locale}/courses`, label: t("courses") },
    { href: `/${locale}/vacancy`, label: t("vacancy") },
    { href: `/${locale}/contact`, label: t("contacts") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/blogs`, label: t("pageTitle") },
  ];

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isActive = (path) => {
    if (path === `/${locale}` || path === `/${locale}/`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === path;
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
            <p className="text-white font-bold text-base lg:text-xl animate-bounce">
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
            ? "bg-[#0a1a23] text-white"
            : "bg-cyan-100 text-[#02202B]"
        } w-full mx-auto sticky top-0 z-30 flex items-center gap-2 px-[4%] py-2 shadow`}
      >
        <div className="flex items-center justify-between gap-2 w-full">
          <Link title={t("main")} href={`/${locale}`} className="flex items-center gap-2">
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
                      className={`flex items-center gap-1 cursor-pointer duration-200 hover:text-[#34d3d6] hover:scale-105 ${
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
                    className={`duration-200 hover:text-[#34d3d6] hover:scale-105 ${
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
                  {locale === "ru" ? (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g clipPath="url(#RU_svg__a)">
                        <path
                          d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M23.254 16.173c.482-1.3.746-2.706.746-4.173 0-1.468-.264-2.874-.746-4.174H.746A11.974 11.974 0 0 0 0 11.999c0 1.468.264 2.874.746 4.174L12 17.217l11.254-1.044Z"
                          fill="#0052B4"
                        />
                        <path
                          d="M12 24c5.16 0 9.559-3.257 11.254-7.827H.747C2.443 20.743 6.841 24 12.001 24Z"
                          fill="#D80027"
                        />
                      </g>
                      <defs>
                        <clipPath id="RU_svg__a">
                          <path fill="#fff" d="M0 0h24v24H0z" />
                        </clipPath>
                      </defs>
                    </svg>
                  ) : locale === "en" ? (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g clipPath="url(#GB_svg__a)">
                        <path
                          d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M2.48 4.693A11.956 11.956 0 0 0 .413 8.868h6.243L2.48 4.693Zm21.106 4.176a11.957 11.957 0 0 0-2.067-4.176L17.344 8.87h6.242ZM.413 15.13a11.957 11.957 0 0 0 2.067 4.176l4.176-4.176H.413ZM19.305 2.48A11.957 11.957 0 0 0 15.13.412v6.243l4.175-4.175ZM4.693 21.518a11.957 11.957 0 0 0 4.176 2.067v-6.243l-4.176 4.176ZM8.869.412A11.957 11.957 0 0 0 4.693 2.48L8.87 6.655V.412Zm6.261 23.173a11.96 11.96 0 0 0 4.175-2.067l-4.175-4.176v6.243Zm2.214-8.455 4.175 4.176a11.957 11.957 0 0 0 2.067-4.176h-6.242Z"
                          fill="#0052B4"
                        />
                        <path
                          d="M23.898 10.435H13.565V.102a12.12 12.12 0 0 0-3.13 0v10.333H.102a12.12 12.12 0 0 0 0 3.13h10.333v10.333a12.12 12.12 0 0 0 3.13 0V13.565h10.333a12.12 12.12 0 0 0 0-3.13Z"
                          fill="#D80027"
                        />
                        <path
                          d="m15.13 15.131 5.356 5.355c.246-.246.48-.503.705-.77l-4.584-4.585H15.13Zm-6.26 0-5.355 5.355c.246.246.503.481.77.705l4.585-4.584V15.13Zm0-6.261v-.001L3.515 3.514a12.03 12.03 0 0 0-.705.77L7.394 8.87H8.87Zm6.26 0 5.356-5.355a12.023 12.023 0 0 0-.77-.705L15.13 7.394V8.87Z"
                          fill="#D80027"
                        />
                      </g>
                      <defs>
                        <clipPath id="GB_svg__a">
                          <path fill="#fff" d="M0 0h24v24H0z" />
                        </clipPath>
                      </defs>
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g clipPath="url(# _svg__a)">
                        <path
                          d="M1.19 6.782A11.952 11.952 0 0 0 0 11.999c0 1.87.428 3.64 1.19 5.217L12 18.26l10.81-1.044A11.953 11.953 0 0 0 24 12c0-1.87-.428-3.64-1.19-5.217L12 5.738 1.19 6.782Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M1.191 17.218A12 12 0 0 0 12.001 24a12 12 0 0 0 10.808-6.782H1.191Z"
                          fill="#6DA544"
                        />
                        <path
                          d="M1.191 6.782H22.81A12 12 0 0 0 12-.001 12 12 0 0 0 1.191 6.782Z"
                          fill="#D80027"
                        />
                        <path
                          d="M9.913 15.132h4.174v-1.774l-.835.417L12 12.523l-1.252 1.252-.835-.417v1.774Zm-2.388-2.088.194.598h.629l-.509.37.195.597-.509-.37-.509.37.195-.598-.509-.37h.629l.194-.597Zm.603-2.086.194.598h.628l-.508.37.194.597-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.597ZM9.85 9.393l.194.598h.628l-.508.37.194.597-.509-.37-.508.37.194-.598-.509-.37h.629l.194-.597Zm6.625 3.651-.194.598h-.629l.509.37-.194.597.508-.37.509.37-.195-.598.51-.37h-.63l-.194-.597Zm-.602-2.086-.195.598h-.628l.508.37-.194.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597Zm-1.722-1.565-.194.598h-.629l.509.37-.195.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597ZM12 8.61l.195.597h.628l-.508.37.194.598-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.598Z"
                          fill="#FFDA44"
                        />
                      </g>
                      <defs>
                        <clipPath id="TJ_svg__a">
                          <path fill="#fff" d="M0 0h24v24H0z" />
                        </clipPath>
                      </defs>
                    </svg>
                  )}
                  <span className="uppercase">{selected}</span>
                </div>
              )}
            >
              <MenuItem value="ru">
                <div className="flex items-center gap-2">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g clipPath="url(#RU_svg__a)">
                      <path
                        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M23.254 16.173c.482-1.3.746-2.706.746-4.173 0-1.468-.264-2.874-.746-4.174H.746A11.974 11.974 0 0 0 0 11.999c0 1.468.264 2.874.746 4.174L12 17.217l11.254-1.044Z"
                        fill="#0052B4"
                      />
                      <path
                        d="M12 24c5.16 0 9.559-3.257 11.254-7.827H.747C2.443 20.743 6.841 24 12.001 24Z"
                        fill="#D80027"
                      />
                    </g>
                    <defs>
                      <clipPath id="RU_svg__a">
                        <path fill="#fff" d="M0 0h24v24H0z" />
                      </clipPath>
                    </defs>
                  </svg>
                  Русский
                </div>
              </MenuItem>
              <MenuItem value="en">
                <div className="flex items-center gap-2">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g clipPath="url(#GB_svg__a)">
                      <path
                        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M2.48 4.693A11.956 11.956 0 0 0 .413 8.868h6.243L2.48 4.693Zm21.106 4.176a11.957 11.957 0 0 0-2.067-4.176L17.344 8.87h6.242ZM.413 15.13a11.957 11.957 0 0 0 2.067 4.176l4.176-4.176H.413ZM19.305 2.48A11.957 11.957 0 0 0 15.13.412v6.243l4.175-4.175ZM4.693 21.518a11.957 11.957 0 0 0 4.176 2.067v-6.243l-4.176 4.176ZM8.869.412A11.957 11.957 0 0 0 4.693 2.48L8.87 6.655V.412Zm6.261 23.173a11.96 11.96 0 0 0 4.175-2.067l-4.175-4.176v6.243Zm2.214-8.455 4.175 4.176a11.957 11.957 0 0 0 2.067-4.176h-6.242Z"
                        fill="#0052B4"
                      />
                      <path
                        d="M23.898 10.435H13.565V.102a12.12 12.12 0 0 0-3.13 0v10.333H.102a12.12 12.12 0 0 0 0 3.13h10.333v10.333a12.12 12.12 0 0 0 3.13 0V13.565h10.333a12.12 12.12 0 0 0 0-3.13Z"
                        fill="#D80027"
                      />
                      <path
                        d="m15.13 15.131 5.356 5.355c.246-.246.48-.503.705-.77l-4.584-4.585H15.13Zm-6.26 0-5.355 5.355c.246.246.503.481.77.705l4.585-4.584V15.13Zm0-6.261v-.001L3.515 3.514a12.03 12.03 0 0 0-.705.77L7.394 8.87H8.87Zm6.26 0 5.356-5.355a12.023 12.023 0 0 0-.77-.705L15.13 7.394V8.87Z"
                        fill="#D80027"
                      />
                    </g>
                    <defs>
                      <clipPath id="GB_svg__a">
                        <path fill="#fff" d="M0 0h24v24H0z" />
                      </clipPath>
                    </defs>
                  </svg>
                  English
                </div>
              </MenuItem>
              <MenuItem value="tj">
                <div className="flex items-center gap-2">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g clipPath="url(# _svg__a)">
                      <path
                        d="M1.19 6.782A11.952 11.952 0 0 0 0 11.999c0 1.87.428 3.64 1.19 5.217L12 18.26l10.81-1.044A11.953 11.953 0 0 0 24 12c0-1.87-.428-3.64-1.19-5.217L12 5.738 1.19 6.782Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M1.191 17.218A12 12 0 0 0 12.001 24a12 12 0 0 0 10.808-6.782H1.191Z"
                        fill="#6DA544"
                      />
                      <path
                        d="M1.191 6.782H22.81A12 12 0 0 0 12-.001 12 12 0 0 0 1.191 6.782Z"
                        fill="#D80027"
                      />
                      <path
                        d="M9.913 15.132h4.174v-1.774l-.835.417L12 12.523l-1.252 1.252-.835-.417v1.774Zm-2.388-2.088.194.598h.629l-.509.37.195.597-.509-.37-.509.37.195-.598-.509-.37h.629l.194-.597Zm.603-2.086.194.598h.628l-.508.37.194.597-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.597ZM9.85 9.393l.194.598h.628l-.508.37.194.597-.509-.37-.508.37.194-.598-.509-.37h.629l.194-.597Zm6.625 3.651-.194.598h-.629l.509.37-.194.597.508-.37.509.37-.195-.598.51-.37h-.63l-.194-.597Zm-.602-2.086-.195.598h-.628l.508.37-.194.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597Zm-1.722-1.565-.194.598h-.629l.509.37-.195.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597ZM12 8.61l.195.597h.628l-.508.37.194.598-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.598Z"
                        fill="#FFDA44"
                      />
                    </g>
                    <defs>
                      <clipPath id="TJ_svg__a">
                        <path fill="#fff" d="M0 0h24v24H0z" />
                      </clipPath>
                    </defs>
                  </svg>
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
                  {locale === "ru" ? (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g clipPath="url(#RU_svg__a)">
                        <path
                          d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M23.254 16.173c.482-1.3.746-2.706.746-4.173 0-1.468-.264-2.874-.746-4.174H.746A11.974 11.974 0 0 0 0 11.999c0 1.468.264 2.874.746 4.174L12 17.217l11.254-1.044Z"
                          fill="#0052B4"
                        />
                        <path
                          d="M12 24c5.16 0 9.559-3.257 11.254-7.827H.747C2.443 20.743 6.841 24 12.001 24Z"
                          fill="#D80027"
                        />
                      </g>
                      <defs>
                        <clipPath id="RU_svg__a">
                          <path fill="#fff" d="M0 0h24v24H0z" />
                        </clipPath>
                      </defs>
                    </svg>
                  ) : locale === "en" ? (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g clipPath="url(#GB_svg__a)">
                        <path
                          d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M2.48 4.693A11.956 11.956 0 0 0 .413 8.868h6.243L2.48 4.693Zm21.106 4.176a11.957 11.957 0 0 0-2.067-4.176L17.344 8.87h6.242ZM.413 15.13a11.957 11.957 0 0 0 2.067 4.176l4.176-4.176H.413ZM19.305 2.48A11.957 11.957 0 0 0 15.13.412v6.243l4.175-4.175ZM4.693 21.518a11.957 11.957 0 0 0 4.176 2.067v-6.243l-4.176 4.176ZM8.869.412A11.957 11.957 0 0 0 4.693 2.48L8.87 6.655V.412Zm6.261 23.173a11.96 11.96 0 0 0 4.175-2.067l-4.175-4.176v6.243Zm2.214-8.455 4.175 4.176a11.957 11.957 0 0 0 2.067-4.176h-6.242Z"
                          fill="#0052B4"
                        />
                        <path
                          d="M23.898 10.435H13.565V.102a12.12 12.12 0 0 0-3.13 0v10.333H.102a12.12 12.12 0 0 0 0 3.13h10.333v10.333a12.12 12.12 0 0 0 3.13 0V13.565h10.333a12.12 12.12 0 0 0 0-3.13Z"
                          fill="#D80027"
                        />
                        <path
                          d="m15.13 15.131 5.356 5.355c.246-.246.48-.503.705-.77l-4.584-4.585H15.13Zm-6.26 0-5.355 5.355c.246.246.503.481.77.705l4.585-4.584V15.13Zm0-6.261v-.001L3.515 3.514a12.03 12.03 0 0 0-.705.77L7.394 8.87H8.87Zm6.26 0 5.356-5.355a12.023 12.023 0 0 0-.77-.705L15.13 7.394V8.87Z"
                          fill="#D80027"
                        />
                      </g>
                      <defs>
                        <clipPath id="GB_svg__a">
                          <path fill="#fff" d="M0 0h24v24H0z" />
                        </clipPath>
                      </defs>
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g clipPath="url(# _svg__a)">
                        <path
                          d="M1.19 6.782A11.952 11.952 0 0 0 0 11.999c0 1.87.428 3.64 1.19 5.217L12 18.26l10.81-1.044A11.953 11.953 0 0 0 24 12c0-1.87-.428-3.64-1.19-5.217L12 5.738 1.19 6.782Z"
                          fill="#F0F0F0"
                        />
                        <path
                          d="M1.191 17.218A12 12 0 0 0 12.001 24a12 12 0 0 0 10.808-6.782H1.191Z"
                          fill="#6DA544"
                        />
                        <path
                          d="M1.191 6.782H22.81A12 12 0 0 0 12-.001 12 12 0 0 0 1.191 6.782Z"
                          fill="#D80027"
                        />
                        <path
                          d="M9.913 15.132h4.174v-1.774l-.835.417L12 12.523l-1.252 1.252-.835-.417v1.774Zm-2.388-2.088.194.598h.629l-.509.37.195.597-.509-.37-.509.37.195-.598-.509-.37h.629l.194-.597Zm.603-2.086.194.598h.628l-.508.37.194.597-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.597ZM9.85 9.393l.194.598h.628l-.508.37.194.597-.509-.37-.508.37.194-.598-.509-.37h.629l.194-.597Zm6.625 3.651-.194.598h-.629l.509.37-.194.597.508-.37.509.37-.195-.598.51-.37h-.63l-.194-.597Zm-.602-2.086-.195.598h-.628l.508.37-.194.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597Zm-1.722-1.565-.194.598h-.629l.509.37-.195.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597ZM12 8.61l.195.597h.628l-.508.37.194.598-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.598Z"
                          fill="#FFDA44"
                        />
                      </g>
                      <defs>
                        <clipPath id="TJ_svg__a">
                          <path fill="#fff" d="M0 0h24v24H0z" />
                        </clipPath>
                      </defs>
                    </svg>
                  )}
                  <span className="uppercase">{selected}</span>
                </div>
              )}
            >
              <MenuItem value="ru">
                <div className="flex items-center gap-2">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g clipPath="url(#RU_svg__a)">
                      <path
                        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M23.254 16.173c.482-1.3.746-2.706.746-4.173 0-1.468-.264-2.874-.746-4.174H.746A11.974 11.974 0 0 0 0 11.999c0 1.468.264 2.874.746 4.174L12 17.217l11.254-1.044Z"
                        fill="#0052B4"
                      />
                      <path
                        d="M12 24c5.16 0 9.559-3.257 11.254-7.827H.747C2.443 20.743 6.841 24 12.001 24Z"
                        fill="#D80027"
                      />
                    </g>
                    <defs>
                      <clipPath id="RU_svg__a">
                        <path fill="#fff" d="M0 0h24v24H0z" />
                      </clipPath>
                    </defs>
                  </svg>
                  Русский
                </div>
              </MenuItem>
              <MenuItem value="en">
                <div className="flex items-center gap-2">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g clipPath="url(#GB_svg__a)">
                      <path
                        d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M2.48 4.693A11.956 11.956 0 0 0 .413 8.868h6.243L2.48 4.693Zm21.106 4.176a11.957 11.957 0 0 0-2.067-4.176L17.344 8.87h6.242ZM.413 15.13a11.957 11.957 0 0 0 2.067 4.176l4.176-4.176H.413ZM19.305 2.48A11.957 11.957 0 0 0 15.13.412v6.243l4.175-4.175ZM4.693 21.518a11.957 11.957 0 0 0 4.176 2.067v-6.243l-4.176 4.176ZM8.869.412A11.957 11.957 0 0 0 4.693 2.48L8.87 6.655V.412Zm6.261 23.173a11.96 11.96 0 0 0 4.175-2.067l-4.175-4.176v6.243Zm2.214-8.455 4.175 4.176a11.957 11.957 0 0 0 2.067-4.176h-6.242Z"
                        fill="#0052B4"
                      />
                      <path
                        d="M23.898 10.435H13.565V.102a12.12 12.12 0 0 0-3.13 0v10.333H.102a12.12 12.12 0 0 0 0 3.13h10.333v10.333a12.12 12.12 0 0 0 3.13 0V13.565h10.333a12.12 12.12 0 0 0 0-3.13Z"
                        fill="#D80027"
                      />
                      <path
                        d="m15.13 15.131 5.356 5.355c.246-.246.48-.503.705-.77l-4.584-4.585H15.13Zm-6.26 0-5.355 5.355c.246.246.503.481.77.705l4.585-4.584V15.13Zm0-6.261v-.001L3.515 3.514a12.03 12.03 0 0 0-.705.77L7.394 8.87H8.87Zm6.26 0 5.356-5.355a12.023 12.023 0 0 0-.77-.705L15.13 7.394V8.87Z"
                        fill="#D80027"
                      />
                    </g>
                    <defs>
                      <clipPath id="GB_svg__a">
                        <path fill="#fff" d="M0 0h24v24H0z" />
                      </clipPath>
                    </defs>
                  </svg>
                  English
                </div>
              </MenuItem>
              <MenuItem value="tj">
                <div className="flex items-center gap-2">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g clipPath="url(# _svg__a)">
                      <path
                        d="M1.19 6.782A11.952 11.952 0 0 0 0 11.999c0 1.87.428 3.64 1.19 5.217L12 18.26l10.81-1.044A11.953 11.953 0 0 0 24 12c0-1.87-.428-3.64-1.19-5.217L12 5.738 1.19 6.782Z"
                        fill="#F0F0F0"
                      />
                      <path
                        d="M1.191 17.218A12 12 0 0 0 12.001 24a12 12 0 0 0 10.808-6.782H1.191Z"
                        fill="#6DA544"
                      />
                      <path
                        d="M1.191 6.782H22.81A12 12 0 0 0 12-.001 12 12 0 0 0 1.191 6.782Z"
                        fill="#D80027"
                      />
                      <path
                        d="M9.913 15.132h4.174v-1.774l-.835.417L12 12.523l-1.252 1.252-.835-.417v1.774Zm-2.388-2.088.194.598h.629l-.509.37.195.597-.509-.37-.509.37.195-.598-.509-.37h.629l.194-.597Zm.603-2.086.194.598h.628l-.508.37.194.597-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.597ZM9.85 9.393l.194.598h.628l-.508.37.194.597-.509-.37-.508.37.194-.598-.509-.37h.629l.194-.597Zm6.625 3.651-.194.598h-.629l.509.37-.194.597.508-.37.509.37-.195-.598.51-.37h-.63l-.194-.597Zm-.602-2.086-.195.598h-.628l.508.37-.194.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597Zm-1.722-1.565-.194.598h-.629l.509.37-.195.597.509-.37.508.37-.194-.598.509-.37h-.629l-.194-.597ZM12 8.61l.195.597h.628l-.508.37.194.598-.508-.37-.509.37.194-.598-.508-.37h.628l.195-.598Z"
                        fill="#FFDA44"
                      />
                    </g>
                    <defs>
                      <clipPath id="TJ_svg__a">
                        <path fill="#fff" d="M0 0h24v24H0z" />
                      </clipPath>
                    </defs>
                  </svg>
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
