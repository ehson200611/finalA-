"use client";
import React, { useState } from "react";
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
  Stepper,
  Step,
  StepLabel,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Add as AddIcon,
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
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const steps = ["Basic Information", "Media Files"];

const languages = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "tj", label: "Тоҷикӣ" },
];

export default function AddTeacherModal({ onClose, onSave, loading = false }) {
  const [activeStep, setActiveStep] = useState(0);
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

  const setFieldForLang = (field, value, lang = currentLang) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));

    const errorKey = `${field}_${lang}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const setCommonField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        languages.forEach((lang) => {
          if (!form.names[lang.code]?.trim())
            newErrors[`name_${lang.code}`] = `${lang.label} ${t(
              "requareName"
            )}`;
          if (!form.descriptions[lang.code]?.trim())
            newErrors[`description_${lang.code}`] = `${lang.label} ${t(
              "requareDescription"
            )} `;
        });
        if (!form.experience || form.experience < 0)
          newErrors.experience = `${t("valid")}`;
        break;
      case 1:
        if (!form.imageFile) newErrors.imageFile = `${t("progileImage")}`;

        if (form.videoFile) {
          if (form.videoFile.size > 100 * 1024 * 1024) {
            newErrors.videoFile = `${t("videoFile")}`;
          }

          const allowedVideoTypes = [
            "video/mp4",
            "video/avi",
            "video/mov",
            "video/wmv",
            "video/quicktime",
          ];
          if (!allowedVideoTypes.includes(form.videoFile.type)) {
            newErrors.videoFile = `${t("pleaseUpload")}`;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFileChange = (field, event) => {
    const file = event.target.files?.[0] || null;
    setCommonField(field, file);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const submit = async () => {
    if (!validateStep(activeStep)) {
      toast.error(`${t("fix")}`);
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

      // Append files
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      if (form.videoFile) {
        formData.append("video", form.videoFile);
      }

      await onSave(formData);
      toast.success(`${t("addTeacher")}`);
    } catch (err) {
      console.error("Error in submit:", err);
      toast.error(`${t("failed")}`);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Tabs
              value={currentLang}
              onChange={(e, newValue) => setCurrentLang(newValue)}
              centered
              sx={{
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                padding: "4px",
                backgroundColor: "#f5f5f5",
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
                label={`${t("name")} `}
                value={form.names[currentLang] || ""}
                onChange={(e) => setFieldForLang("names", e.target.value)}
                error={!!errors[`name_${currentLang}`]}
                helperText={errors[`name_${currentLang}`]}
                fullWidth
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label={`${t("description")} `}
                value={form.descriptions[currentLang] || ""}
                onChange={(e) =>
                  setFieldForLang("descriptions", e.target.value)
                }
                error={!!errors[`description_${currentLang}`]}
                helperText={errors[`description_${currentLang}`]}
                multiline
                rows={4}
                fullWidth
              />
            </Box>

            <TextField
              label={`${t("experience")} `}
              type="number"
              value={form.experience}
              onChange={(e) => setCommonField("experience", e.target.value)}
              error={!!errors.experience}
              helperText={errors.experience}
              fullWidth
              inputProps={{ min: 0, max: 50 }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("imageProfile")}
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ height: 100 }}
              >
                <UploadBox>
                  {form.imageFile ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        {t("select")}: {form.imageFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("size")}:{" "}
                        {(form.imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2">{t("clickImage")}</Typography>
                  )}
                </UploadBox>
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("imageFile", e)}
                />
              </Button>
              {errors.imageFile && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.imageFile}
                </Alert>
              )}
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
                sx={{ height: 100 }}
              >
                <UploadBox>
                  {form.videoFile ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        {t("select")}: {form.videoFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("size")}:{" "}
                        {(form.videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2">{t("clickVideo")}</Typography>
                  )}
                </UploadBox>
                <VisuallyHiddenInput
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange("videoFile", e)}
                />
              </Button>
              {errors.videoFile && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.videoFile}
                </Alert>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {t("formats")}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
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
          Add New Teacher
          <IconButton onClick={onClose} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={onClose} disabled={loading}>
            {t("Cancel")}
          </Button>

          <Box sx={{ flex: 1 }} />

          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              {t("Back")}
            </Button>
          )}

          {activeStep < steps.length - 1 ? (
            <Button onClick={handleNext} variant="contained" disabled={loading}>
              {t("Next")}
            </Button>
          ) : (
            <Button
              onClick={submit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
            >
              {loading ? t("saving") : t("AddTeacher")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
