"use client";

import React from "react";
import { useTheme } from "next-themes";

/**
 * Улучшенная карточка с современными эффектами
 */
const EnhancedCard = ({ 
  children, 
  className = "", 
  hover = true,
  glow = false,
  ...props 
}) => {
  const { theme } = useTheme();
  
  const baseClasses = `
    rounded-xl p-6
    ${theme === "dark" 
      ? "bg-gray-800/40 backdrop-blur-lg border border-gray-700" 
      : "bg-white/60 backdrop-blur-lg border border-white shadow-modern"
    }
    transition-all duration-300
  `;
  
  const hoverClasses = hover ? "card-hover" : "";
  const glowClasses = glow ? "glow-effect" : "";
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default EnhancedCard;

