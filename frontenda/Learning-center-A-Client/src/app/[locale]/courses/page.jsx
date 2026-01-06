"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  useGetEnglishCoursesQuery,
  useGetRussianCoursesQuery,
  useGetPreSchoolCoursesQuery,
  useAddCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from "@/store/slices/coursesApi";
import LanguageIcon from "@mui/icons-material/Language";
import {
  Trash2,
  Edit3,
  PlusCircle,
  X,
  TrendingUp,
  Users,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import SectionOne from "@/components/SectionOne";
import {
  Button,
  TextField,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import Errors from "@/components/error/errors";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Loading from "@/components/loading/loading";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Delete Confirmation Modal Component using MUI
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  course,
  category,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("courses");

  const getField = (field) => {
    if (!field) return "";
    return typeof field === "object" ? field.ru || "" : field;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: theme === "dark" ? "grey.800" : "white",
          color: theme === "dark" ? "white" : "black",
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: theme === "dark" ? "grey.400" : "grey.600",
          }}
        >
          <X size={20} />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              bgcolor: theme === "dark" ? "error.dark" : "error.light",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <AlertTriangle sx={{ color: "error.main", fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            {t("pDelete")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("ansDelete")}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 0 }}>
        <Card
          sx={{
            borderRadius: "12px",
            p: 3,
            mb: 3,
            bgcolor: theme === "dark" ? "grey.700" : "grey.50",
          }}
        >
          <Typography variant="subtitle1" fontWeight="semibold" sx={{ mb: 1 }}>
            {getField(course?.title)}
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t("level")}: {getField(course?.level)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("category")}:{" "}
              {category === "english"
                ? "Английский"
                : category === "russian"
                ? "Русский"
                : "Подготовка к школе"}
            </Typography>
          </Stack>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: theme === "dark" ? "grey.600" : "grey.300",
            color: theme === "dark" ? "grey.300" : "grey.700",
            "&:hover": {
              bgcolor: theme === "dark" ? "grey.700" : "grey.100",
              borderColor: theme === "dark" ? "grey.500" : "grey.400",
            },
            fontWeight: "semibold",
          }}
        >
          {t("stop")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<Trash2 size={16} />}
          sx={{
            bgcolor: "error.main",
            color: "white",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "error.dark",
            },
          }}
        >
          {t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Loading Spinner Component
// const LoadingSpinner = () => (
//   <Box
//     sx={{
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       minHeight: "100vh",
//     }}
//   >
//     <CircularProgress sx={{ color: "#34d3d6" }} />
//   </Box>
// );

// Add/Edit Course Modal Component using MUI
const CourseModal = ({
  isOpen,
  onClose,
  editingCourse,
  selectedCategory,
  setSelectedCategory,
  newCourse,
  setNewCourse,
  activeLang,
  setActiveLang,
  handleSaveCourse,
  isSaving,
  theme,
  t,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: theme === "dark" ? "grey.800" : "white",
          color: theme === "dark" ? "white" : "black",
          maxHeight: "90vh",
        },
      }}
    >
      {isSaving && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "16px",
            zIndex: 1,
          }}
        >
          <CircularProgress sx={{ color: "#34d3d6" }} />
        </Box>
      )}

      <DialogTitle sx={{ p: 3, pb: 2, position: "relative" }}>
        <IconButton
          onClick={onClose}
          disabled={isSaving}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: theme === "dark" ? "grey.400" : "grey.600",
          }}
        >
          <X size={24} />
        </IconButton>
        <Typography
          component="span"
          variant="h6"
          fontWeight="bold"
          textAlign="center"
        >
          {editingCourse ? t("editCourse") : t("addCourse")}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {!editingCourse && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t("category")}</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label={t("category")}
              disabled={isSaving}
              sx={{
                bgcolor: theme === "dark" ? "grey.700" : "white",
              }}
            >
              <MenuItem value="english">{t("english")}</MenuItem>
              <MenuItem value="russian">{t("russian")}</MenuItem>
              <MenuItem value="preschools">{t("preSchool")}</MenuItem>
            </Select>
          </FormControl>
        )}

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          {["ru", "en", "tj"].map((lang) => (
            <Button
              key={lang}
              onClick={() => setActiveLang(lang)}
              disabled={isSaving}
              variant={activeLang === lang ? "contained" : "outlined"}
              startIcon={<LanguageIcon />}
              sx={{
                minWidth: "100px",
                bgcolor: activeLang === lang ? "#34d3d6" : "transparent",
                color:
                  activeLang === lang
                    ? "white"
                    : theme === "dark"
                    ? "white"
                    : "grey.800",
                borderColor: theme === "dark" ? "grey.600" : "grey.300",
                "&:hover": {
                  bgcolor:
                    activeLang === lang
                      ? "#2ab3b6"
                      : theme === "dark"
                      ? "grey.700"
                      : "grey.100",
                },
              }}
            >
              {lang.toUpperCase()}
            </Button>
          ))}
        </Stack>

        <Grid
          sx={{
            "& > *": { margin: 2 }, // Фосилаи байни ҳама фарзандҳо
          }}
        >
          {[
            { key: "title", label: t("title"), required: true },
            { key: "duration", label: t("duration") },
            { key: "academicSupport", label: t("academicSupport") },
            { key: "clubs", label: t("clubs") },
            { key: "level", label: t("level") },
            { key: "type", label: t("type") },
          ].map(({ key, label, required }) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                label={`${label} (${activeLang.toUpperCase()})${
                  required ? " *" : ""
                }`}
                value={newCourse[key]?.[activeLang] || ""}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    [key]: {
                      ...newCourse[key],
                      [activeLang]: e.target.value,
                    },
                  })
                }
                fullWidth
                size="small"
                required={required}
                disabled={isSaving}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: theme === "dark" ? "white" : "black",
                    bgcolor: theme === "dark" ? "grey.700" : "white",
                    "& fieldset": {
                      borderColor: theme === "dark" ? "grey.600" : "grey.300",
                    },
                    "&:hover fieldset": {
                      borderColor: theme === "dark" ? "grey.500" : "grey.400",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#34d3d6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: theme === "dark" ? "grey.400" : "grey.600",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#34d3d6",
                  },
                }}
              />
            </Grid>
          ))}

          {selectedCategory === "preschools" && (
            <Grid item xs={12}>
              <TextField
                label={`${t("predmet")} (${activeLang.toUpperCase()})`}
                placeholder={t("enterSubjects")}
                value={newCourse.subject?.[activeLang] || ""}
                onChange={(e) =>
                  setNewCourse({
                    ...newCourse,
                    subject: {
                      ...newCourse.subject,
                      [activeLang]: e.target.value,
                    },
                  })
                }
                fullWidth
                multiline
                rows={3}
                disabled={isSaving}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: theme === "dark" ? "white" : "black",
                    bgcolor: theme === "dark" ? "grey.700" : "white",
                    "& fieldset": {
                      borderColor: theme === "dark" ? "grey.600" : "grey.300",
                    },
                    "&:hover fieldset": {
                      borderColor: theme === "dark" ? "grey.500" : "grey.400",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#34d3d6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: theme === "dark" ? "grey.400" : "grey.600",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#34d3d6",
                  },
                }}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              type="text"
              label={t("price")}
              value={newCourse.price || ""}
              onChange={(e) =>
                setNewCourse({ ...newCourse, price: e.target.value })
              }
              fullWidth
              size="small"
              required
              disabled={isSaving}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: theme === "dark" ? "white" : "black",
                  bgcolor: theme === "dark" ? "grey.700" : "white",
                  "& fieldset": {
                    borderColor: theme === "dark" ? "grey.600" : "grey.300",
                  },
                  "&:hover fieldset": {
                    borderColor: theme === "dark" ? "grey.500" : "grey.400",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#34d3d6",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: theme === "dark" ? "grey.400" : "grey.600",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#34d3d6",
                },
                
              }}
              
            />
          </Grid>

          
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
        <Button
          onClick={onClose}
          disabled={isSaving}
          variant="outlined"
          sx={{
            borderColor: theme === "dark" ? "grey.600" : "grey.300",
            color: theme === "dark" ? "grey.300" : "grey.700",
            "&:hover": {
              bgcolor: theme === "dark" ? "grey.700" : "grey.100",
              borderColor: theme === "dark" ? "grey.500" : "grey.400",
            },
          }}
        >
          {t("stop")}
        </Button>
        <Button
          onClick={handleSaveCourse}
          disabled={isSaving}
          variant="contained"
          sx={{
            background: "linear-gradient(to right, #34d3d6, #216f6f, #34d3d6)",
            color: "white",
            fontWeight: "bold",
            "&:hover": {
              opacity: 0.9,
            },
            "&:disabled": {
              opacity: 0.6,
            },
          }}
        >
          {editingCourse ? t("down") : t("add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Page = () => {
  const t = useTranslations("courses");
  const locale = useLocale()?.slice(0, 2) || "ru";
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    course: null,
    category: null,
  });

  // UI states
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("ru");
  const [selectedCategory, setSelectedCategory] = useState("english");
  const [displayCategory, setDisplayCategory] = useState("all");
  const [editingCourse, setEditingCourse] = useState(null);

  // Course form state
  const [newCourse, setNewCourse] = useState({
    title: { ru: "", en: "", tj: "" },
    description: { ru: "string", en: "string", tj: "string" },
    duration: { ru: "", en: "", tj: "" },
    academicSupport: { ru: "", en: "", tj: "" },
    clubs: { ru: "", en: "", tj: "" },
    level: { ru: "", en: "", tj: "" },
    type: { ru: "", en: "", tj: "" },
    subject: { ru: "", en: "", tj: "" },
    price: "",
    external_id: "",
  });

  // RTK Query hooks
  const {
    data: englishCourses = [],
    isLoading: englishLoading,
    error: englishError,
    refetch: refetchEnglish,
  } = useGetEnglishCoursesQuery();

  const {
    data: russianCourses = [],
    isLoading: russianLoading,
    error: russianError,
    refetch: refetchRussian,
  } = useGetRussianCoursesQuery();

  const {
    data: preSchoolCourses = [],
    isLoading: preSchoolLoading,
    error: preSchoolError,
    refetch: refetchPreSchool,
  } = useGetPreSchoolCoursesQuery();

  // Mutation hooks
  const [addCourse, { isLoading: isAdding }] = useAddCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const hasError = englishError || russianError || preSchoolError;
  const error = englishError || russianError || preSchoolError;

  // Toast notification functions
  const showSuccessToast = (message) => {
    toast.success(message, {});
  };

  const showErrorToast = (message) => {
    toast.error(message, {});
  };

  // Helper function to convert backend data to frontend format for display
  const convertToFrontendFormat = (backendCourse) => {
    return {
      id: backendCourse.id,
      title: {
        ru: backendCourse.title_ru || "",
        en: backendCourse.title_en || "",
        tj: backendCourse.title_tj || "",
      },
      description: {
        ru: backendCourse.description_ru || "",
        en: backendCourse.description_en || "",
        tj: backendCourse.description_tj || "",
      },
      duration: {
        ru: backendCourse.duration_ru || "",
        en: backendCourse.duration_en || "",
        tj: backendCourse.duration_tj || "",
      },
      academicSupport: {
        ru: backendCourse.academic_support_ru || "",
        en: backendCourse.academic_support_en || "",
        tj: backendCourse.academic_support_tj || "",
      },
      clubs: {
        ru: backendCourse.clubs_ru || "",
        en: backendCourse.clubs_en || "",
        tj: backendCourse.clubs_tj || "",
      },
      level: {
        ru: backendCourse.level_ru || "",
        en: backendCourse.level_en || "",
        tj: backendCourse.level_tj || "",
      },
      type: {
        ru: backendCourse.type_ru || "",
        en: backendCourse.type_en || "",
        tj: backendCourse.type_tj || "",
      },
      subject: {
        ru: backendCourse.subject_ru || "",
        en: backendCourse.subject_en || "",
        tj: backendCourse.subject_tj || "",
      },
      price: backendCourse.price || "",
      external_id: backendCourse.external_id || "",
    };
  };

  // Helper function to convert frontend format to backend format
  const convertToBackendFormat = (frontendCourse, category) => {
    const backendData = {
      title_ru: frontendCourse.title?.ru || "",
      title_en: frontendCourse.title?.en || "",
      title_tj: frontendCourse.title?.tj || "",
      description_ru: frontendCourse.description?.ru || "",
      description_en: frontendCourse.description?.en || "",
      description_tj: frontendCourse.description?.tj || "",
      duration_ru: frontendCourse.duration?.ru || "",
      duration_en: frontendCourse.duration?.en || "",
      duration_tj: frontendCourse.duration?.tj || "",
      academic_support_ru: frontendCourse.academicSupport?.ru || "",
      academic_support_en: frontendCourse.academicSupport?.en || "",
      academic_support_tj: frontendCourse.academicSupport?.tj || "",
      clubs_ru: frontendCourse.clubs?.ru || "",
      clubs_en: frontendCourse.clubs?.en || "",
      clubs_tj: frontendCourse.clubs?.tj || "",
      level_ru: frontendCourse.level?.ru || "",
      level_en: frontendCourse.level?.en || "",
      level_tj: frontendCourse.level?.tj || "",
      type_ru: frontendCourse.type?.ru || "",
      type_en: frontendCourse.type?.en || "",
      type_tj: frontendCourse.type?.tj || "",
      price: frontendCourse.price || "",
      external_id: frontendCourse.external_id || "",
    };

    // Add subject fields only for preschool category
    if (category === "preschools") {
      backendData.subject_ru = frontendCourse.subject?.ru || "";
      backendData.subject_en = frontendCourse.subject?.en || "";
      backendData.subject_tj = frontendCourse.subject?.tj || "";
    }

    return backendData;
  };

  const openModal = (course = null, category = "english") => {
    if (course) {
      setEditingCourse({ ...course, category });
      setSelectedCategory(category);
      setNewCourse(course);
    } else {
      setEditingCourse(null);
      setNewCourse({
        title: { ru: "", en: "", tj: "" },
        description: { ru: "string", en: "string", tj: "string" },
        duration: { ru: "", en: "", tj: "" },
        academicSupport: { ru: "", en: "", tj: "" },
        clubs: { ru: "", en: "", tj: "" },
        level: { ru: "", en: "", tj: "" },
        type: { ru: "", en: "", tj: "" },
        subject: { ru: "", en: "", tj: "" },
        price: "",
        external_id: Date.now().toString()
      });
      setSelectedCategory(category);
    }
    setActiveLang("ru");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setNewCourse({
      title: { ru: "", en: "", tj: "" },
      description: { ru: "string", en: "string", tj: "string" },
      duration: { ru: "", en: "", tj: "" },
      academicSupport: { ru: "", en: "", tj: "" },
      clubs: { ru: "", en: "", tj: "" },
      level: { ru: "", en: "", tj: "" },
      type: { ru: "", en: "", tj: "" },
      subject: { ru: "", en: "", tj: "" },
      price: "",
      external_id: "",
    });
  };

  // Open delete confirmation modal
  const openDeleteModal = (course, category) => {
    setDeleteModal({
      isOpen: true,
      course,
      category,
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      course: null,
      category: null,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const { course, category } = deleteModal;

    try {
      await deleteCourse({
        category,
        courseId: course.id,
      }).unwrap();

      showSuccessToast(`${t("delSuc")}`);
      closeDeleteModal();

      // Refetch the relevant category
      switch (category) {
        case "english":
          await refetchEnglish();
          break;
        case "russian":
          await refetchRussian();
          break;
        case "preschools":
          await refetchPreSchool();
          break;
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
      showErrorToast(
        `${t("errDel")}: ${
          err.data?.message || err.error || `${t("notFoundErr")}`
        }`
      );
      closeDeleteModal();
    }
  };

  const handleSaveCourse = async () => {
    try {
      // Validate required fields
      setNewCourse({
        ...newCourse,
        description: { ru: "string", en: "string", tj: "string" },
      });
      if (
        !newCourse.title?.ru?.trim() ||
        !newCourse.description?.ru?.trim() ||
        !newCourse.price
      ) {
        showErrorToast(`${t("pleases")}`);
        return;
      }

      // Convert frontend format to backend format
      const backendData = convertToBackendFormat(newCourse, selectedCategory);

      if (editingCourse) {
        // Update existing course
        await updateCourse({
          category: editingCourse.category,
          courseId: editingCourse.id,
          updatedCourseData: backendData,
        }).unwrap();

        showSuccessToast(`${t("courseUpd")}`);
      } else {
        // Add new course
        await addCourse({
          category: selectedCategory,
          courseData: backendData,
        }).unwrap();
        showSuccessToast(`${t("courseAdd")}`);
      }

      closeModal();

      // Refetch the relevant category
      const categoryToRefetch = editingCourse
        ? editingCourse.category
        : selectedCategory;
      switch (categoryToRefetch) {
        case "english":
          await refetchEnglish();
          break;
        case "russian":
          await refetchRussian();
          break;
        case "preschools":
          await refetchPreSchool();
          break;
      }
    } catch (err) {
      console.error("Error saving course:", err);
      showErrorToast(
        `${t("errDown")}: ${
          err.data?.message || err.error || `${t("notFoundErr")}`
        }`
      );
    }
  };

  const getField = (field) => {
    if (!field) return "";
    return typeof field === "object" ? field[locale] || field.ru || "" : field;
  };

  // Course Card Component
  const CourseCard = ({ course, category }) => {
    const [isSubjectOpen, setIsSubjectOpen] = useState(false);

    return (
      <div
        className={`relative flex flex-col justify-between rounded-2xl w-full sm:w-[340px] p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200 text-black"
        }`}
      >
        <div>
          <div className="absolute -top-0 left-0 right-0 h-2.5 bg-linear-to-r from-[#34d3d6] via-[#216f6f] to-[#34d3d6] rounded-t-3xl"></div>

          {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => openModal(course, category)}
                className=" bg-gray-500 w-8 h-8 rounded-full hover:bg-gray-600 text-white transition flex items-center justify-center"
              >
                <EditIcon fontSize="small" />
              </button>
              <button
                onClick={() => openDeleteModal(course, category)}
                className=" bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition flex items-center justify-center"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          )}

          <div className="mt-2 mb-4">
            <h3
              className={`text-lg font-bold truncate ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {getField(course.title)}
            </h3>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                category === "english"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : category === "russian"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              }`}
            >
              {getField(course.level)}
            </span>
          </div>

          <ul className="text-sm space-y-3 mb-6">
            <li className="flex items-center gap-2">
              <span className="font-medium">{t("countinui")}:</span>
              <span>{getField(course.duration)}</span>
            </li>
            <li className="flex gap-2 items-center">
              <Clock className="text-[#22b0b3]" size={18} />
              {getField(course.academicSupport)}
            </li>
            <li className="flex gap-2 items-center">
              <TrendingUp className="text-[#21b2b5]" size={18} />
              {getField(course.clubs)}
            </li>
            <li className="flex gap-2 items-center">
              <Users className="text-[#24bfc2]" size={18} />
              <span>
                {t("typeOfLearn")}: {getField(course.type)}
              </span>
            </li>

            {course.subject && getField(course.subject) && (
              <li className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex justify-between items-center p-3 text-left ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  } transition-colors duration-200`}
                  onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                >
                  <span className="font-medium">{t("predmet")}</span>
                  <ChevronDown
                    className={`text-gray-500 transition-transform duration-300 ${
                      isSubjectOpen ? "rotate-180" : ""
                    }`}
                    size={18}
                  />
                </button>

                <div
                  className={`
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${
                      isSubjectOpen
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                >
                  <div
                    className={`p-3 border-t ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2">
                      {getField(course.subject)
                        ?.split(",")
                        .map((subject, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm transition-all duration-200 hover:scale-105"
                          >
                            {subject.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>

        <div>
          <div className="text-2xl font-bold bg-linear-to-r from-[#34d3d6] via-[#216f6f] to-[#34d3d6] bg-clip-text text-transparent mb-1">
            {t("from")} {getField(course.price)} TJS
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t("aMonth")}
          </p>
          <Button
            fullWidth
            variant="contained"
            sx={{
              background:
                "linear-gradient(to right, #34d3d6, #216f6f, #34d3d6)",
              color: "white",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "12px",
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            {t("joinCourse")}
          </Button>
        </div>
      </div>
    );
  };

  // Convert backend data to frontend format for display
  const englishCoursesFrontend = Array.isArray(englishCourses)
    ? englishCourses.map(convertToFrontendFormat)
    : [];

  const russianCoursesFrontend = Array.isArray(russianCourses)
    ? russianCourses.map(convertToFrontendFormat)
    : [];

  const preSchoolCoursesFrontend = Array.isArray(preSchoolCourses)
    ? preSchoolCourses.map(convertToFrontendFormat)
    : [];

  // Render courses by category
  const renderCourses = (courses, category, title, color) => {
    if (displayCategory !== "all" && displayCategory !== category) return null;
    if (!courses || courses.length === 0) return null;

    return (
      <div className="w-full mb-12">
        <h2
          className={`text-3xl md:text-[40px] font-bold mb-6 text-center ${color}`}
        >
          {title}
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} category={category} />
          ))}
        </div>
      </div>
    );
  };

  const isLoading = englishLoading || russianLoading || preSchoolLoading;
  const isSaving = isAdding || isUpdating || isDeleting;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (hasError) {
    return (
      <Errors
        error={error}
        onRetry={() => {
          // Refetch all queries
          refetchEnglish();
          refetchRussian();
          refetchPreSchool();
        }}
        fullScreen={true}
      />
    );
  }
  if (isLoading) return <Loading />;

  return (
    <section
      className={`min-h-screen font-sans ${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      }`}
    >
      {/* Toast Container */}
      <Toaster />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        course={deleteModal.course}
        category={deleteModal.category}
      />

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingCourse={editingCourse}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        newCourse={newCourse}
        setNewCourse={setNewCourse}
        activeLang={activeLang}
        setActiveLang={setActiveLang}
        handleSaveCourse={handleSaveCourse}
        isSaving={isSaving}
        theme={theme}
        t={t}
        value={Date.now(newCourse.external_id) || ""}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <SectionOne title={t("course")} description={t("descCourse")} />

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex justify-end mt-4 mb-8">
            <Button
              onClick={() => openModal(null, "preschools")}
              startIcon={<PlusCircle />}
              variant="contained"
              sx={{
                backgroundColor: "#34d3d6",
                color: "white",
                fontWeight: "bold",
                padding: "10px 20px",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#2ab3b6",
                },
              }}
            >
              {t("addCourse")}
            </Button>
          </div>
        )}

        {/* Display courses count by category */}
        <div className="grid grid-cols-3 md:gap-6 gap-2 mb-8">
          <div
            className={`rounded-xl p-6 text-center shadow-lg ${
              theme === "dark"
                ? "bg-gray-800"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="text-3xl font-bold text-blue-500">
              {englishCoursesFrontend.length}
            </div>
            <div className="text-lg font-semibold mt-2">{t("enCourse")}</div>
          </div>
          <div
            className={`rounded-xl p-6 text-center shadow-lg ${
              theme === "dark"
                ? "bg-gray-800"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="text-3xl font-bold text-green-500">
              {russianCoursesFrontend.length}
            </div>
            <div className="text-lg font-semibold mt-2">{t("ruCourse")}</div>
          </div>
          <div
            className={`rounded-xl p-6 text-center shadow-lg ${
              theme === "dark"
                ? "bg-gray-800"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className="text-3xl font-bold text-purple-500">
              {preSchoolCoursesFrontend.length}
            </div>
            <div className="text-lg font-semibold mt-2">{t("preSchool")}</div>
          </div>
        </div>

        {/* Courses Display */}
        <div className="flex flex-col items-center">
          {renderCourses(
            englishCoursesFrontend,
            "english",
            t("enCourse"),
            "text-blue-500"
          )}
          {renderCourses(
            russianCoursesFrontend,
            "russian",
            t("ruCourse"),
            "text-green-500"
          )}
          {renderCourses(
            preSchoolCoursesFrontend,
            "preschools",
            t("preSchool"),
            "text-purple-500"
          )}

          {/* No Courses Message */}
          {!englishCoursesFrontend.length &&
            !russianCoursesFrontend.length &&
            !preSchoolCoursesFrontend.length && (
              <div className="text-center py-16 w-full">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-2">
                  {t("courseNotFound")}
                </h3>
                <p
                  className={
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  {t("joinFirstCourse")}
                </p>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default Page;
