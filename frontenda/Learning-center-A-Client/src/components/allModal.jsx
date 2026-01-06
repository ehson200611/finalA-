"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public";

const AllModals = ({ open, setOpen }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeLang, setActiveLang] = useState("en");

  const [formData, setFormData] = useState({
    name: { en: "", ru: "", tj: "" },
    title: { en: "", ru: "", tj: "" },
    description: { en: "", ru: "", tj: "" },
    image: null,
  });

  useEffect(() => setMounted(true), []);

  const handleChange = (e, lang, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: e.target.value },
    }));
  };

  const handleAdd = () => {
    setOpen(false);
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ display: "flex", gap: 1, alignItems: "center", fontWeight: 600 }}
      >
        <LanguageIcon color="primary" /> Add Vacancy
      </DialogTitle>

      <DialogContent dividers>
        {/* Language Switch */}
        <Box display="flex" justifyContent="center" mb={3}>
          <ToggleButtonGroup
            value={activeLang}
            exclusive
            onChange={(e, v) => v && setActiveLang(v)}
          >
            {["en", "ru", "tj"].map((lang) => (
              <ToggleButton key={lang} value={lang}>
                <PublicIcon sx={{ fontSize: 18, mr: 1 }} /> {lang.toUpperCase()}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Name */}
        <TextField
          label={`Name (${activeLang.toUpperCase()})`}
          fullWidth
          margin="normal"
          value={formData.name[activeLang]}
          onChange={(e) => handleChange(e, activeLang, "name")}
        />

        {/* Title */}
        <TextField
          label={`Title (${activeLang.toUpperCase()})`}
          fullWidth
          margin="normal"
          value={formData.title[activeLang]}
          onChange={(e) => handleChange(e, activeLang, "title")}
        />

        {/* Description */}
        <TextField
          label={`Description (${activeLang.toUpperCase()})`}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          value={formData.description[activeLang]}
          onChange={(e) => handleChange(e, activeLang, "description")}
        />

        {/* File Upload */}
        <Box mt={2}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Upload Image
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  setFormData((prev) => ({ ...prev, image: reader.result }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </Box>

        {/* Preview */}
        {formData.image && (
          <Box mt={3} textAlign="center">
            <Typography variant="body2" sx={{ mb: 1 }}>
              Preview:
            </Typography>
            <Avatar
              src={formData.image}
              variant="rounded"
              sx={{ width: "100%", height: 160, borderRadius: 2 }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleAdd}
        >
          Add
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          color="error"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AllModals;
