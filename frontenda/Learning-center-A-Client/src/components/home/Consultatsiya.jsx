"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Pagination, Autoplay, Keyboard, Navigation } from "swiper/modules";
import { useTheme } from "next-themes";
import {
  useGetInfoSwiperQuery,
  useUpdateInfoSwiperMutation,
} from "@/store/slices/home";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import PublicIcon from "@mui/icons-material/Public";
import toast, { Toaster } from "react-hot-toast";
import Loading from "../loading/loading";

import { useSendSmsMutation } from "@/store/slices/auth";
import { useAddNotificationMutation } from "@/store/slices/notificationAdminApi";

export default function Consultatsiya({ isAdmin }) {
  const t = useTranslations("homePage");
  const locale = useLocale();

  const { theme } = useTheme();

  // ==== СТЕЙТЫ ДЛЯ ФОРМЫ ====
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  const {
    data: infoSwiper,
    isLoading,
    isError,
  } = useGetInfoSwiperQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    pollingInterval: 0,
  });
  const [updateInfoSwiper, { isLoading: isSaving }] =
    useUpdateInfoSwiperMutation();
  const [sendSms] = useSendSmsMutation();
  const [addNotification] = useAddNotificationMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (editData?.preview) {
        URL.revokeObjectURL(editData.preview);
      }
    };
  }, [editData?.preview]);

  // ==== ФУНКЦИИ ДЛЯ ФОРМЫ КОНСУЛЬТАЦИИ/ОТПРАВКИ СМС ====

  const handleSendSms = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error(t("enterNamePhone"));
      return;
    }

    setLoading(true);

    try {
      await sendSms({
        phoneNumber: phone,
        purpose: "notification",
      }).unwrap();

      toast.success(t("smsSent"));
      setStep(2);
    } catch (err) {
      toast.error(t("smsError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast.error(t("enterCode"));
      return;
    }

    setLoading(true);

    try {
      await addNotification({
        name,
        title: phone,
        type: "success",
        code,
        status: "unread",
      }).unwrap();

      toast.success(t("notificationSent"));
      setStep(3);

      setTimeout(() => {
        setStep(1);
        setName("");
        setPhone("");
        setCode("");
      }, 3000);
    } catch (err) {
      toast.error(t("notificationError"));
    } finally {
      setLoading(false);
    }
  };

  // ==== ФУНКЦИИ ДЛЯ РЕДАКТИРОВАНИЯ СЛАЙДОВ ====

  const openEditModal = (slide) => {
    setEditData({
      id: slide.id,
      order: slide.order || 0,
      activeLang: "ru",

      title: {
        ru: slide.title_ru || "",
        en: slide.title_en || "",
        tj: slide.title_tj || "",
      },

      description: {
        ru: slide.description_ru || "",
        en: slide.description_en || "",
        tj: slide.description_tj || "",
      },

      backgroundImage: null,
      background_image: slide.background_image || "",
      preview: null,
    });

    setIsModalOpen(true);
  };

  const handleInputChange = (field, lang, value) => {
    if (lang) {
      setEditData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value,
        },
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageChange = (file) => {
    setEditData((prev) => ({
      ...prev,
      backgroundImage: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("order", editData.order);
      formData.append("title_ru", editData.title.ru);
      formData.append("title_en", editData.title.en);
      formData.append("title_tj", editData.title.tj);

      formData.append("description_ru", editData.description.ru || "");
      formData.append("description_en", editData.description.en || "");
      formData.append("description_tj", editData.description.tj || "");

      // если новое фото выбрано — добавляем его
      if (editData.backgroundImage instanceof File) {
        formData.append("background_image", editData.backgroundImage);
      }

      await updateInfoSwiper({ id: editData.id, data: formData }).unwrap();

      setIsModalOpen(false);
      toast.success(t("saveSuccess"));
    } catch (err) {
      toast.error(t("errSave"));
    }
  };
  const [lang, setLang] = useState("ru");

  if (!mounted) return null;
  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="text-center py-8 text-red-500">{t("errorDownData")}</div>
    );

  return (
    <div className="relative py-8 flex  flex-col gap-10 justify-between lg:flex-row">
      <Toaster />
      {/* swiper  */}
      <div
        className={`lg:max-w-[600px] md:max-w-[750px] max-w-full h-[400px] ${
          theme === "dark" ? "text-white" : "text-black"
        } mx-auto`}
        tabIndex={0}
      >
        <Swiper
          modules={[Pagination, Autoplay, Keyboard, Navigation]}
          spaceBetween={10}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 10 },
            1024: { slidesPerView: 1, spaceBetween: 20, maxWidth: 650 },
          }}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          keyboard={{
            enabled: true,
            onlyInViewport: false,
          }}
          style={{ borderRadius: "8px" }}
          pagination={{ clickable: true }}
          speed={300}
        >
          {infoSwiper.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <div className="relative  rounded-lg h-full w-full flex items-center justify-center">
                {/* Кнопка редактирования появляется при hover */}
                {isAdmin && (
                  <button
                    onClick={() => openEditModal(slide)}
                    className="absolute top-3 right-3 z-20   transition-opacity duration-300 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-lg"
                  >
                    {t("update")}
                  </button>
                )}

                <Image
                  src={slide.background_image}
                  alt={"slide image"}
                  fill
                  sizes="100vw"
                  className="object-cover object-center lg:object-cover"
                />

                <div
                  className={`flex flex-col items-center justify-center  p-4 md:p-6 h-auto min-h-[400px] relative overflow-hidden ${
                    slide.background_image
                      ? ""
                      : theme === "dark"
                      ? "bg-gray-800"
                      : "bg-linear-to-r from-[#00CED1] to-[#40E0D0]"
                  }`}
                >
                  {/* Затемнение для лучшей читаемости текста */}
                  {slide.background_image && (
                    <div className="absolute inset-0 bg-black/50 "></div>
                  )}

                  {/* Контент с улучшенной читаемостью */}
                  <div
                    className={`relative z-10 w-full max-w-2xl mx-auto ${
                      slide.background_image
                        ? "text-white drop-shadow-lg"
                        : theme === "dark"
                        ? "text-gray-100"
                        : "text-white"
                    }`}
                  >
                    <p
                      className={`text-2xl md:text-3xl font-bold mb-4 text-center leading-tight `}
                    >
                      {locale === "ru"
                        ? slide.title_ru
                        : locale === "en"
                        ? slide.title_en
                        : slide.title_tj}
                    </p>
                    <p
                      className={`text-base md:text-lg text-center leading-relaxed `}
                    >
                      {locale === "ru"
                        ? slide.description_ru
                        : locale === "en"
                        ? slide.description_en
                        : slide.description_tj}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Форма консультации */}
      <div
        className={`border p-5 lg:max-w-[600px] md:max-w-[750px] max-w-[400px] h-auto flex flex-col justify-between rounded-lg ${
          theme === "dark"
            ? "bg-[#042834] border-gray-700 text-white"
            : "bg-white border-gray-300 text-black"
        }`}
      >
        {/* Заголовок */}
        <div className="flex flex-col items-start gap-[15px]">
          <h6
            className={`text-3xl text-center m-auto font-bold ${
              theme === "dark" ? "text-gray-100" : "text-black"
            }`}
          >
            {t("freeConsultTitle")}
          </h6>
          <p
            className={`text-[17px] lg:mb-0 mb-6 text-center font-medium ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("freeConsultDesc")}
          </p>
        </div>

        {/* === STEP 1 — ВВОД ИМЕНИ И ТЕЛЕФОНА === */}
        {step === 1 && (
          <form
            className="flex flex-col items-center gap-[25px]"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendSms();
            }}
          >
            <input
              className={`border w-[95%] py-2.5 rounded-md px-[25px] ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-600"
              }`}
              type="text"
              placeholder={t("formName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />

            <input
              className={`border w-[95%] py-2.5 rounded-md px-[25px] ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-600"
              }`}
              type="tel"
              placeholder={t("formPhone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />

            <button
              className={`w-[95%] border cursor-pointer px-15 py-2.5 rounded-md md:px-[170px] ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  : "bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
              }`}
              disabled={loading}
            >
              {loading ? t("sending") : t("formSubmit")}
            </button>
          </form>
        )}

        {/* === STEP 2 — ВВОД КОДА === */}
        {step === 2 && (
          <div className="flex flex-col gap-4 mt-5">
            <p className="text-center">{t("enterSms")}</p>

            <input
              className={`border w-[95%] py-2.5 rounded-md px-[25px] mx-auto ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-600"
              }`}
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length < 4}
              className={`w-[95%] mx-auto border cursor-pointer px-15 py-2.5 rounded-md md:px-[170px] ${
                theme === "dark"
                  ? "bg-green-700 hover:bg-green-600 text-white border-green-600"
                  : "bg-green-500 hover:bg-green-600 text-white border-green-500"
              }`}
            >
              {loading ? t("loading") : t("confirmCode")}
            </button>

            <button
              onClick={handleSendSms}
              disabled={loading}
              className="text-blue-500 hover:text-blue-600 underline text-center"
            >
              {t("resendCode")}
            </button>
          </div>
        )}

        {/* === STEP 3 — УСПЕХ === */}
        {step === 3 && (
          <div className="text-center text-green-500 font-semibold py-5">
            {t("successMessage")}
          </div>
        )}
      </div>

      {/* Модальное окно для редактирования одного слайда */}
      {isModalOpen && editData && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {t("updateSlide")}
            <IconButton
              onClick={() => setIsModalOpen(false)}
              sx={{ position: "absolute", right: 10, top: 10 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ padding: "20px" }}>
            {/* Переключатель языков */}
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
                  <PublicIcon sx={{ mr: 1 }} /> {code.toUpperCase()}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Активный язык */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label={`${t("title")} (${editData.activeLang?.toUpperCase()})`}
                fullWidth
                value={editData.title[editData.activeLang] || ""}
                onChange={(e) =>
                  handleInputChange(
                    "title",
                    editData.activeLang,
                    e.target.value
                  )
                }
              />

              <TextField
                label={`${t(
                  "descriptionText"
                )} (${editData.activeLang?.toUpperCase()})`}
                fullWidth
                multiline
                rows={4}
                value={editData?.description?.[editData.activeLang] ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "description",
                    editData.activeLang,
                    e.target.value
                  )
                }
              />
            </Box>

            {/* Фоновое изображение */}
            <Box sx={{ marginTop: 3 }}>
              <p className="text-sm opacity-50 mb-1">{t("imageLoad")}</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files[0] && handleImageChange(e.target.files[0])
                }
              />

              {editData.background_image && (
                <img
                  src={editData.preview || editData.background_image}
                  alt="preview"
                  className="mt-3 w-1/3 mx-auto object-cover rounded-lg border"
                />
              )}
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button onClick={() => setIsModalOpen(false)} variant="outlined">
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="success"
              disabled={isSaving}
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
