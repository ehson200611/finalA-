"use client";

import React from "react";
import { useTheme } from "next-themes";

/**
 * Улучшенная кнопка с градиентом и эффектами
 */
const EnhancedButton = ({ 
  children, 
  className = "", 
  variant = "primary",
  size = "md",
  ...props 
}) => {
  const { theme } = useTheme();
  
  const variants = {
    primary: "btn-gradient text-white",
    secondary: theme === "dark" 
      ? "bg-gray-700 hover:bg-gray-600 text-white" 
      : "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: theme === "dark"
      ? "border-2 border-[#34d3d6] text-[#34d3d6] hover:bg-[#34d3d6]/10"
      : "border-2 border-[#34d3d6] text-[#34d3d6] hover:bg-[#34d3d6]/10"
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-semibold
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-[#34d3d6] focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default EnhancedButton;

