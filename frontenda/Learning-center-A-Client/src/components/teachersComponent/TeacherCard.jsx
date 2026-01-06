"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, X, Upload, Play, User } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { useTranslations } from "next-intl";

const TeacherCard = ({
  teacher,
  theme,
  lang,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  const [showVideo, setShowVideo] = useState(false);
  const [localVideo, setLocalVideo] = useState(teacher?.video || null);
  const [localImage, setLocalImage] = useState(teacher?.image || null);
  const [imageError, setImageError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalVideo(teacher?.video || null);
    setLocalImage(teacher?.image || null);
    setImageError(false);
  }, [teacher]);

  // CORRECTED TEXT HANDLING - based on your API response structure
  const getName = () => {
    if (!teacher) return "";
    if (teacher.name_ru && teacher.name_en && teacher.name_tj) {
      return teacher[`name_${lang}`] || teacher.name_ru;
    }
    return teacher.name || "";
  };

  const getDescription = () => {
    if (!teacher) return "";
    if (
      teacher.description_ru &&
      teacher.description_en &&
      teacher.description_tj
    ) {
      return teacher[`description_${lang}`] || teacher.description_ru;
    }
    return teacher.description || "";
  };

  const getTitle = () => {
    const name = getName();
    const experience = teacher?.experience || 0;
    return `${name} - ${experience} ${getExperienceText()}`;
  };

  const getExperienceText = () => {
    switch (lang) {
      case "en":
        return "years experience";
      case "tj":
        return "сол таҷриба";
      case "ru":
      default:
        return "лет опыта";
    }
  };

  const getDialogTexts = () => {
    switch (lang) {
      case "en":
        return {
          title: "Confirm Delete",
          content: `Are you sure you want to delete ${getName()}? This action cannot be undone.`,
          cancel: "Cancel",
          confirm: "Delete",
        };
      case "tj":
        return {
          title: "Таъкиди нест кардан",
          content: `Шумо мутмаин ҳастед, ки мехоҳед ${getName()}-ро нест кунед? Ин амал бекор карда намешавад.`,
          cancel: "Бекор кардан",
          confirm: "Нест кардан",
        };
      case "ru":
      default:
        return {
          title: "Подтверждение удаления",
          content: `Вы уверены, что хотите удалить ${getName()}? Это действие нельзя отменить.`,
          cancel: "Отмена",
          confirm: "Удалить",
        };
    }
  };

  const getDescriptionContent = () => {
    const description = getDescription();
    const maxLength = 50;
    
    // If description is empty or null
    if (!description || description.length === 0) {
      return "";
    }
    
    // If description length is less than or equal to 50
    if (description.length <= maxLength) {
      return description;
    }
    
    // If expanded (showing full text)
    if (isExpanded) {
      return (
        <>
          {description}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-blue-500 ml-1 underline text-sm sm:text-base"
          >
            Less
          </button>
        </>
      );
    }
    
    // If not expanded (showing truncated text)
    return (
      <>
        {description.slice(0, maxLength)}...
        <button
          onClick={() => setIsExpanded(true)}
          className="text-blue-500 ml-1 underline text-sm sm:text-base"
        >
          More
        </button>
      </>
    );
  };

  const name = getName();
  const title = getTitle();
  const dark = theme === "dark";
  const dialogTexts = getDialogTexts();

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setLocalVideo(URL.createObjectURL(file));
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    onDelete(teacher);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  // Function to get image URL - handles both relative and absolute URLs
  const getImageUrl = () => {
    if (!localImage || imageError) return null;

    // If it's already a full URL, use it
    if (localImage.startsWith("http")) {
      return localImage;
    }

    // If it's a relative path, construct the full URL
    if (localImage.startsWith("/")) {
      return `http://89.169.2.116:8080${localImage}`;
    }

    return localImage;
  };

  const imageUrl = getImageUrl();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.25 }}
        className={`relative rounded-2xl shadow-lg overflow-hidden border mt-[20px] ${
          dark
            ? "bg-gray-900 text-white border-gray-700 hover:shadow-gray-600"
            : "bg-white text-gray-900 border-gray-200 hover:shadow-lg"
        }`}
      >
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={onEdit}
              className={`p-2 rounded-full ${
                dark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-transform transform hover:scale-110`}
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={handleDeleteClick}
              className={`p-2 rounded-full ${
                dark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-transform transform hover:scale-110`}
            >
              <Trash2
                size={18}
                className={dark ? "text-red-400" : "text-red-600"}
              />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 p-4 sm:p-6">
          <div className="flex md:justify-center gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide md:overflow-visible">
            <div className="shrink-0 w-64 h-64 sm:h-56 md:h-56 lg:h-65 snap-center">
              {imageUrl && !imageError ? (
                <Image
                  src={imageUrl}
                  alt={name || "teacher"}
                  width={800}
                  height={800}
                  className="object-cover rounded-2xl w-full h-full"
                  onError={handleImageError}
                  unoptimized
                />
              ) : (
                <div
                  className={`w-full h-full rounded-2xl flex items-center justify-center ${
                    dark ? "bg-gray-800" : "bg-gray-200"
                  }`}
                >
                  <User
                    size={48}
                    className={dark ? "text-gray-400" : "text-gray-500"}
                  />
                </div>
              )}
            </div>

            {localVideo ? (
              <div
                className="shrink-0 lg:hidden w-64 h-64 sm:h-56 snap-center relative bg-black rounded-xl overflow-hidden shadow-md cursor-pointer"
                onClick={() => setShowVideo(true)}
              >
                <video
                  src={localVideo}
                  className="w-full h-full object-cover rounded-xl"
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play
                    size={28}
                    className="text-white opacity-80 hover:opacity-100 transition"
                  />
                </div>
              </div>
            ) : isAdmin ? (
              <label
                htmlFor={`video-upload-${teacher?.id}`}
                className="shrink-0 lg:hidden w-64 h-64 sm:h-56 snap-center cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-gray-300 bg-gray-50 hover:bg-gray-100 transition group"
              >
                <Upload
                  size={28}
                  className="mb-2 text-gray-400 group-hover:text-gray-600 transition"
                />
                <span className="text-gray-500 text-sm sm:text-base font-medium group-hover:text-gray-700">
                  {lang === "en"
                    ? "Click to choose video"
                    : lang === "tj"
                    ? "Барои интихоби видео клик кунед"
                    : "Нажмите чтобы выбрать видео"}
                </span>
                <input
                  id={`video-upload-${teacher?.id}`}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
                />
              </label>
            ) : null}
          </div>

          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
            <p
              className={`text-sm sm:text-base mt-3 ${
                dark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {getDescriptionContent()}
            </p>
          </div>

          <div className="hidden lg:block w-72 shrink-0 mx-auto lg:mx-0 mt-4">
            {localVideo ? (
              <div
                className="relative bg-black rounded-xl overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowVideo(true)}
              >
                <video
                  src={localVideo}
                  className="w-full h-56 lg:h-65 object-cover rounded-xl"
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play
                    size={28}
                    className="text-white opacity-80 hover:opacity-100 transition"
                  />
                </div>
              </div>
            ) : isAdmin ? (
              <label
                htmlFor={`video-upload-desktop-${teacher?.id}`}
                className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl border-gray-300 bg-gray-50 hover:bg-gray-100 transition group"
              >
                <Upload
                  size={28}
                  className="mb-2 text-gray-400 group-hover:text-gray-600 transition"
                />
                <span className="text-gray-500 text-sm sm:text-base font-medium group-hover:text-gray-700">
                  {lang === "en"
                    ? "Click to choose video"
                    : lang === "tj"
                    ? "Барои интихоби видео клик кунед"
                    : "Нажмите чтобы выбрать видео"}
                </span>
                <input
                  id={`video-upload-desktop-${teacher?.id}`}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoChange}
                />
              </label>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: dark ? "#1f2937" : "white",
            color: dark ? "white" : "black",
          },
        }}
      >
        <DialogTitle id="delete-dialog-title">{dialogTexts.title}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            style={{ color: dark ? "#d1d5db" : "#4b5563" }}
          >
            {dialogTexts.content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            style={{
              color: dark ? "#60a5fa" : "#1976d2",
              borderColor: dark ? "#60a5fa" : "#1976d2",
            }}
            variant="outlined"
          >
            {dialogTexts.cancel}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
            }}
            variant="contained"
            autoFocus
          >
            {dialogTexts.confirm}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && localVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-[90%] max-w-3xl rounded-xl shadow-2xl bg-black"
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-10 -right-1 text-white bg-black/70 p-3 rounded-full hover:bg-black transition shadow-lg"
              >
                <X size={16} />
              </button>
              <video
                src={localVideo}
                controls
                autoPlay
                className="w-full h-[500px] rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeacherCard;