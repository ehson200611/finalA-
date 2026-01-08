"use client";
import React from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const DeleteConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("vacancy");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme === "dark" ? "#1e293b" : "white",
        },
      }}
    >
      <DialogTitle sx={{ color: theme === "dark" ? "white" : "black" }}>
        {title || t("confirmDelete")}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: theme === "dark" ? "#e2e8f0" : "#4a5568" }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <div className="w-[100%] flex justify-between">
          <Button onClick={onClose} variant="outlined">
            {t("cancel")}
          </Button>
          <Button onClick={onConfirm} variant="contained" color="error">
            {t("delete")}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmModal;

