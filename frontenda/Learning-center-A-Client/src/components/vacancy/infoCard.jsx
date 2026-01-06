"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

const InfoCard = ({ name, description, icon }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className={`
        shrink-0 
        w-[320px] sm:w-[350px]
        rounded-2xl 
        border 
        ${theme === "dark" ? "border-gray-700" : "border-gray-200"}
        shadow-md lg:hover:shadow-xl
        ${theme === "dark" ? "bg-[#0a0a1f]" : "bg-white"}
        p-6 flex flex-col gap-4
        transition-all duration-300
        font-sans tracking-wide
      `}
    >
      <div
        className={`text-4xl mb-2 ${
          theme === "dark"
            ? "text-[#40E0D0] drop-shadow-[0_0_6px_#00CED1]"
            : "text-[#00CED1]"
        }`}
      >
        {icon}
      </div>

      <h2
        className={`
          text-[24px] sm:text-[28px] font-bold leading-snug
          ${theme === "dark" ? "text-gray-100" : "text-gray-800"}
        `}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {name}
      </h2>

      <p
        className={`
          text-[16px] sm:text-[18px] leading-relaxed
          ${theme === "dark" ? "text-gray-400" : "text-gray-600"}
        `}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {description}
      </p>
    </div>
  );
};

export default React.memo(InfoCard);
