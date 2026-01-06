"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { X, ChevronDown, Plus, Edit2, Trash2, Globe } from "lucide-react";
import {
  useGetFaqsQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} from "@/store/slices/faqApi";
import SectionOne from "@/components/SectionOne";

// Material-UI imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import { useUser } from "@/hooks/useUser";
import Errors from "@/components/error/errors";
import Loading from "@/components/loading/loading";
import { Delete, Edit } from "@mui/icons-material";
import toast, { Toaster } from "react-hot-toast";

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  faq,
  currentLanguage,
}) {
  const { theme } = useTheme();

  const getConfirmText = (lang) => {
    const texts = {
      tj: "Оё шумо мутмаин ҳастед, ки мехоҳед ин саволро нест кунед?",
      ru: "Вы уверены, что хотите удалить этот вопрос?",
      en: "Are you sure you want to delete this question?",
    };
    return texts[lang] || texts.en;
  };

  const getButtonText = (lang) => {
    const texts = {
      tj: { confirm: "Ҳа, нест кунед", cancel: "Бекор кардан" },
      ru: { confirm: "Да, удалить", cancel: "Отмена" },
      en: { confirm: "Yes, delete", cancel: "Cancel" },
    };
    return texts[lang] || texts.en;
  };

  const buttonTexts = getButtonText(currentLanguage);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: theme === "dark" ? "#1f2937" : "white",
          color: theme === "dark" ? "white" : "black",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h7" align="center">
          {currentLanguage === "tj"
            ? "Тасдиқи нест кардан"
            : currentLanguage === "ru"
            ? "Подтверждение удаления"
            : "Delete Confirmation"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {getConfirmText(currentLanguage)}
          </Typography>
          {faq && (
            <Box
              sx={{
                p: 2,
                backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                borderRadius: 1,
                border: `1px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {currentLanguage === "tj"
                  ? "Савол:"
                  : currentLanguage === "ru"
                  ? "Вопрос:"
                  : "Question:"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {faq.question?.[currentLanguage] ||
                  faq.question?.ru ||
                  "No question"}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {currentLanguage === "tj"
                  ? "Ҷавоб:"
                  : currentLanguage === "ru"
                  ? "Ответ:"
                  : "Answer:"}
              </Typography>
              <Typography variant="body2">
                {faq.answer?.[currentLanguage] || faq.answer?.ru || "No answer"}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: 1,
            borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
            color: theme === "dark" ? "white" : "black",
            "&:hover": {
              borderColor: theme === "dark" ? "#6b7280" : "#9ca3af",
            },
          }}
        >
          {buttonTexts.cancel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            flex: 1,
            backgroundColor: "#ef4444",
            "&:hover": {
              backgroundColor: "#dc2626",
            },
          }}
        >
          {buttonTexts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function FAQ() {
  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  const t = useTranslations("faq");
  const locale = useLocale();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { data: faqs = [], error, refetch, isLoading } = useGetFaqsQuery();
  const [addFaq] = useAddFaqMutation();
  const [updateFaq] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(locale);
  const [editingFaq, setEditingFaq] = useState(null);
  const [deletingFaq, setDeletingFaq] = useState(null);
  const [form, setForm] = useState({
    id: null,
    question_en: "",
    question_ru: "",
    question_tj: "",
    answer_en: "",
    answer_ru: "",
    answer_tj: "",
  });
  const [openIds, setOpenIds] = useState([]);

  // Helper functions to convert between frontend and backend formats
  const convertFaqToFrontend = (backendFaq) => {
    return {
      id: backendFaq.id,
      question: {
        en: backendFaq.question_en || "",
        ru: backendFaq.question_ru || "",
        tj: backendFaq.question_tj || "",
      },
      answer: {
        en: backendFaq.answer_en || "",
        ru: backendFaq.answer_ru || "",
        tj: backendFaq.answer_tj || "",
      },
    };
  };

  // Convert backend data to frontend format for display
  const faqsFrontend = faqs?.map(convertFaqToFrontend) || [];

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleOpen = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const openAddModal = () => {
    setForm({
      id: null,
      question_en: "",
      question_ru: "",
      question_tj: "",
      answer_en: "",
      answer_ru: "",
      answer_tj: "",
    });
    setCurrentLanguage(locale);
    setEditMode(false);
    setEditingFaq(null);
    setShowModal(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setForm({
      id: faq.id,
      question_en: faq.question?.en || "",
      question_ru: faq.question?.ru || "",
      question_tj: faq.question?.tj || "",
      answer_en: faq.answer?.en || "",
      answer_ru: faq.answer?.ru || "",
      answer_tj: faq.answer?.tj || "",
    });
    setCurrentLanguage(locale);
    setEditMode(true);
    setShowModal(true);
  };

  const openDeleteModal = (faq) => {
    setDeletingFaq(faq);
    setShowDeleteModal(true);
  };

  const handleAdd = async () => {
    try {
      const { id, ...newFaq } = form;
      await addFaq(newFaq).unwrap();
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error("Error adding FAQ:", err);
      alert(t("addFaq"));
    }
  };

  const handleEdit = async () => {
    try {
      if (!form.id) throw new Error("FAQ id missing");

      const updateData = {
        question_en: form.question_en || "",
        question_ru: form.question_ru || "",
        question_tj: form.question_tj || "",
        answer_en: form.answer_en || "",
        answer_ru: form.answer_ru || "",
        answer_tj: form.answer_tj || "",
      };

      await updateFaq({ id: form.id, updatedFaq: updateData }).unwrap();
      setShowModal(false);
      setEditingFaq(null);
      refetch();
    } catch (err) {
      console.error("Error updating FAQ:", err);
      alert(t("errorUpdate"));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFaq(deletingFaq.id).unwrap();
      setShowDeleteModal(false);
      setDeletingFaq(null);
      refetch();
      toast.success(t('deleteSuccess'))
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      toast.error(t("errorDelete"));
    }
  };

 const handleSubmit = async () => {
  if (editMode) {
    await handleEdit();
    toast.success(t('updateSuccess'));
  } else {
    await handleAdd();
    toast.success(t('addSuccess'));
  }
};


  const handleFormChange = (field, value, lang = null) => {
    if (lang) {
      const fieldName = `${field}_${lang}`;
      setForm((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      en: "English",
      ru: "Русский",
      tj: "Тоҷикӣ",
    };
    return languages[code] || code;
  };

  const getLanguageLabel = (code) => {
    const labels = {
      en: "Question",
      ru: "Вопрос",
      tj: "Савол",
    };
    return labels[code] || "Question";
  };

  const getAnswerLabel = (code) => {
    const labels = {
      en: "Answer",
      ru: "Ответ",
      tj: "Ҷавоб",
    };
    return labels[code] || "Answer";
  };

  if (error) {
    return (
      <Errors
        error={error}
        onRetry={() => window.location.reload()}
        fullScreen
      />
    );
  }

  if (isLoading) return <Loading />;

  return (
    <section
      className={`relative min-h-screen font-sans transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      }`}
    >
      <Toaster />
      <main className="flex-1 max-w-3xl mx-auto px-4">
        <SectionOne title={t("title")} description={t("faqDescription")} />

        {isAdmin && !showModal && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={openAddModal}
              variant="contained"
              sx={{
                backgroundColor: "#8b5cf6",
                color: "white",
                "&:hover": {
                  backgroundColor: "#7c3aed",
                },
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textTransform: "none",
              }}
            >
              <Plus size={16} /> {t("addQuestion") || "Add Question"}
            </Button>
          </div>
        )}

        <div className="space-y-4 p-5">
          {faqsFrontend.map((faq, index) => {
            const idKey = faq.id ?? `temp-${index}`;
            const isOpen = openIds.includes(idKey);
            return (
              <div
                key={idKey}
                className={` border rounded-lg shadow-sm transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`flex justify-between items-center px-4 py-4 cursor-pointer transition ${
                    theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleOpen(idKey)}
                >
                  <h3 className="font-semibold">
                    {faq.question?.[locale] ||
                      faq.question?.ru ||
                      "No question"}
                  </h3>
                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isOpen && (
                  <div
                    className={`px-4 pb-4 pt-2 border-t transition-colors duration-300 ${
                      theme === "dark"
                        ? "border-gray-700 text-gray-200"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <p>
                      {faq.answer?.[locale] || faq.answer?.ru || "No answer"}
                    </p>
                    {isAdmin && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(faq);
                          }}
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: "#3b82f6",
                            "&:hover": {
                              backgroundColor: "#2563eb",
                            },
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            textTransform: "none",
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(faq);
                          }}
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: "#ef4444",
                            "&:hover": {
                              backgroundColor: "#dc2626",
                            },
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            textTransform: "none",
                          }}
                        >
                          <Delete size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingFaq(null);
        }}
        onConfirm={handleDelete}
        faq={deletingFaq}
        currentLanguage={currentLanguage}
      />

      {/* FAQ Edit/Add Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFaq(null);
        }}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: theme === "dark" ? "#1f2937" : "white",
            color: theme === "dark" ? "white" : "black",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${
              theme === "dark" ? "#374151" : "#e5e7eb"
            }`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Globe size={20} />
            <Typography variant="h6" component="span">
              {editMode
                ? `${t("editTitle") || "Edit FAQ"} - ${getLanguageName(
                    currentLanguage
                  )}`
                : `${t("addTitle") || "Add FAQ"} - ${getLanguageName(
                    currentLanguage
                  )}`}
            </Typography>
          </Box>
          <IconButton
            onClick={() => {
              setShowModal(false);
              setEditingFaq(null);
            }}
            sx={{ color: "inherit" }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 3 }}>
            {/* Language Tabs */}
            <AppBar
              position="static"
              sx={{
                backgroundColor: "transparent",
                boxShadow: "none",
                borderBottom: `1px solid ${
                  theme === "dark" ? "#374151" : "#e5e7eb"
                }`,
                mb: 3,
              }}
            >
              <Toolbar
                variant="dense"
                sx={{ minHeight: "auto!important", p: "0!important" }}
              >
                <Tabs
                  value={currentLanguage}
                  onChange={(e, newValue) => setCurrentLanguage(newValue)}
                  sx={{
                    "& .MuiTab-root": {
                      color: theme === "dark" ? "#9ca3af" : "#6b7280",
                      fontSize: "0.75rem",
                      py: 1,
                      minHeight: "auto",
                      "&.Mui-selected": {
                        color: "#3b82f6",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#3b82f6",
                    },
                  }}
                >
                  <Tab label="Тоҷикӣ" value="tj" />
                  <Tab label="Русский" value="ru" />
                  <Tab label="English" value="en" />
                </Tabs>
              </Toolbar>
            </AppBar>

            {/* Form for current language */}
            <Box>
              <TextField
                fullWidth
                label={getLanguageLabel(currentLanguage)}
                value={form[`question_${currentLanguage}`] || ""}
                onChange={(e) =>
                  handleFormChange("question", e.target.value, currentLanguage)
                }
                variant="outlined"
                size="medium"
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    color: theme === "dark" ? "white" : "black",
                    backgroundColor: theme === "dark" ? "#374151" : "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme === "dark" ? "#6b7280" : "#9ca3af",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3b82f6",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    "&.Mui-focused": {
                      color: "#3b82f6",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label={getAnswerLabel(currentLanguage)}
                value={form[`answer_${currentLanguage}`] || ""}
                onChange={(e) =>
                  handleFormChange("answer", e.target.value, currentLanguage)
                }
                variant="outlined"
                size="medium"
                multiline
                rows={4}
                InputProps={{
                  sx: {
                    color: theme === "dark" ? "white" : "black",
                    backgroundColor: theme === "dark" ? "#374151" : "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme === "dark" ? "#6b7280" : "#9ca3af",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3b82f6",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    "&.Mui-focused": {
                      color: "#3b82f6",
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <div className="flex justify-between w-[100%]">
            <Button
              onClick={() => {
                setShowModal(false);
                setEditingFaq(null);
              }}
              variant="outlined"
              sx={{
                color: theme === "dark" ? "white" : "black",
                borderColor: theme === "dark" ? "#6b7280" : "#d1d5db",
                "&:hover": {
                  borderColor: theme === "dark" ? "#9ca3af" : "#9ca3af",
                  backgroundColor:
                    theme === "dark"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.04)",
                },
              }}
            >
              {currentLanguage === "tj"
                ? "Бекор кардан"
                : currentLanguage === "ru"
                ? "Отмена"
                : "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: "#3b82f6",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
              }}
            >
              {editMode
                ? currentLanguage === "tj"
                  ? "Сабт кардан"
                  : currentLanguage === "ru"
                  ? "Сохранить"
                  : "Save"
                : currentLanguage === "tj"
                ? "Илова кардан"
                : currentLanguage === "ru"
                ? "Добавить"
                : "Add"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </section>
  );
}
