"use client";
import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { useTheme } from "next-themes";
import { useGetSwiperQuery } from "@/store/slices/home";

const Loading = () => {
  const { isLoading } = useGetSwiperQuery();
  const { theme } = useTheme();

  const LoadingSpinner = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        backgroundColor: theme === "dark" ? "#0f172a" : "transparent",
      }}
    >
      <CircularProgress
        sx={{
          color: theme === "dark" ? "#34d3d6" : "#34d3d6",
        }}
      />
    </Box>
  );

  if (isLoading) return <LoadingSpinner />;

  return null;
};

export default Loading;
