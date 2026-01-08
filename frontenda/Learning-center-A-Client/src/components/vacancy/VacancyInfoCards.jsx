"use client";
import React from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Zap, FolderPlus, ArrowLeftRight, Cog, Glasses, Users } from "lucide-react";
import InfoCard from "@/components/vacancy/infoCard";

const VacancyInfoCards = () => {
  const { theme } = useTheme();
  const t = useTranslations("vacancy");

  return (
    <>
      <div className=" relative w-full  lg:py-16 lg:px-6">
        <div
          className="flex flex-nowrap lg:justify-center lg:gap-10 gap-6 overflow-x-auto lg:overflow-visible
    scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-thumb-[#00CED1] scroll-smooth pb-4"
        >
          <div
            className={`w-[85%] sm:w-[70%] lg:w-[415px] h-[260px] lg:h-[280px] min-w-[300px] p-6 rounded-3xl transform transition-all duration-500 lg:hover:scale-105 shrink-0 
      ${
        theme === "dark"
          ? "bg-linear-to-br from-[#1a1a1a] via-[#552a2a] to-[#333] text-gray-100 border-gray-700"
          : "bg-linear-to-br from-[#FFDEE9] via-[#B5FFFC] to-[#00CED1]  bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#FFDEE9_100%)]  text-gray-900"
      }`}
            style={{ backgroundBlendMode: "overlay" }}
          >
            <div className="flex flex-col justify-between h-full">
              <h3 className="text-xl md:text-3xl font-extrabold mb-2">
                {t("langDash")}
              </h3>
              <ul className="text-base md:text-xl leading-relaxed space-y-1">
                <li>{t("forChild")}</li>
                <li>{t("nedelu")}</li>
                <li>{t("rechi")}</li>
              </ul>
            </div>
          </div>

          <div
            className={`w-[85%] sm:w-[70%] lg:w-[415px] h-[260px] lg:h-[280px] min-w-[300px] p-6 rounded-3xl transform transition-all duration-500 lg:hover:scale-105 shrink-0
      ${
        theme === "dark"
          ? "bg-linear-to-br from-[#1f2937] via-[#334155] to-[#475569] text-gray-100 border border-gray-700 shadow-lg"
          : " bg-linear-to-br from-[#FFD194] via-[#D191FF] to-[#00CED1]  bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#FFD194_100%)] text-gray-900 border border-transparent"
      }`}
            style={{ backgroundBlendMode: "overlay" }}
          >
            <div className="flex flex-col justify-between h-full">
              <h3 className="text-xl md:text-3xl font-extrabold mb-2">
                {t("courseEn")}
              </h3>
              <ul className="text-base md:text-xl leading-relaxed space-y-1">
                <li>{t("year")}</li>
                <li>
                  7–10 {t("years")} — <b>Round-Up</b>, <b>Prepare 1</b>
                </li>
                <li>
                  10–14 {t("years")} — <b>A1–B2</b>
                </li>
                <li>
                  {t("men")} — <b>TOEFL / IELTS</b>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`w-[85%] sm:w-[70%] lg:w-[415px] h-[260px] lg:h-[280px] p-6 rounded-3xl transform transition-all duration-500 lg:hover:scale-105 shrink-0
      ${
        theme === "dark"
          ? "bg-linear-to-br from-[#0f172a] via-[#1e3a8a] to-[#155ew75] text-gray-100 border border-gray-700 shadow-lg"
          : "bg-linear-to-br from-[#6DD5FA] via-[#2980B9] to-[#00CED1] bg-[radial-gradient(circle_at_bottom_left,_#ffffff_0%,_#6DD5FA_100%)] text-black border border-transparent"
      }`}
            style={{ backgroundBlendMode: "overlay" }}
          >
            <div className="flex flex-col justify-between h-full">
              <h3 className="text-xl md:text-3xl font-extrabold mb-2">
                {t("courseRu")}
              </h3>
              <ul className="text-base md:text-xl leading-relaxed space-y-1">
                <li>{t("ages")}</li>
                <li>{t("child")}</li>
                <li>{t("big")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className=" my-[100px] lg:my-[100px]">
        <h3
          className={`text-3xl lg:text-5xl lg:text-[40px] font-bold text-center leading-snug md:leading-tight ${
            theme == "dark" ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {t("educCenter")}
        </h3>

        <div className="mt-[60px] flex flex-nowrap overflow-x-auto gap-4 px-2 md:flex-wrap md:justify-center md:gap-[40px] scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-thumb-[#00CED1] scroll-smooth">
          <InfoCard
            icon={<Zap />}
            name={t("strCom")}
            description={t("strDesc")}
          />
          <InfoCard
            icon={<FolderPlus />}
            name={t("easyCom")}
            description={t("easyDesc")}
          />
          <InfoCard
            icon={<ArrowLeftRight />}
            name={t("format")}
            description={t("formatDesc")}
          />
          <InfoCard
            icon={<Cog />}
            name={t("regular")}
            description={t("regularDesc")}
          />
          <InfoCard
            icon={<Glasses />}
            name={t("rut")}
            description={t("rutDesc")}
          />
          <InfoCard
            icon={<Users />}
            name={t("pupil")}
            description={t("pupilDesc")}
          />
        </div>
      </div>
    </>
  );
};

export default VacancyInfoCards;

