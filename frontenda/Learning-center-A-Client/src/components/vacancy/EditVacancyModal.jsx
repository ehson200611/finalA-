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
  TextField,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import { Save, X, Languages } from "lucide-react";
import LanguageIcon from "@mui/icons-material/Language";

const EditVacancyModal = ({
  open,
  onClose,
  formData,
  onFormDataChange,
  activeLang,
  onActiveLangChange,
  selectedImage,
  formDataImage,
  onFileUpload,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("vacancy");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme === "dark" ? "#1e293b" : "white",
          color: theme === "dark" ? "white" : "black",
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Languages sx={{ color: "#3b82f6" }} />
        {t("editVacancy")}
      </DialogTitle>

      <DialogContent sx={{ mt: 2, px: { xs: 1, sm: 3 }, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 3,
          }}
        >
          {["en", "ru", "tj"].map((lang) => (
            <Chip
              key={lang}
              icon={<LanguageIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              label={lang.toUpperCase()}
              onClick={() => onActiveLangChange(lang)}
              variant={activeLang === lang ? "filled" : "outlined"}
              color={activeLang === lang ? "primary" : "default"}
              sx={{
                borderRadius: "8px",
                px: { xs: 2, sm: 10 },
                py: { xs: 1.5, sm: 4 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: 32, sm: 40 },
              }}
            />
          ))}
        </Box>

        <TextField
          fullWidth
          label={`${t("name")} (${activeLang.toUpperCase()})`}
          value={formData.name[activeLang]}
          onChange={(e) => onFormDataChange(e, activeLang, "name")}
          margin="normal"
          size="small"
          sx={{
            "& .MuiInputLabel-root": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        />

        <TextField
          fullWidth
          label={`${t("titleText")} (${activeLang.toUpperCase()})`}
          value={formData.title[activeLang]}
          onChange={(e) => onFormDataChange(e, activeLang, "title")}
          margin="normal"
          size="small"
          sx={{
            "& .MuiInputLabel-root": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label={`${t("description")} (${activeLang.toUpperCase()})`}
          value={formData.description[activeLang]}
          onChange={(e) => onFormDataChange(e, activeLang, "description")}
          margin="normal"
          size="small"
          sx={{
            "& .MuiInputLabel-root": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        />

        <Box sx={{ mt: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "14px",
            }}
          />
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              display: "block",
              color: theme === "dark" ? "#94a3b8" : "#64748b",
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
            }}
          >
            {t("maxFive")}
          </Typography>
        </Box>

        {(selectedImage || formDataImage) && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: theme === "dark" ? "#cbd5e1" : "#475569",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              {t("imagePreview")}
            </Typography>
            <img
              src={selectedImage || formDataImage}
              alt="Preview"
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: { xs: 1.5, sm: 3 }, gap: 1 }}>
        <div className="w-full flex justify-between flex-col sm:flex-row gap-2">
          <Button
            startIcon={<X sx={{ fontSize: { xs: 16, sm: 20 } }} />}
            onClick={onClose}
            variant="outlined"
            size="small"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              py: { xs: 0.5, sm: 1 },
              minWidth: { xs: 100, sm: 120 },
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            startIcon={<Save sx={{ fontSize: { xs: 16, sm: 20 } }} />}
            onClick={onSubmit}
            variant="contained"
            color="primary"
            size="small"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              py: { xs: 0.5, sm: 1 },
              minWidth: { xs: 100, sm: 120 },
            }}
          >
            {t("save")}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default EditVacancyModal;

