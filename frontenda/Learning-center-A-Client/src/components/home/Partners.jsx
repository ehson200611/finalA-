"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  useGetPartnersQuery,
  useAddPartnerMutation,
  useDeletePartnerMutation,
} from "@/store/slices/home";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Loading from "../loading/loading";

export default function Partners({ isAdmin = false }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState("")
  const { data: partners = [], isLoading } = useGetPartnersQuery();
  const [addPartner] = useAddPartnerMutation();
  const [deletePartner] = useDeletePartnerMutation();

  const [hovered, setHovered] = useState(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef();
  const t = useTranslations("homePage")


  const openModal = () => {
    setFile(null);
    setPreview("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFile(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  // file handler
  const handleUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error(t('changeUp'));
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const confirmUpload = async () => {
    if (!file) {
      toast.error(t('firstChange'));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      await addPartner(formData).unwrap();
      toast.success(t('together'));
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(t('addError'));
    } finally {
      setIsUploading(false);
    }
  };

  // delete confirm
  const confirmDelete = async () => {
    try {
      const t = toast.loading(t('deleting'));
      await deletePartner(deleteId).unwrap();
      toast.success(t('deleted'), { id: t });
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setDeleteId(null);
    }
  };
   useEffect(() => {
      setMounted(true)
    }, []);

  if(!mounted) return null

  const finalLogos = [...partners, ...partners]; // duplicate for marquee effect

  if (isLoading) return <Loading />;

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{t('outFre')}</h1>

        {isAdmin && (
          <Button variant="contained" onClick={openModal}>
            + {t('add')}
          </Button>
        )}
      </div>

      <div className="relative flex overflow-hidden py-5">
        <div className="animate-slide flex gap-12">
          {finalLogos.map((item, i) => (
            <div
              key={item.id + "-" + i}
              className="w-48 flex-none flex items-center justify-center hover:scale-110 transition-transform duration-300 relative"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Image
                width={420}
                height={120}
                alt="partner"
                src={item.image}
                className="object-contain w-full h-full"
              />

              {hovered === item.id && isAdmin && (
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="absolute bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full shadow"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL UPLOAD */}
      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {t('addPartner')}
          <IconButton
            onClick={closeModal}
            sx={{ position: "absolute", right: 14, top: 14 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="block w-full mb-4 cursor-pointer hover:bg-gray-100 py-2 px-3 border border-gray-300 rounded-lg"
          />

          {preview ? (
            <div className="w-full h-48 flex items-center justify-center rounded-lg overflow-hidden mt-4 relative">
              <Image
                src={preview}
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
              }}
            >
              {t('change')}
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
          <Button onClick={closeModal}>{t('cancel')}</Button>
          <Button
            disabled={!preview || isUploading}
            onClick={confirmUpload}
            variant="contained"
            color="success"
          >
            {t('add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-80 text-center">
            <h2 className="font-semibold text-lg mb-3">{t('deletePartner')}</h2>
            <div className="flex gap-3">
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setDeleteId(null)}
              >
                {t('cancel')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={confirmDelete}
              >
                {t('delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
