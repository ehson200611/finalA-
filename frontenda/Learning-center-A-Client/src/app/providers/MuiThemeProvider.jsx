"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function MuiThemeProvider({ children }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const muiTheme = createTheme({
    palette: {
      mode: theme === "dark" ? "dark" : "light",
      background: {
        default: theme === "dark" ? "#0a1a23" : "#fff",
        paper: theme === "dark" ? "#0f2a35" : "#fff",
      },
      text: {
        primary: theme === "dark" ? "#ffffff" : "#000000",
      },
    },
  });

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
