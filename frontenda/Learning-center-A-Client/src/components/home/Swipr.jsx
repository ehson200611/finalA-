"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay, Keyboard } from "swiper/modules";
import toast, { Toaster } from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Card,
  CardMedia,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import PublicIcon from "@mui/icons-material/Public";

import {
  useGetSwiperQuery,
  useAddSwiperMutation,
  useUpdateSwiperMutation,
  useDeleteSwiperMutation,
} from "@/store/slices/home";

import ConsultationModal from "@/components/layout/ConsultationModal";
import Image from "next/image";
import Errors from "../error/errors";
import Loading from "../loading/loading";

export default function Swipr({ isAdmin }) {
  const locale = useLocale();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = useTranslations("homePage");
  const { data: swipperData, isLoading, error, refetch } = useGetSwiperQuery();

  const [addSwiper, { isLoading: adding }] = useAddSwiperMutation();
  const [editSwiper, { isLoading: editing }] = useUpdateSwiperMutation();
  const [deleteSwiper] = useDeleteSwiperMutation();

  const [openModal, setOpenModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState(null);

  const openDeleteModal = (slide) => {
    setSlideToDelete(slide);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSlideToDelete(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!slideToDelete) return;

    const toastId = toast.loading(t("deleting"));
    try {
      await deleteSwiper(slideToDelete.id).unwrap();
      toast.success(t("deleted"), { id: toastId });
    } catch {
      toast.error(t("deleteError"), { id: toastId });
    } finally {
      closeDeleteModal();
    }
  };

  const [newSlide, setNewSlide] = useState({
    name: { ru: "", en: "", tj: "" },
    title: { ru: "", en: "", tj: "" },
    href: "",
    image: "",
  });

  useEffect(() => {
    refetch();
  }, []);

  // ------------------- Image change -------------------
  // Для Add
  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setNewSlide((prev) => ({ ...prev, image: preview, file }));
  };

  // Для Edit
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCurrentSlide((prev) => ({ ...prev, image: preview, file }));
  };

  // ------------------- Add Slide -------------------
  const handleAdd = async () => {
    const toastId = toast.loading(t("adding"));
    setAddModal(false);
    try {
      const formData = new FormData();

      formData.append("title_ru", newSlide.title.ru);
      formData.append("title_en", newSlide.title.en);
      formData.append("title_tj", newSlide.title.tj);

      if (newSlide.name.ru) formData.append("name_ru", newSlide.name.ru);
      if (newSlide.name.en) formData.append("name_en", newSlide.name.en);
      if (newSlide.name.tj) formData.append("name_tj", newSlide.name.tj);

      if (newSlide.href) formData.append("href", newSlide.href);
      if (newSlide.order) formData.append("order", newSlide.order);

      if (newSlide.file) formData.append("image", newSlide.file);

      await addSwiper(formData).unwrap();

      toast.success(t("added"), { id: toastId });
      setNewSlide({
        title: { ru: "", en: "", tj: "" },
        name: { ru: "", en: "", tj: "" },
        href: "",
        image: "",
        file: null,
      });
    } catch (e) {
      toast.error(t("addError"), { id: toastId });
    }
  };

  // ------------------- Edit Slide -------------------
  const openEdit = (slide) => {
    setCurrentSlide({
      id: slide.id,
      href: slide.href || "",
      order: slide.order,
      image: slide.image || "",
      file: null,
      title: {
        ru: slide.title_ru || "",
        en: slide.title_en || "",
        tj: slide.title_tj || "",
      },
      name: {
        ru: slide.name_ru || "",
        en: slide.name_en || "",
        tj: slide.name_tj || "",
      },
    });
    setEditModal(true);
  };

  const handleEdit = async () => {
    const toastId = toast.loading(t("saving"));

    try {
      const formData = new FormData();

      formData.append("title_ru", currentSlide.title.ru);
      formData.append("title_en", currentSlide.title.en);
      formData.append("title_tj", currentSlide.title.tj);

      if (currentSlide.name.ru)
        formData.append("name_ru", currentSlide.name.ru);
      if (currentSlide.name.en)
        formData.append("name_en", currentSlide.name.en);
      if (currentSlide.name.tj)
        formData.append("name_tj", currentSlide.name.tj);

      if (currentSlide.href) formData.append("href", currentSlide.href);
      if (currentSlide.order) formData.append("order", currentSlide.order);

      // Только если файл заменили — добавляем
      if (currentSlide.file) formData.append("image", currentSlide.file);

      await editSwiper({ id: currentSlide.id, data: formData }).unwrap();

      toast.success(t("updated"), { id: toastId });
      setEditModal(false);
    } catch (e) {
      toast.error(t("errSave"), { id: toastId });
    }
  };
  
  if (!mounted) return null;

  if (error) {
    return (
      <Errors
        error={error}
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }
  if (isLoading) return <Loading />;
  // ------------------- JSX -------------------
  return (
    <div className="w-full ">
      <Toaster />

      {isAdmin && (
        <Button
          variant="contained"
          onClick={() => setAddModal(true)}
          sx={{ marginBottom: "16px" }}
        >
          + {t("add")}
        </Button>
      )}

      <ConsultationModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
      />

      <Swiper
        modules={[Pagination, Autoplay, Keyboard]}
        spaceBetween={20}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true }}
        speed={300}
        className="rounded-lg"
      >
        {swipperData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              style={{ backgroundImage: `url(${slide.image})` }}
              className="relative min-h-[420px] overflow-hidden  bg-center bg-no-repeat bg-cover"
            >
              <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 bg-black/30 p-6 text-white min-h-[420px] w-full">
                {/* TEXT SECTION */}
                <div className="relative z-20 md:w-1/2 h-full">
                  <h2 className="text-2xl md:text-4xl font-bold mb-3">
                    {locale === "ru"
                      ? slide.name_ru
                      : locale === "en"
                      ? slide.name_en
                      : slide.name_tj}
                  </h2>

                  <p className="mb-4 text-base md:text-lg">
                    {locale === "ru"
                      ? slide.title_ru
                      : locale === "en"
                      ? slide.title_en
                      : slide.title_tj}
                  </p>

                  <button
                    {...(slide.href
                      ? {
                          as: "a",
                          href: slide.href,
                          target: "_blank",
                          rel: "noopener noreferrer",
                        }
                      : { onClick: () => setOpenModal(true) })}
                    className="bg-gradient-to-r from-yellow-300 to-yellow-400 text-black font-medium px-6 py-3 rounded-md hover:scale-105 active:scale-95 transition"
                  >
                    {t("buttonSignUp")}
                  </button>
                </div>

                {/* ADMIN BUTTONS */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 z-30">
                    <button
                      className=" bg-white/50 w-10 h-10 rounded-full hover:bg-white/10 transition"
                      onClick={() => openEdit(slide)}
                    >
                      <EditIcon fontSize="small" />
                    </button>

                    <button
                      onClick={() => openDeleteModal(slide)}
                      className=" bg-red-600 text-white w-10 h-10 rounded-full hover:bg-red-700 transition flex items-center justify-center"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* MODALS */}
      <SlideDialog
        open={addModal}
        title={t("newSlide")}
        slide={newSlide}
        setSlide={setNewSlide}
        handleImageChange={handleAddImageChange}
        onClose={() => setAddModal(false)}
        onSubmit={handleAdd}
        loading={adding}
      />

      {currentSlide && (
        <SlideDialog
          open={editModal}
          title={t("updateSlide")}
          slide={currentSlide}
          setSlide={setCurrentSlide}
          handleImageChange={handleEditImageChange}
          onClose={() => setEditModal(false)}
          onSubmit={handleEdit}
          loading={editing}
        />
      )}

      <Dialog open={deleteModalOpen} onClose={closeDeleteModal}>
        <DialogTitle>{t("deleteSlide")}</DialogTitle>
        <DialogActions sx={{ padding: "15px" }}>
          <Button onClick={closeDeleteModal}>{t("cancel")}</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// ---------------- SlideDialog ----------------
function SlideDialog({
  open,
  title,
  onClose,
  onSubmit,
  loading,
  slide,
  setSlide,
  handleImageChange,
}) {
  const [lang, setLang] = useState("ru");
  if (!slide) return null;
  const t = useTranslations("homePage");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>

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
              <PublicIcon sx={{ mr: 1 }} /> {code.toUpperCase()}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
          <TextField
            label={`${t("name")} ${lang.toUpperCase()} ${t("requiredField")}`}
            value={slide.name?.[lang] ?? ""}
            onChange={(e) =>
              setSlide((prev) => ({
                ...prev,
                name: { ...prev.name, [lang]: e.target.value },
              }))
            }
            fullWidth
            size="small"
          />
          <TextField
            label={`${t("title")} (${lang.toUpperCase()}) ${t(
              "requiredField"
            )}`}
            value={slide.title?.[lang] ?? ""}
            onChange={(e) =>
              setSlide((prev) => ({
                ...prev,
                title: { ...prev.title, [lang]: e.target.value },
              }))
            }
            fullWidth
            size="small"
          />
          <TextField
            label={t("link")}
            value={slide.href ?? ""}
            onChange={(e) =>
              setSlide((prev) => ({ ...prev, href: e.target.value }))
            }
            fullWidth
            size="small"
          />
        </Box>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t("photo")}
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{ textTransform: "none" }}
          >
            {t("chooseFile")}
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageChange}
            />
          </Button>
        </Box>

        {slide.image && (
          <Card sx={{ mt: 2, borderRadius: 1 }}>
            <CardMedia
              component="img"
              width="50"
              height="50"
              image={slide.image}
              alt="preview"
              sx={{
                objectFit: "cover",
                maxHeight: 200,
                maxWidth: 200,
                margin: "auto",
              }}
            />
          </Card>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{ textTransform: "none" }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
        >
          {loading ? (
            <span>
              {t("savings")}{" "}
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            </span>
          ) : (
            t("save")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
