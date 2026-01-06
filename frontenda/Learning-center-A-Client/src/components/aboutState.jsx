"use client";
import React, { useEffect, useState } from "react";
import { Award, Edit3, Target, TrendingUp, Users } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  useGetAboutQuery,
  useGetByIdAboutQuery,
  useUpdateAboutMutation,
} from "@/store/slices/aboutApi";
import { useTranslations } from "next-intl";
import { useTheme as useNextTheme } from "next-themes";
import Loading from "./loading/loading";

const AboutState = ({ isAdmin }) => {
  const { theme: nextTheme } = useNextTheme();
  const t = useTranslations("about");
  const { data: aboutData, refetch, isLoading } = useGetAboutQuery();
  const [updateAbout] = useUpdateAboutMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data: aboutItem } = useGetByIdAboutQuery(editingId, {
    skip: !editingId,
  });

  useEffect(() => {
    if (aboutItem) setEditValue(aboutItem.number);
  }, [aboutItem]);

  const isDark = nextTheme === "dark";

  const stats = [
    {
      icon: <Users size={28} className="text-sky-400" />,
      label: t("graduates"),
      bg: isDark ? "bg-sky-900/50" : "bg-sky-50",
      border: isDark ? "border-sky-800" : "border-sky-300",
    },
    {
      icon: <Target size={28} className="text-orange-400" />,
      label: t("education_center"),
      bg: isDark ? "bg-orange-900/50" : "bg-orange-50",
      border: isDark ? "border-orange-800" : "border-orange-300",
    },
    {
      icon: <Award size={28} className="text-indigo-400" />,
      label: t("teamTitle"),
      bg: isDark ? "bg-indigo-900/50" : "bg-indigo-50",
      border: isDark ? "border-indigo-800" : "border-indigo-300",
    },
    {
      icon: <TrendingUp size={28} className="text-yellow-400" />,
      label: t("experience"),
      bg: isDark ? "bg-yellow-900/50" : "bg-yellow-50",
      border: isDark ? "border-yellow-800" : "border-yellow-300",
    },
  ];

  const handleEditClick = (item) => {
    setEditingId(item.order);
    setOpen(true);
    setEditValue(item.number);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      await updateAbout({ order: aboutItem.order, number: editValue }).unwrap();
      refetch();
      handleClose();
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <section className="w-full py-5 lg:py-12">
        <h2 className="text-3xl lg:text-3xl font-[700] mb-10 ">
          {t("ourWin")}
        </h2>
        <div className="max-w-[100%] mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, ind) => (
            <div
              key={ind}
              className={`relative flex flex-col items-center justify-center rounded-lg border ${
                isDark
                  ? "bg-linear-to-b from-[#0f2d37] to-[#0a1a23] border-sky-800 hover:shadow-cyan-500/20"
                  : "bg-white border-gray-100 hover:shadow-lg"
              } shadow-md p-8 transition-all duration-300 hover:scale-105`}
            >
              <div
                className={`p-3 rounded-xl mb-4 ${item.bg} ${item.border} border`}
              >
                {item.icon}
              </div>
              <p
                className={`text-2xl flex gap-2 items-center lg:text-3xl font-bold mb-1`}
              >
                {aboutData?.[ind]?.number || "0"}
              </p>

              <p
                className={`text-center md:text-lg ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {item.label}
              </p>

              {isAdmin && (
                <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                  <Tooltip title={t("update")}>
                    <button
                      className=" bg-white/50 w-10 h-10 rounded-full hover:bg-white/10 transition"
                      onClick={() => handleEditClick(aboutData?.[ind])}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                  </Tooltip>
                </Box>
              )}
            </div>
          ))}
        </div>
      </section>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("statVal")}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label={t("value")}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={handleClose}>{t("cancel")}</Button>
          <Button onClick={handleSave} variant="contained">
            {t("save")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AboutState;
