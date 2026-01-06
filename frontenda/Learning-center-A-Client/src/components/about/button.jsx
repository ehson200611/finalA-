"use client";

import React from "react";

const Button = ({ text, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2.5 text-sm font-semibold text-black rounded-lg
        bg-linear-to-r from-[#FDEC01] via-[#ffe43a] to-[#fff27a]
        hover:from-[#fff27a] hover:via-[#fff899] hover:to-[#FDEC01]
        transition-all duration-300 ease-in-out
        shadow-md hover:shadow-yellow-400/50 hover:scale-[1.05]
        active:scale-[0.98]
        ${className} 
      `}
    >
      {text}
    </button>
  );
};

export default Button;
