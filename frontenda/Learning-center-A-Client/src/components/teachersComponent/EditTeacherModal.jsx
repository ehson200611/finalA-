"use client";
import React, { useEffect, useState } from "react";
import LanguageIcon from "@mui/icons-material/Language";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const languages = [
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "tj", label: "Тоҷикӣ", flag: "🇹🇯" },
];

export default function EditTeacherModal({
  teacher,
  onClose,
  onSave,
  loading = false,
}) {
  const [currentLang, setCurrentLang] = useState("ru");
  const [errors, setErrors] = useState({});
  const t = useTranslations("teachers");

  const [form, setForm] = useState({
    names: { ru: "", en: "", tj: "" },
    descriptions: { ru: "", en: "", tj: "" },
    experience: "",
    imageFile: null,
    videoFile: null,
  });

  useEffect(() => {
    if (teacher) {
      // Parse teacher data - the API returns individual fields
      const names = { ru: "", en: "", tj: "" };
      const descriptions = { ru: "", en: "", tj: "" };

      // Extract names from teacher object
      Object.keys(teacher).forEach((key) => {
        if (key.startsWith("name_")) {
          const lang = key.replace("name_", "");
          if (languages.some((l) => l.code === lang)) {
            names[lang] = teacher[key] || "";
          }
        }
        if (key.startsWith("description_")) {
          const lang = key.replace("description_", "");
          if (languages.some((l) => l.code === lang)) {
            descriptions[lang] = teacher[key] || "";
          }
        }
      });

      // Fallback for old data format
      if (Object.values(names).every((val) => !val) && teacher.name) {
        if (typeof teacher.name === "object") {
          Object.assign(names, teacher.name);
        } else {
          names.en = teacher.name;
        }
      }

      if (
        Object.values(descriptions).every((val) => !val) &&
        teacher.description
      ) {
        if (typeof teacher.description === "object") {
          Object.assign(descriptions, teacher.description);
        } else {
          descriptions.en = teacher.description;
        }
      }

      setForm({
        names,
        descriptions,
        experience: teacher.experience || "",
        imageFile: null,
        videoFile: null,
      });
    }
  }, [teacher]);

  const setFieldForLang = (field, value, lang = currentLang) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const setCommonField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, event) => {
    const file = event.target.files?.[0] || null;
    setCommonField(field, file);
  };

  const submit = async () => {
    // Basic validation
    const newErrors = {};
    languages.forEach((lang) => {
      if (!form.names[lang.code]?.trim())
        newErrors[`name_${lang.code}`] = `${lang.label} ${t("requareName")}`;
      if (!form.descriptions[lang.code]?.trim())
        newErrors[`description_${lang.code}`] = `${lang.label} ${t(
          "requareDescription"
        )}`;
    });
    if (!form.experience || form.experience < 0)
      newErrors.experience = t("valid");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();

      // Add individual language fields as required by the API
      languages.forEach((lang) => {
        formData.append(`name_${lang.code}`, form.names[lang.code]);
        formData.append(
          `description_${lang.code}`,
          form.descriptions[lang.code]
        );
      });

      // Add experience
      formData.append("experience", form.experience.toString());

      // Append image file if changed
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      // Append video file if changed
      if (form.videoFile) {
        formData.append("video", form.videoFile);
      }

      await onSave(formData);
    } catch (err) {
      console.error("Error updating teacher:", err);
      toast.error(`Error: ${JSON.stringify(err.data || err, null, 2)}`);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          pb: 2,
        }}
      >
        {t("editTeacher")}
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Tabs
            value={currentLang}
            onChange={(e, newValue) => setCurrentLang(newValue)}
            centered
            sx={{
              padding: "4px",
              "& .MuiTab-root": {
                borderRadius: "8px",
                margin: "2px",
                minHeight: "48px",
                "&.Mui-selected": {
                  backgroundColor: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                },
              },
            }}
          >
            {languages.map((lang) => (
              <Tab
                key={lang.code}
                value={lang.code}
                icon={<LanguageIcon sx={{ fontSize: "1.2rem" }} />}
                label={lang.label}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label={`Name `}
              value={form.names[currentLang] || ""}
              onChange={(e) => setFieldForLang("names", e.target.value)}
              error={!!errors[`name_${currentLang}`]}
              helperText={errors[`name_${currentLang}`]}
              fullWidth
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              label={`Description `}
              value={form.descriptions[currentLang] || ""}
              onChange={(e) => setFieldForLang("descriptions", e.target.value)}
              error={!!errors[`description_${currentLang}`]}
              helperText={errors[`description_${currentLang}`]}
              multiline
              rows={4}
              fullWidth
            />
          </Box>

          <TextField
            label={t("experience")}
            type="number"
            value={form.experience}
            onChange={(e) => setCommonField("experience", e.target.value)}
            error={!!errors.experience}
            helperText={errors.experience}
            fullWidth
            inputProps={{ min: 0, max: 50 }}
          />

          <Box>
            <Typography variant="h6" gutterBottom>
              {t("emptyImage")}
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ height: 80 }}
            >
              <UploadBox>
                {form.imageFile ? (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {t("New")}: {form.imageFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("size")}:{" "}
                      {(form.imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">{t("uploadNewImage")}</Typography>
                )}
              </UploadBox>
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("imageFile", e)}
              />
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              {t("introduction")}
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ height: 80 }}
            >
              <UploadBox>
                {form.videoFile ? (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {t("New")}: {form.videoFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("size")}:{" "}
                      {(form.videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">{t("uploadNewVideo")}</Typography>
                )}
              </UploadBox>
              <VisuallyHiddenInput
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange("videoFile", e)}
              />
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>

        <Box sx={{ flex: 1 }} />

        <Button
          onClick={submit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {loading ? t("saving") : t("SaveChanges")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
