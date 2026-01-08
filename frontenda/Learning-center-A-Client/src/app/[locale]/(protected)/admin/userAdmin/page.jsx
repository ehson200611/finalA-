"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Search,  User, Shield, Phone, Calendar } from "lucide-react";
import { useGetAdminsQuery } from "@/store/slices/superAdminApi";

import { useTranslations } from "next-intl";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Unauthorized from "@/app/[locale]/unauthorized/page";
import Loading from "@/components/loading/loading";

const UserAdmin = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("userAdmin");

  const { data, isLoading, error, refetch } = useGetAdminsQuery();

  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  if (!isAdmin) {
    <Unauthorized />;
  }

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  // Show error state
  if (error) {
    // 1. Проверяем интернет
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // 2. Определяем тип ошибки
    let title = "";
    if (!isOnline) {
      title = t("noInternet");
    } else {
      title = t("serverError");
    }

    // 3. Получаем сообщение сервера если есть
    const serverMessage =
      error?.data?.detail ||
      error?.data?.message ||
      error?.message ||
      t("unknownError");

    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center text-center text-red-600 gap-2">
          <div className="text-3xl">⚠️</div>

          {/* Заголовок */}
          <p className="text-xl font-semibold">{title}</p>

          {/* Сообщение сервера */}
          <p className="text-sm text-red-500 max-w-xs">{serverMessage}</p>

          {/* Сообщение браузера (для дебага) */}
          <p className="text-xs text-gray-500 mt-2">
            {t("errorCode")}: {error.status || t("noData")}
          </p>
        </div>
      </div>
    );
  }

  // Фильтрация админов
  const filteredAdmins =
    data?.admins?.filter(
      (admin) =>
        admin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin?.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const isDark = theme === "dark";

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                } flex items-center gap-2`}
              >
                <Shield className="w-6 h-6" />
                {t("adminManagement")}
              </p>
              <p
                className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                {t("manageAllAdmins")}
              </p>
            </div>

            {/* Search and Count */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div
                className={`rounded-xl p-4 border transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="relative md:max-w-md">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder={t("searchAdmins")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`md:w-[300px] w-[240px] pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      } transition-colors duration-200`}
                    >
                      {t("adminText")}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      } transition-colors duration-200`}
                    >
                      {t("phoneNumberText")}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      } transition-colors duration-200`}
                    >
                      {t("roleText")}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      } transition-colors duration-200`}
                    >
                      {t("joinDateText")}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? "divide-gray-600" : "divide-gray-200"
                  } `}
                >
                  {filteredAdmins?.length > 0 ? (
                    filteredAdmins?.map((admin) => (
                      <tr
                        key={admin.id}
                        className={` ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        } transition-colors duration-200`}
                      >
                        {/* Имя админа */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  isDark ? "text-white" : "text-gray-900"
                                } transition-colors duration-200`}
                              >
                                {admin.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                } mt-1`}
                              >
                                ID: {admin.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Номер телефона */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Phone
                              className={`w-3 h-3 ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            />
                            <p
                              className={`text-sm font-medium ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {admin.phoneNumber}
                            </p>
                          </div>
                        </td>

                        {/* Роль */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              admin.role === "superadmin"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                : admin.role === "admin"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {admin.role === "superadmin"
                              ? t("superAdmin")
                              : admin.role === "admin"
                              ? t("admin")
                              : admin.role}
                          </span>
                        </td>

                        {/* Дата регистрации */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                            <Calendar className="w-3 h-3" />
                            {new Date(admin.date_joined).toLocaleDateString(
                              "ru-RU",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            } mt-1`}
                          >
                            {new Date(admin.date_joined).toLocaleTimeString(
                              "ru-RU",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-24 text-center">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p
                          className={`text-lg font-medium ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {searchTerm
                            ? t("noMatchingAdmins")
                            : t("noAdminsFound")}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {searchTerm ? t("tryAdjustingSearch") : t("noAdmins")}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAdmin;
