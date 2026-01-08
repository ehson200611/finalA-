"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import {
  useAddGalleryImageMutation,
  useDeleteGalleryImageMutation,
  useGetGalleryQuery,
} from "@/store/slices/home";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import Loading from "../loading/loading";

const ImagesGallery = ({ isAdmin }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState("");
  const { data: gallery = [], isLoading, isError } = useGetGalleryQuery();
  const [addGalleryImage] = useAddGalleryImageMutation();
  const [deleteGalleryImage] = useDeleteGalleryImageMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const t = useTranslations("homePage");

  const fileInputRef = useRef();

  const openModal = () => {
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setImageFile(null);
    setImagePreview("");
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("pleaseCanUp"));
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error(t("changeUp"));
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    setIsUploading(true);

    try {
      await addGalleryImage(formData).unwrap();
      toast.success(t("addIz"));
      closeModal();
    } catch {
      toast.error(t("errorToAddImage"));
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    const loading = toast.loading(t("deleting"));
    try {
      await deleteGalleryImage(deleteId).unwrap();
      toast.success(t("deleted"), { id: loading });
      closeDeleteModal();
    } catch {
      toast.error(t("deleteError"), { id: loading });
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500 text-center">{t("errorLoad")}</p>;

  return (
    <section className="py-16">
      <div className="flex justify-between items-center mb-6 px-4 md:px-0">
        <h4 className={`text-[28px] font-bold`}>{t("gallery")}</h4>

        {isAdmin && (
          <Button variant="contained" onClick={openModal}>
            + {t("addPhoto")}
          </Button>
        )}
      </div>

      <div className="max-w-[1300px] m-auto gap-6 flex items-center overflow-x-auto scrollbar-hide py-4">
        {gallery.length === 0 ? (
          <div
            className={`text-center py-12 rounded-lg border-2 border-dashed w-full ${
              theme === "dark"
                ? "border-gray-600 text-gray-400"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {t("noImage")}
          </div>
        ) : (
          gallery.map((item) => (
            <div key={item.id} className="relative group shrink-0">
              <SafeImage
                className={`rounded-lg border w-[300px] h-[200px] object-cover ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
                src={item.image}
                width={300}
                height={200}
                alt="gallery"
              />

              {isAdmin && (
                <button
                  onClick={() => openDeleteModal(item.id)}
                  className="absolute top-2 right-2 w-10 h-10 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- Add Modal --- */}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{}} className="flex justify-between items-center">
          <p>{t("addImage")}</p>

          <IconButton onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full mb-4 cursor-pointer hover:bg-gray-100 py-2 px-3 border border-gray-300 rounded-lg"
          />
          {imagePreview ? (
            <div className="w-full h-48 flex items-center justify-center rounded-lg  overflow-hidden mt-4 relative">
              <Image
                src={imagePreview}
                className="object-contain"
                alt="preview"
                fill
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
                fontWeight: "bold",
                marginTop: "16px",
              }}
            >
              {t("changeFile")}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={closeModal}>{t("cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!imagePreview || isUploading}
          >
            {t("add")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Delete Confirm Modal --- */}
      <Dialog open={deleteModalOpen} onClose={closeDeleteModal}>
        <DialogTitle>{t("deleteImage")}</DialogTitle>

        <DialogActions sx={{ padding: "15px" }}>
          <Button onClick={closeDeleteModal}>Отмена</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
};

export default ImagesGallery;
