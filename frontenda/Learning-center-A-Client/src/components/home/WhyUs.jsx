"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useGetWhyUsQuery, useUpdateWhyUsMutation } from "@/store/slices/home";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  ChartNoAxesCombined,
  Globe,
  GraduationCap,
  Languages,
  MessageCircleMore,
  SplinePointer,
} from "lucide-react";
import Loading from "../loading/loading";

const WhyUs = ({ isAdmin }) => {
  const t = useTranslations("homePage");
  const locale = useLocale();
  
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: whyUs, isLoading, error } = useGetWhyUsQuery();
  const [editWhyUs] = useUpdateWhyUsMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [lang, setLang] = useState("ru");

  const openEdit = (item) => {
    setCurrent({ ...item });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("id", current.id);
      formData.append("order", current.id);
      formData.append("text_ru", current.text_ru || "");
      formData.append("text_en", current.text_en || "");
      formData.append("text_tj", current.text_tj || "");

      await editWhyUs({ id: current.id, data: formData }).unwrap();
      setModalOpen(false);
    } catch (err) {
      alert(t("error") + (err?.data?.message || err.message || t("notFound")));
    }
  };

  const iconMap = [
    Languages,
    MessageCircleMore,
    GraduationCap,
    ChartNoAxesCombined,
    Globe,
    SplinePointer,
  ];

  if (!mounted) return null;

  if (error)
    return (
      <Typography align="center" color="error">
        {t("error")} {error.message}
      </Typography>
    );

  if (isLoading) return <Loading />;

  return (
    <div className="my-[70px] p-[15px] md:py-8">
      <h2 className={`text-2xl md:text-3xl font-[700] mb-10`}>
        {t("whyChooseTitle")}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 ">
        {whyUs?.map((item, index) => {
          const Icon = iconMap.at(index);
          return (
            <div
              key={item.id}
              className={`
                group relative shadow-xl ${
                  theme === "dark" ? "bg-[#02212b]" : "bg-white"
                }
                p-4 lg:p-6 flex lg:flex-row flex-col items-center gap-5
                rounded-lg w-full
                transition-all duration-300 hover:border-b-4 hover:border-sky-500 hover:shadow-lg
              `}
            >
              {/* Hover Edit */}
              {isAdmin && (
                <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                  <Tooltip title="Редактировать">
                    <button
                      className=" bg-white/50 w-10 h-10 rounded-full hover:bg-white/10 transition"
                      onClick={() => openEdit(item)}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                  </Tooltip>
                </Box>
              )}

              <div className="shrink-0 p-3 rounded-lg bg-sky-50 dark:bg-sky-900 transition-all duration-300 group-hover:bg-sky-100 dark:group-hover:bg-sky-800 group-hover:scale-110 group-hover:rotate-6">
                <Icon className="w-6 h-6 text-sky-600 dark:text-sky-300 group-hover:text-sky-700 dark:group-hover:text-sky-200" />
              </div>

              <p className="text-sm lg:text-[17px] font-[500] md:text-lg transition-colors duration-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                {locale === "tj"
                  ? item.text_tj
                  : locale === "ru"
                  ? item.text_ru
                  : item.text_en}
              </p>
            </div>
          );
        })}
      </div>

      {/* MUI Modal */}
      {current && (
        <Dialog
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{t("editWhyUs")}</DialogTitle>
          <DialogContent dividers>
            <ToggleButtonGroup
              value={lang}
              exclusive
              onChange={(_, val) => val && setLang(val)}
              fullWidth
              sx={{ mb: 2 }}
            >
              {["ru", "en", "tj"].map((code) => (
                <ToggleButton
                  key={code}
                  value={code}
                  sx={{ textTransform: "none" }}
                >
                  {code.toUpperCase()}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField
              label={`${t("text")} (${lang.toUpperCase()})`}
              value={current[`text_${lang}`] || ""}
              onChange={(e) =>
                setCurrent((prev) => ({
                  ...prev,
                  [`text_${lang}`]: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </DialogContent>

          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button onClick={() => setModalOpen(false)} color="inherit">
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} variant="contained" color="success">
              {t("save")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default WhyUs;
