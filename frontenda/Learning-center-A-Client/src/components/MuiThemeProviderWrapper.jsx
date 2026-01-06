"use client";

import { useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { useTheme as useNextTheme } from "next-themes";

const getMuiTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: { main: "#1976d2" },
            background: { default: "#fff", paper: "#f4f4f4" },
          }
        : {
            primary: { main: "#90caf9" },
            background: { default: "#121212", paper: "#1e1e1e" },
          }),
    },
    typography: { fontFamily: '"Inter", sans-serif' },
  });

export default function MuiThemeProviderWrapper({ children }) {
  const { theme: nextTheme, systemTheme } = useNextTheme();
  const [muiTheme, setMuiTheme] = useState(getMuiTheme("light"));

  useEffect(() => {
    const activeTheme = nextTheme === "system" ? systemTheme : nextTheme;
    setMuiTheme(getMuiTheme(activeTheme));
  }, [nextTheme, systemTheme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
