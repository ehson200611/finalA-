"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import successImage from "../../../assets/about/images/successImage.jpg";
import Image from "next/image";
import SectionOne from "@/components/SectionOne";
import AboutState from "@/components/aboutState";
import { useMediaQuery } from "@mui/material";
import { CircleDollarSign } from "lucide-react";
import Errors from "@/components/error/errors";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Loading from "@/components/loading/loading";
import { useGetAboutQuery } from "@/store/slices/aboutApi";

const AboutPage = () => {
  const { theme, systemTheme } = useTheme();
  const t = useTranslations("about");
  const [mounted, setMounted] = useState(false);
  const { data, error, isLoading } = useGetAboutQuery();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Get current theme - fallback to system theme if theme is 'system'
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const textClass = isDark ? "text-white" : "text-[#101828]";

  const values = [
    { title: t("value1"), description: t("value2") },
    { title: t("value3"), description: t("value4") },
    { title: t("value5"), description: t("value6") },
    { title: t("leaders"), description: t("recommend") },
  ];

  if (error) {
    return (
      <Errors
        error={error}
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  if (isLoading) return <Loading />;

  return (
    <main
      className={`${
        isDark
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans min-h-screen transition-colors duration-300`}
    >
      <div className="lg:max-w-7xl lg:mx-auto mx-5 py-5">
        {/* Hero Section */}
        <SectionOne title={t("heroTitle")} description={t("heroSubtitle")} />

        <AboutState />

        {/* Mission */}
        <section className="py-16 lg:py-20">
          <div className="container max-w-[96%] mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className={`text-3xl md:text-4xl font-bold mb-6 ${textClass}`}
              >
                {t("missionTitle")}
              </h2>
              <p className={`text-lg mb-4 ${textClass} leading-relaxed`}>
                {t("missionText1")}
              </p>
              <p className={`text-lg ${textClass} leading-relaxed`}>
                {t("missionText2")}
              </p>
            </div>
            <div className="relative">
              <Image
                src={successImage}
                alt="Success"
                width={800}
                height={400}
                className="rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105"
              />
              {isDark && (
                <div className="absolute inset-0 rounded-2xl bg-blue-900/10 mix-blend-overlay" />
              )}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2
                className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}
              >
                {t("valuesTitle")}
              </h2>
              <p
                className={`text-lg max-w-2xl mx-auto ${textClass} leading-relaxed`}
              >
                {t("valuesSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center text-center p-6 rounded-2xl border shadow-md transition-all duration-300 hover:scale-105 ${
                    isDark
                      ? "bg-linear-to-b from-[#011b24] to-[#022936] border-sky-800 hover:from-[#022936] hover:to-[#033a48] hover:shadow-cyan-500/20"
                      : "bg-linear-to-b from-white to-sky-50 border-sky-100 hover:from-white hover:to-sky-100 hover:shadow-lg"
                  }`}
                >
                  <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>
                    {value.title}
                  </h3>
                  <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className={`py-20 md:py-28 bg-linear-to-br `}>
          <div className="container mx-auto px-4">
            <div className="max-w-[1000px] mx-auto text-center">
              {/* Header with decorative elements */}
              <div className="relative mb-12">
                <div
                  className={`w-24 mx-auto h-1 ${
                    theme == "dark" ? "bg-slate-400" : "bg-slate-600"
                  } rounded-full mb-6`}
                ></div>
                <h2 className={`text-4xl lg:text-5xl font-bold  bg-clip-text mb-10`}>
                  {t("teamTitle")}
                </h2>
                <div
                  className={`w-24 mx-auto h-1 ${
                    theme == "dark" ? "bg-slate-400" : "bg-slate-600"
                  } rounded-full mb-6`}
                ></div>
              </div>

              {/* Content cards */}
              <div className="flex lg:grid lg:grid-cols-3 gap-6 max-w-[1000px] mx-auto overflow-x-auto lg:overflow-visible pb-4 md:pb-0 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 snap-x snap-mandatory">
                <div
                  className={`min-w-[280px] lg:min-w-0 snap-start ${
                    theme == "dark"
                      ? "bg-slate-800/70 border-slate-700/50"
                      : "bg-white/70 border-slate-200/50"
                  } backdrop-blur-sm rounded-2xl p-8 border shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]`}
                >
                  <div
                    className={`w-12 h-12 ${
                      theme == "dark" ? "bg-blue-900/30" : "bg-blue-100"
                    } rounded-lg flex items-center justify-center mb-4 mx-auto`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        theme == "dark" ? "text-blue-400" : "text-blue-600"
                      } `}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <CircleDollarSign />
                    </svg>
                  </div>
                  <p
                    className={`${
                      theme == "dark" ? "text-slate-400" : "text-slate-600"
                    }  leading-relaxed text-lg`}
                  >
                    {t("teamText1")}
                  </p>
                </div>

                <div
                  className={`min-w-[280px] lg:min-w-0 snap-start ${
                    theme == "dark"
                      ? "bg-slate-800/70 border-slate-700/50"
                      : "bg-white/70 border-slate-200/50"
                  } backdrop-blur-sm rounded-2xl p-8 border shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]`}
                >
                  <div
                    className={`w-12 h-12 ${
                      theme == "dark" ? "bg-blue-900/30" : "bg-blue-100"
                    } rounded-lg flex items-center justify-center mb-4 mx-auto`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        theme == "dark" ? "text-blue-400" : "text-blue-600"
                      } `}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p
                    className={`${
                      theme == "dark" ? "text-slate-400" : "text-slate-600"
                    }  leading-relaxed text-lg`}
                  >
                    {t("teamSubtitle")}
                  </p>
                </div>

                <div
                  className={`min-w-[280px] lg:min-w-0 snap-start ${
                    theme == "dark"
                      ? "bg-slate-800/70 border-slate-700/50"
                      : "bg-white/70 border-slate-200/50"
                  } backdrop-blur-sm rounded-2xl p-8 border shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]`}
                >
                  <div
                    className={`w-12 h-12 ${
                      theme == "dark" ? "bg-purple-900/30" : "bg-purple-100"
                    } rounded-lg flex items-center justify-center mb-4 mx-auto`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        theme == "dark" ? "text-purple-400" : "text-purple-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <p
                    className={`${
                      theme == "dark" ? "text-slate-400" : "text-slate-600"
                    } leading-relaxed text-lg`}
                  >
                    {t("teamText2")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
