"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Button from "./about/button";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

const Faq = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("contactPage");
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans py-16 px-6 text-center max-w-3xl mx-auto rounded-3xl transition-all duration-300`}
    >
      <h2
        className={`text-3xl sm:text-4xl font-extrabold mb-4 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        {t("question")}
      </h2>

      <p
        className={`text-lg mb-8 max-w-2xl mx-auto ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {t("faq")}{" "}
        <span
          className={`font-semibold ${
            theme === "dark" ? "text-[#34d3d6]" : "text-blue-600"
          }`}
        >
          FAQ
        </span>
        .
      </p>

      <Link href="/faq">
        <Button className="cursor-pointer" text={t("button")} />
      </Link>
    </div>
  );
};

export default Faq;
