"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import {
  useAddTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetTestimonialsQuery,
} from "@/store/slices/home";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Box,
  Typography,
  TextField,
  Stack,
  Rating,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PublicIcon from "@mui/icons-material/Public";

import { toast } from "react-hot-toast";
import { User } from "lucide-react";
import Loading from "../loading/loading";

const Testimonials = ({ isAdmin }) => {
  const { theme } = useTheme();
  const locale = useLocale();
  const {
    data: testimonials = [],
    isLoading,
    isError,
  } = useGetTestimonialsQuery();
  const [addTestimonial] = useAddTestimonialMutation();
  const [editTestimonial] = useUpdateTestimonialMutation();
  const [deleteTestimonial] = useDeleteTestimonialMutation();
  const t = useTranslations("homePage");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [name, setName] = useState({ ru: "", en: "", tj: "" });
  const [age, setAge] = useState("");
  const [review, setReview] = useState({ ru: "", en: "", tj: "" });
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState(""); // <-- добавлено
  const fileInputRef = useRef(null);
  const [lang, setLang] = useState("ru");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);

  const openDeleteModal = (item) => {
    setTestimonialToDelete(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTestimonialToDelete(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!testimonialToDelete) return;
    const toastId = toast.loading(t("deleting"));
    try {
      await deleteTestimonial(testimonialToDelete.id).unwrap();
      toast.success(t("deleted"), { id: toastId });
    } catch {
      toast.error(t("deleteError"), { id: toastId });
    } finally {
      closeDeleteModal();
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditMode(true);
      setCurrentId(item.id);
      setName({
        ru: item.name_ru ?? "",
        en: item.name_en ?? "",
        tj: item.name_tj ?? "",
      });
      setAge(item.age ?? "");
      setReview({
        ru: item.review_ru ?? "",
        en: item.review_en ?? "",
        tj: item.review_tj ?? "",
      });
      setImage(item.image ?? "");
      setImagePreview(item.image ?? "");
    } else {
      // new
      setEditMode(false);
      setCurrentId(null);
      setName({ ru: "", en: "", tj: "" });
      setAge("");
      setReview({ ru: "", en: "", tj: "" });
      setImage("");
      setImagePreview("");
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setCurrentId(null);
    setName({ ru: "", en: "", tj: "" });
    setReview({ ru: "", en: "", tj: "" });
    setAge("");
    setImage("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("pleaseCanUp"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      setImage(result);
      setImagePreview(result);
    };
    reader.onerror = () => {
      toast.error(t("errorReadfile"));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("age", age.trim());

    // имена (обязательные поля)
    formData.append("name_ru", name.ru);
    formData.append("name_en", name.en);
    formData.append("name_tj", name.tj);

    // отзывы (опционально, но если есть — добавляем)
    if (review.ru) formData.append("review_ru", review.ru);
    if (review.en) formData.append("review_en", review.en);
    if (review.tj) formData.append("review_tj", review.tj);

    // картинка — берем из file input (fileInputRef)
    const file = fileInputRef.current?.files?.[0];
    if (file) formData.append("image", file);

    try {
      if (editMode) {
        // КЛЮЧЕВО: передаём formData в поле formData (согласовано с RTK slice выше)
        await editTestimonial({ id: currentId, formData }).unwrap();
      } else {
        await addTestimonial(formData).unwrap();
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert(t("erorDown"));
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  if (isLoading) return <Loading />;
  if (isError)
    return <div className="text-red-600 text-center">{t("error")}!</div>;

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <h2
          className={`text-[28px] font-bold ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          {t("FeedbackFromGraduates")}
        </h2>

        {isAdmin && (
          <Button
            variant="contained"
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + {t("add")}
          </Button>
        )}
      </div>

      <div className="flex gap-26 overflow-x-auto scrollbar-hide py-10">
        {testimonials?.map((item) => (
          <div key={item.id} className="shrink-0 w-[320px]">
            <TestimonialCard
              item={item}
              theme={theme}
              locale={locale}
              onEdit={() => openModal(item)}
              onDelete={() => openDeleteModal(item)}
              isAdmin={isAdmin}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-[25px] justify-between  md:flex-row">
        <div
          className={`${
            theme === "dark"
              ? "bg-linear-to-br from-gray-900 to-gray-800"
              : "bg-white"
          }  w-[100%] shadow-md p-[10px] h-[100px] rounded-lg flex items-center justify-between  md:p-[20px]`}
        >
          <div className="flex items-center gap-[15px]">
            <p className="text-2xl font-bold md:text-3xl">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </p>
            <p className="text-xs text-gray-400 font-[500]">
              {t("reviewsSourceGoogle")}
            </p>
          </div>
          <div className="flex items-center gap-[10px]">
            <Stack spacing={1}>
              <Rating
                name="half-rating-read"
                defaultValue={5}
                precision={0.5}
                readOnly
              />
            </Stack>
            <p className="text-2xl font-bold md:text-3xl">4.9</p>
          </div>
        </div>
        <div
          className={` ${
            theme === "dark"
              ? "bg-linear-to-br from-gray-900 to-gray-800"
              : "bg-white"
          }  w-[100%] shadow-md p-[10px] h-[100px] rounded-lg flex items-center justify-between  md:p-[20px]`}
        >
          <div className="flex  items-center gap-[15px]">
            <p className="text-2xl font-bold md:text-3xl text-red-600">
              Yandex
            </p>
            <p className="text-xs text-gray-400 font-[500]">
              {t("reviewsSourceYandex")}
            </p>
          </div>
          <div className="flex items-center gap-[10px]">
            <Stack spacing={1}>
              <Rating
                name="half-rating-read"
                defaultValue={5}
                precision={0.5}
                readOnly
              />
            </Stack>
            <p className="text-2xl font-bold md:text-3xl">4.95</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={deleteModalOpen} onClose={closeDeleteModal}>
        <DialogTitle>{t("deleteOt")}</DialogTitle>
        <DialogActions sx={{ padding: "15px" }}>
          <Button onClick={closeDeleteModal}>Отмена</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== MODAL MUI ===== */}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="md">
        <DialogTitle>
          {editMode ? t("addOt") : t("updateOt")}
          <IconButton
            onClick={closeModal}
            sx={{ position: "absolute", right: 14, top: 14 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {/* Toggle кнопки языка */}
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(_, val) => val && setLang(val)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {["ru", "en", "tj"].map((code) => (
              <ToggleButton key={code} value={code}>
                {code.toUpperCase()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Инпуты имени и отзыва для выбранного языка */}
          <TextField
            label={`${t("name")} (${lang.toUpperCase()})`}
            value={name[lang] || ""}
            onChange={(e) =>
              setName((prev) => ({ ...prev, [lang]: e.target.value }))
            }
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          <TextField
            label={`${t("text")} (${lang.toUpperCase()})`}
            value={review[lang] || ""}
            onChange={(e) =>
              setReview((prev) => ({ ...prev, [lang]: e.target.value }))
            }
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {/* Фото */}
          <div className="mt-4">
            {/* файл-инпут — полный ширины, вид как во втором варианте */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full mb-4 cursor-pointer hover:bg-gray-100 py-2 px-3 border border-gray-300 rounded-lg"
            />

            {/* превью или dashed placeholder */}
            {imagePreview ? (
              <div className="w-full h-48 flex items-center justify-center rounded-lg overflow-hidden mt-4 relative">
                {/* Next/Image с fill — контейнер relative выше */}
                <Image
                  src={imagePreview}
                  alt="preview"
                  fill
                  className="object-contain"
                  // если у тебя Next.js ругается на внешний DataURL, можно добавить unoptimized
                  // unoptimized
                />
              </div>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 192,
                  border: "2px dashed #ccc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginTop: "16px",
                }}
              >
                {t("changeFile")}
              </Box>
            )}
          </div>
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={closeModal} color="inherit">
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="success">
            {editMode ? t("save") : t("add")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// ==== TestimonialCard с сохранением стилей ====
const TestimonialCard = ({
  item,
  theme,
  locale,
  getLocalizedText,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  const t = useTranslations("homePage");
  return (
    <div
      className={`relative group  p-6 rounded-lg  transition-all duration-300 h-full flex flex-col shadow-md hover:shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
      style={{ minWidth: "380px", maxWidth: "420px" }}
    >
      {/* Кнопки редактирования — сверху справа */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex flex-col-reverse gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className=" bg-black/20 w-10 h-10 rounded-full hover:bg-black/30 transition"
            title={t("update")}
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="w-10 h-10 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg transition-all"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      )}

      {/* Фото + Имя + Возраст */}
      <div className="flex items-start gap-6 mb-5">
        {/* КВАДРАТНОЕ ФОТО */}
        <div className="shrink-0">
          {item.image ? (
            <div className="relative overflow-hidden rounded-2xl w-[100px] h-[100px] shadow-md border border-gray-200 dark:border-gray-700">
              <SafeImage
                src={item.image}
                alt={"Image"}
                width={100}
                height={100}
                className="object-cover transition-transform duration-500 hover:scale-105 rounded-2xl"
              />
            </div>
          ) : (
            <div
              className={`w-[100px] h-[100px] rounded-2xl flex items-center justify-center shadow-lg ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <User size={45} />
            </div>
          )}
        </div>

        {/* Имя и возраст */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight break-words whitespace-normal">
            {locale === "ru"
              ? item.name_ru
              : locale === "en"
              ? item.name_en
              : item.name_tj}
          </h3>
          <p
            className={`text-sm font-medium mt-1 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {item.age}
            {locale === "ru" ? "лет" : locale === "en" ? "years" : "сол"}
          </p>
        </div>
      </div>

      {/* Отзыв */}
      <div
        className={`flex-1 p-5 rounded-2xl border-l-4 border-blue-500 ${
          theme === "dark"
            ? "bg-gray-700/50"
            : "bg-gradient-to-r from-blue-50 to-transparent"
        }`}
      >
        <p
          className="text-sm leading-relaxed italic whitespace-pre-line break-words"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 10,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {locale === "ru"
            ? item.review_ru
            : locale === "en"
            ? item.review_en
            : item.review_tj}
        </p>
      </div>
    </div>
  );
};

export default Testimonials;
