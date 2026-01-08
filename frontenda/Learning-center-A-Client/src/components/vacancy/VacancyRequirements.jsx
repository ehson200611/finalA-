"use client";
import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const VacancyRequirements = () => {
  const { theme } = useTheme();
  const t = useTranslations("vacancy");
  const [activeTab, setActiveTab] = useState("english");

  return (
    <div
      className={`${
        theme == "dark"
          ? "bg-gradient-to-r from-[#023d94] via-[#164c8b] to-[#1435a0]"
          : "bg-gradient-to-r from-[#0166fd] via-[#3a96ff] to-[#7a99ff]"
      } rounded-md mb-[70px] flex flex-col items-center relative box mt-[40px]
  p-4 lg:p-6 ${
    theme === "dark" ? "border border-gray-700" : "border border-gray-200"
  }`}
    >
      <h2 className="text-2xl text-white lg:text-5xl w-full md:w-auto font-semibold mb-3 lg:mb-4 text-center px-4">
        {t("lang")}
      </h2>

      <p className="text-base text-white md:text-2xl font-medium mb-5 lg:mb-6 max-w-[90%] lg:max-w-[70%] text-center">
        {t("trelang")}
      </p>

      <div className="flex justify-center gap-2 lg:gap-4 mb-5 lg:mb-6">
        <button
          onClick={() => setActiveTab("english")}
          className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition cursor-pointer text-sm md:text-xl ${
            activeTab === "english"
              ? "bg-white text-yellow-600"
              : theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          {t("english")}
        </button>

        <button
          onClick={() => setActiveTab("russian")}
          className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition cursor-pointer text-sm md:text-base ${
            activeTab === "russian"
              ? "bg-white text-[#FF4500]"
              : theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          {t("russian")}
        </button>

        <button
          onClick={() => setActiveTab("preschool")}
          className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition cursor-pointer text-sm md:text-base ${
            activeTab === "preschool"
              ? "bg-white text-green-600"
              : theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          {t("dashcol")}
        </button>
      </div>

      <div className="w-full max-w-3xl grid sm:grid-cols-1 md:grid-cols-1 gap-5 md:gap-6">
        {activeTab === "english" && (
          <div
            className={`p-4 md:p-6 rounded-2xl shadow-lg transition-all border ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700 hover:shadow-2xl"
                : "bg-white border-gray-200 hover:shadow-2xl"
            }`}
          >
            <h3 className="text-xl md:text-2xl font-extrabold mb-3 md:mb-4 text-yellow-600 text-center">
              {t("langEn")}
            </h3>
            <ul
              className={`list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 ${
                theme == "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>{t("minUrov")}</li>
              <li>{t("age")}</li>
              <li>{t("opit")}</li>
              <li>{t("sertificate")}</li>
            </ul>
          </div>
        )}

        {activeTab === "russian" && (
          <div
            className={`p-4 md:p-6 rounded-2xl shadow-lg transition-all border ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700 hover:shadow-2xl"
                : "bg-white border-gray-200 hover:shadow-2xl"
            }`}
          >
            <h3 className="text-xl md:text-2xl font-extrabold mb-3 md:mb-4 bg-linear-to-r from-[#FF6347] to-[#FF4500] bg-clip-text text-transparent text-center">
              {t("langRu")}
            </h3>
            <ul
              className={`list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 ${
                theme == "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>{t("minUrovRu")}</li>
              <li>{t("age")}</li>
              <li>{t("opit")}</li>
              <li>{t("sertificate")}</li>
            </ul>
          </div>
        )}

        {activeTab === "preschool" && (
          <div
            className={`p-4 md:p-6 rounded-2xl shadow-lg transition-all border ${
              theme === "dark"
                ? "bg-gray-900 border-gray-700 hover:shadow-2xl"
                : "bg-white border-gray-200 hover:shadow-2xl"
            }`}
          >
            <h3 className="text-xl md:text-2xl font-extrabold mb-3 md:mb-4 text-green-600 text-center">
              {t("langDash")}
            </h3>
            <ul
              className={`list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 ${
                theme == "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>{t("obroz")}</li>
              <li>{t("uroven")}</li>
              <li>{t("ageDash")}</li>
              <li>{t("opitDahs")}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VacancyRequirements;

