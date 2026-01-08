"use client";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import {
  Bell,
  ChartNoAxesCombined,
  Crown,
  Users,
  Menu,
  X,
  BookOpenText,
  UserStar,
  FileUser,
  BookOpenCheck,
  ShieldCheck,
  LogOutIcon,
  LogOut,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Loading from "@/components/loading/loading";
import { Button } from "@mui/material";

const LayoutAdmin = ({ children }) => {
  const { data: meProfile, isLoading, isFetching, refetch } = useGetMeProfileQuery();
  const isSuperAdmin = meProfile?.role === "superadmin";

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const pathName = usePathname();
  const t = useTranslations("layoutAdmin");

  const [activeLink, setActiveLink] = useState(`${pathName}`);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    {
      href: `/${locale}/admin`,
      label: t("notification"),
      icon: <Bell />,
      superAdmin: true,
    },
    {
      href: `/${locale}/admin/users`,
      label: t("users"),
      icon: <Users />,
      superAdmin: isSuperAdmin,
    },
    {
      href: `/${locale}/admin/tests`,
      label: t("testRes"),
      icon: <ChartNoAxesCombined />,
      superAdmin: true,
    },
    {
      href: `/${locale}/admin/userAdmin`,
      label: t("admins"),
      icon: <Crown />,
      superAdmin: isSuperAdmin,
    },
    {
      href: `/${locale}/admin/testsCrud`,
      label: t("testMan"),
      icon: <BookOpenCheck />,
      superAdmin: isSuperAdmin,
    },
    {
      href: `/${locale}/admin/books`,
      label: t("books"),
      icon: <BookOpenText />,
      superAdmin: isSuperAdmin,
    },
    {
      href: `/${locale}/admin/feedback`,
      label: t("review"),
      icon: <UserStar />,
      superAdmin: isSuperAdmin,
    },
    {
      href: `/${locale}/admin/work`,
      label: t("resume"),
      icon: <FileUser />,
      superAdmin: isSuperAdmin,
    },
  ];

  const handleLinkClick = (href) => {
    setActiveLink(href);
    setIsSidebarOpen(false);
  };

  // Пока идёт загрузка — ничего не делаем
  if (isLoading || isFetching) {
    return <Loading />;
  }

  // Когда данные пришли — проверяем роль
  const isAdmin =
    meProfile?.role === "superadmin" || meProfile?.role === "admin";

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  function logOut() {
    localStorage.removeItem("token");
    redirect("/login");
  }

  return (
    // Основной контейнер
    <div
      className={`${
        theme === "dark"
          ? "bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-800"
      } font-sans lg:h-[90.5vh] flex overflow-hidden`}
    >
      {/* Затемнение фона для мобильных и планшетных устройств */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* САЙДБАР - Адаптивный под разные устройства */}
      <div
        className={`fixed top-0 lg:h-[92vh] h-screen lg:z-10 z-30 transition-transform duration-300 ease-in-out
            ${
              theme === "dark"
                ? "bg-gray-800/95 backdrop-blur-lg border-r border-gray-700"
                : "bg-white/95 backdrop-blur-lg border-r border-gray-200 shadow-lg"
            }
         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
         lg:static lg:translate-x-0
         w-64 md:w-72 lg:w-80
       `}
      >
        {/* Заголовок сайдбара */}
        <div className="flex justify-between items-center p-4 md:p-5 lg:p-6 pb-0">
          <p className="text-lg sm:text-lg md:text-xl lg:text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("adminPanel")}
          </p>
          <Button
            onClick={() => logOut()}
            sx={{ backgroundColor: "red", color: "white" }}
          >
            <LogOut size={20} />
          </Button>
        </div>

        {/* Навигация - прокручиваемая область */}
        <div className=" max-h-[75vh] overflow-y-auto scrollbar-hide px-3 sm:px-3 md:px-4 lg:px-2 py-1 sm:py-1 md:py-2 lg:pt-1 lg:pb-10">
          <nav className="space-y-1 sm:space-y-1 md:space-y-2 lg:space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleLinkClick(item.href)}
                className={`flex items-center gap-3 rounded-xl transition-all duration-300 group relative overflow-hidden 
                  p-3 sm:p-3 md:p-4 lg:p-5 
                  lg:rounded-2xl
                  ${item.superAdmin ? "" : "hidden"}
                  ${
                    activeLink === item.href
                      ? `${
                          theme === "dark"
                            ? "bg-gray-700 shadow-lg"
                            : "bg-white shadow-xl"
                        } border-l-4 border-blue-500`
                      : `${
                          theme === "dark"
                            ? "hover:bg-gray-700/50"
                            : "hover:bg-white/50"
                        } hover:scale-105`
                  }`}
              >
                {/* Градиентный фон */}
                <div
                  className={`absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Иконка */}
                <div
                  className={`transition-transform duration-300 group-hover:scale-110 
                    text-lg sm:text-lg md:text-xl lg:text-2xl
                    ${activeLink === item.href ? "scale-110" : ""}
                  `}
                >
                  {item.icon}
                </div>

                {/* Текст навигации */}
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span
                    className={`font-semibold transition-all duration-300 
                      text-sm sm:text-sm md:text-base lg:text-base
                      ${
                        activeLink === item.href
                          ? "text-blue-500"
                          : theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Индикатор активной ссылки */}
                {activeLink === item.href && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse hidden sm:block" />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ОСНОВНАЯ ОБЛАСТЬ КОНТЕНТА */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Верхняя панель с кнопкой меню - скрыта на планшетах и десктопах */}
        <div className="shrink-0 p-3 sm:p-3 md:p-4 lg:p-5 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg flex items-center gap-2 ${
              theme === "dark"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-800 hover:bg-gray-50"
            } shadow-lg transition-colors duration-200`}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="text-sm sm:text-sm md:text-base lg:text-base">
              {isSidebarOpen ? t("close") : t("menu")}
            </span>
          </button>
        </div>

        {/* Прокручиваемая область контента */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-2 sm:p-2 md:p-4 lg:p-4">
          <div
            className={`mx-auto 
              p-3 sm:p-3 md:p-5 lg:p-8 
              rounded-xl sm:rounded-xl md:rounded-2xl lg:rounded-3xl 
              lg:max-w-7xl
              ${
                theme === "dark"
                  ? "bg-gray-800/40 backdrop-blur-lg border border-gray-700"
                  : "bg-white/60 backdrop-blur-lg border border-white shadow-xl"
              }`}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LayoutAdmin;
