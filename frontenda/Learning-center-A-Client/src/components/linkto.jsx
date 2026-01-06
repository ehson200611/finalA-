import Link from "next/link";
import React from "react";

const Linkto = ({ text, href, className = "" }) => {
  return (
    <Link
      href={href}
      className={`
        relative overflow-hidden text-black
        px-6 py-2.5 text-sm font-semibold rounded-lg shadow-md
        bg-linear-to-r from-[#FDEC01] via-[#f9e400] to-[#ffdf3a]
        hover:from-[#ffeb57] hover:via-[#fff27a] hover:to-[#ffdf3a]
        transition-all duration-300 ease-in-out
        hover:shadow-yellow-400/50 hover:scale-[1.05]
        active:scale-[0.98]
        ${className}
      `}
    >
      <span className="relative z-10">{text}</span>
      <span
        className="absolute inset-0 opacity-0 hover:opacity-20 bg-white transition-opacity duration-300 rounded-xl"
        aria-hidden="true"
      />
    </Link>
  );
};

export default Linkto;
