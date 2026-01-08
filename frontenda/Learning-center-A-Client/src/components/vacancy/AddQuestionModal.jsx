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
} from "@mui/material";
import { Save, X, Languages } from "lucide-react";
import LanguageIcon from "@mui/icons-material/Language";

const AddQuestionModal = ({
  open,
  onClose,
  formData,
  onFormDataChange,
  activeLang,
  onActiveLangChange,
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
          mx: { xs: 2, sm: 0 },
          width: { xs: "calc(100% - 16px)", sm: "auto" },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 2,
          px: { xs: 2, sm: 3 },
          fontSize: { xs: "1rem", sm: "1.25rem" },
        }}
      >
        <Languages
          sx={{
            color: "#3b82f6",
            fontSize: { xs: 20, sm: 24 },
          }}
        />
        {t("addQuestion")}
      </DialogTitle>

      <DialogContent
        sx={{
          mt: 2,
          px: { xs: 2, sm: 3 },
          pb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
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
                px: { xs: 1.5, sm: 3 },
                py: { xs: 1, sm: 2 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: 32, sm: 36 },
              }}
            />
          ))}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={2}
          label={`${t("question")} (${activeLang.toUpperCase()})`}
          value={formData?.question?.[activeLang] || ""}
          onChange={(e) => onFormDataChange(e, activeLang, "question")}
          margin="normal"
          size="small"
          sx={{
            "& .MuiInputLabel-root": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
            mb: 2,
          }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label={`${t("answer")} (${activeLang.toUpperCase()})`}
          value={formData?.answer?.[activeLang] || ""}
          onChange={(e) => onFormDataChange(e, activeLang, "answer")}
          margin="normal"
          size="small"
          sx={{
            "& .MuiInputLabel-root": {
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
        <div className="w-full flex justify-between gap-2">
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
            {t("add")}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionModal;

