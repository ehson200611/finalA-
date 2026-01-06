"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme as useNextTheme } from "next-themes";

import {
  useGetBooksQuery,
  useCreateBookMutation,
  useDeleteBookMutation,
} from "@/store/slices/booksApi";
import { useTranslations } from "next-intl";
import { Delete, OpenInBrowser } from "@mui/icons-material";
import Loading from "@/components/loading/loading";

const BooksManager = () => {
  const { data: books, isLoading } = useGetBooksQuery();
  const muiTheme = useTheme();
  const { theme: nextTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [deleteBook] = useDeleteBookMutation();
  const t = useTranslations("books");
  
  // Get current theme (considering system preference)
  const currentTheme = nextTheme === 'system' ? systemTheme : nextTheme;
  const isDarkMode = currentTheme === 'dark';
  
  // CREATE modal
  const [modalOpen, setModalOpen] = useState(false);
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [title, setTitle] = useState("");

  // DELETE modal
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setPreview(null);
    setTitle("");
    setPdfFile(null);
  };

  // load image preview
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setPdfFile(file);
  };

  // CREATE request
  const confirmUpload = async () => {
    if (!pdfFile || !title) return;

    const form = new FormData();
    form.append("title", title);
    form.append("pdf", pdfFile);

    await createBook(form);
    closeModal();
  };

  // DELETE request
  const confirmDelete = async () => {
    await deleteBook(deleteId);
    setDeleteId(null);
  };

  if (!mounted) return null;
  if(isLoading) return <Loading />

  return (
    <div className={`p-4 sm:p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className={`font-bold text-xl sm:text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t("bookManagement")}
        </h2>
        <Button 
          variant="contained" 
          onClick={openModal} 
          className="w-full sm:w-auto"
          sx={{
            backgroundColor: isDarkMode ? '#3b82f6' : '#1976d2',
            '&:hover': {
              backgroundColor: isDarkMode ? '#2563eb' : '#1565c0',
            }
          }}
        >
          {t("addBooks")}
        </Button>
      </div>

      {/* Books list - unified responsive design */}
      <div className="space-y-3">
        {books?.map((e) => (
          <div
            key={e.id}
            className={`p-4 border rounded-lg flex justify-between sm:flex-row sm:justify-between sm:items-center ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} gap-4 sm:gap-0`}
          >
            <span className={`font-medium text-base sm:text-lg break-words pr-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              {e.title}
            </span>

            <div className="flex gap-3 self-end sm:self-center">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: isDarkMode ? '#3b82f6' : '#1976d2',
                  '&:hover': {
                    backgroundColor: isDarkMode ? '#2563eb' : '#1565c0',
                  }
                }}
                size="small"
                onClick={() =>
                  window.open(
                    `/api/pdf?url=${encodeURIComponent(e.pdf)}#toolbar=0`,
                    "_blank"
                  )
                }
                className="min-w-[80px]"
              >
                <OpenInBrowser />
              </Button>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setDeleteId(e.id)}
                className="min-w-[80px]"
              >
                <Delete />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <Dialog 
        open={modalOpen} 
        onClose={closeModal} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
            color: isDarkMode ? 'white' : 'inherit',
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center">
          <span className={isDarkMode ? 'text-white' : ''}>{t("addBooks")}</span>
          <IconButton 
            onClick={closeModal} 
            size="small"
            sx={{ color: isDarkMode ? 'white' : 'inherit' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <input
            className={`block w-full mb-4 px-3 py-2 rounded-lg text-base ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'border border-gray-300'
            }`}
            type="text"
            placeholder={t("bookTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={isCreating}
            className={`block w-full mb-4 cursor-pointer py-2 px-3 rounded-lg text-base ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border border-gray-300'
            }`}
          />

          {preview ? (
            <Box
              sx={{
                width: "100%",
                height: 150,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              }}
            >
              <Image
                src="/pdf-preview.png"
                alt="preview"
                width={100}
                height={100}
                className="object-contain"
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 150,
                border: `2px dashed ${isDarkMode ? '#4b5563' : '#ccc'}`,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isDarkMode ? '#9ca3af' : '#999',
                fontSize: "1rem",
                fontWeight: "bold",
                backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'transparent',
              }}
            >
              {t("pdfFile")}
            </Box>
          )}
        </DialogContent>

        <DialogActions className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <Button 
            onClick={closeModal} 
            className="w-full sm:w-auto"
            sx={{
              color: isDarkMode ? 'white' : 'inherit',
              borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
              '&:hover': {
                borderColor: isDarkMode ? '#6b7280' : '#9ca3af',
                backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
            variant="outlined"
          >
            {t("cancel")}
          </Button>
          <Button
            disabled={!preview || !title || isCreating}
            onClick={confirmUpload}
            variant="contained"
            color="success"
            className="w-full sm:w-auto"
          >
            {t("add")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`p-5 rounded-lg w-full max-w-sm sm:max-w-md text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`font-semibold text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t("deleteBook")}
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outlined"
                onClick={() => setDeleteId(null)}
                className="w-full"
                sx={{
                  color: isDarkMode ? 'white' : 'inherit',
                  borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
                  '&:hover': {
                    borderColor: isDarkMode ? '#6b7280' : '#9ca3af',
                    backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                {t("cancel")}
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={confirmDelete}
                className="w-full"
              >
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksManager;