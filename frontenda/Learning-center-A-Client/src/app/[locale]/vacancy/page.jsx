"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { PlusCircle } from "lucide-react";
import LanguageIcon from "@mui/icons-material/Language";
import VacancyRequirements from "@/components/vacancy/VacancyRequirements";
import VacancyInfoCards from "@/components/vacancy/VacancyInfoCards";
import VacancyList from "@/components/vacancy/VacancyList";
import VacancyForm from "@/components/vacancy/VacancyForm";
import FAQSection from "@/components/vacancy/FAQSection";
import AddVacancyModal from "@/components/vacancy/AddVacancyModal";
import EditVacancyModal from "@/components/vacancy/EditVacancyModal";
import AddQuestionModal from "@/components/vacancy/AddQuestionModal";
import EditQuestionModal from "@/components/vacancy/EditQuestionModal";
import DeleteConfirmModal from "@/components/vacancy/DeleteConfirmModal";
import { useTheme } from "next-themes";
import SectionOne from "@/components/SectionOne";
import { useLocale, useTranslations } from "next-intl";
import {
  useAddQuestionMutation,
  useAddVacancyMutation,
  useDeleteQuestionMutation,
  useDeleteVacancyMutation,
  useGetAnswerQuery,
  useGetVacancyQuery,
  useUpdateQuestionMutation,
  useUpdateVacancyMutation,
} from "@/store/slices/vacancyApi";

import { Button } from "@mui/material";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Errors from "@/components/error/errors";
import { Toaster, toast } from "react-hot-toast";
import { Delete, Edit } from "@mui/icons-material";
import Loading from "@/components/loading/loading";

const Vacancy = () => {
  const { theme, setTheme } = useTheme();
  let t = useTranslations("vacancy");
  const [mounted, setMounted] = useState(false);
  const [expandedStates, setExpandedStates] = useState({});
  const {
    data: vacancies,
    refetch: refetchVacancies,
    error,
    isLoading,
  } = useGetVacancyQuery();
  const { data: answer, refetch: refetchAnswers } = useGetAnswerQuery();
  const [addVacancy] = useAddVacancyMutation();
  const [addQuestion] = useAddQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [updateVacancy] = useUpdateVacancyMutation();
  const [deleteVacancy] = useDeleteVacancyMutation();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isAddQModalOpen, setAddQModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isEditModalOpenQuestion, setEditModalOpenQuestion] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteQuestionModalOpen, setDeleteQuestionModalOpen] =
    useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [currentEditIdQuestion, setCurrentEditIdQuestion] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToDeleteQuestion, setItemToDeleteQuestion] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const lang = useLocale();

  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  // Helper functions to convert between frontend and backend formats
  const convertVacancyToFrontend = useCallback((backendVacancy) => {
    return {
      id: backendVacancy.id,
      name: {
        en: backendVacancy.name_en || "",
        ru: backendVacancy.name_ru || "",
        tj: backendVacancy.name_tj || "",
      },
      title: {
        en: backendVacancy.title_en || "",
        ru: backendVacancy.title_ru || "",
        tj: backendVacancy.title_tj || "",
      },
      description: {
        en: backendVacancy.description_en || "",
        ru: backendVacancy.description_ru || "",
        tj: backendVacancy.description_tj || "",
      },
      image: backendVacancy.image || "",
    };
  }, []);

  const convertQuestionToFrontend = useCallback((backendQuestion) => {
    return {
      id: backendQuestion.id,
      question: {
        en: backendQuestion.question_en || "",
        ru: backendQuestion.question_ru || "",
        tj: backendQuestion.question_tj || "",
      },
      answer: {
        en: backendQuestion.answer_en || "",
        ru: backendQuestion.answer_ru || "",
        tj: backendQuestion.answer_tj || "",
      },
    };
  }, []);

  const convertQuestionToBackend = useCallback((frontendQuestion) => {
    return {
      question_en: frontendQuestion.question?.en || "",
      question_ru: frontendQuestion.question?.ru || "",
      question_tj: frontendQuestion.question?.tj || "",
      answer_en: frontendQuestion.answer?.en || "",
      answer_ru: frontendQuestion.answer?.ru || "",
      answer_tj: frontendQuestion.answer?.tj || "",
    };
  }, []);

  // Empty form templates - мемоизированы, так как не изменяются
  const emptyForm = useMemo(
    () => ({
      name: { en: "", ru: "", tj: "" },
      title: { en: "", ru: "", tj: "" },
      description: { en: "", ru: "", tj: "" },
      image: "",
    }),
    []
  );

  const emptyFormQuestion = useMemo(
    () => ({
      question: { en: "", ru: "", tj: "" },
      answer: { en: "", ru: "", tj: "" },
    }),
    []
  );

  const [formData, setFormData] = useState(emptyForm);
  const [formDataQuestion, setFormDataQuestion] = useState(emptyFormQuestion);
  const [activeLang, setActiveLang] = useState("en");

  // Convert backend data to frontend format for display - мемоизировано
  const vacanciesFrontend = useMemo(
    () => vacancies?.map(convertVacancyToFrontend) || [],
    [vacancies, convertVacancyToFrontend]
  );

  const answersFrontend = useMemo(
    () => answer?.map(convertQuestionToFrontend) || [],
    [answer, convertQuestionToFrontend]
  );

  const handleChange = useCallback(
    (e, lang, field) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: e.target.value,
        },
      }));
    },
    []
  );

  const handleChangeQuestion = useCallback(
    (e, lang, field) => {
      setFormDataQuestion((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: e.target.value,
        },
      }));
    },
    []
  );

  // CORRECTED VACANCY FUNCTIONS WITH FORMDATA
  const handleAdd = useCallback(async () => {
    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Append all text fields
      formDataToSend.append("name_en", formData.name.en || "");
      formDataToSend.append("name_ru", formData.name.ru || "");
      formDataToSend.append("name_tj", formData.name.tj || "");
      formDataToSend.append("title_en", formData.title.en || "");
      formDataToSend.append("title_ru", formData.title.ru || "");
      formDataToSend.append("title_tj", formData.title.tj || "");
      formDataToSend.append("description_en", formData.description.en || "");
      formDataToSend.append("description_ru", formData.description.ru || "");
      formDataToSend.append("description_tj", formData.description.tj || "");

      // Append image file if selected
      if (selectedImageFile) {
        formDataToSend.append("image", selectedImageFile);
      }

      await addVacancy(formDataToSend).unwrap();

      // Show success toast
      toast.success(t("vacancyAddSuccess"));

      // Reset form and close modal
      setFormData(emptyForm);
      setSelectedImage(null);
      setSelectedImageFile(null);
      setAddModalOpen(false);
      refetchVacancies();
    } catch (err) {
      console.error("Add vacancy failed:", err);
      if (err?.data) console.error("Server response:", err.data);
      toast.error(t("failedAdd"));
    }
  }, [formData, selectedImageFile, addVacancy, t, emptyForm, refetchVacancies]);

  const handleEdit = useCallback(async () => {
    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Append all text fields
      formDataToSend.append("name_en", formData.name.en || "");
      formDataToSend.append("name_ru", formData.name.ru || "");
      formDataToSend.append("name_tj", formData.name.tj || "");
      formDataToSend.append("title_en", formData.title.en || "");
      formDataToSend.append("title_ru", formData.title.ru || "");
      formDataToSend.append("title_tj", formData.title.tj || "");
      formDataToSend.append("description_en", formData.description.en || "");
      formDataToSend.append("description_ru", formData.description.ru || "");
      formDataToSend.append("description_tj", formData.description.tj || "");

      // Append image file if selected
      if (selectedImageFile) {
        formDataToSend.append("image", selectedImageFile);
      }

      await updateVacancy({
        id: currentEditId,
        data: formDataToSend,
      }).unwrap();

      // Show success toast
      toast.success(t("vacancyUpdateSuccess"));

      // Reset form and close modal
      setFormData(emptyForm);
      setSelectedImage(null);
      setSelectedImageFile(null);
      setCurrentEditId(null);
      setEditModalOpen(false);
      refetchVacancies();
    } catch (err) {
      console.error("Update vacancy failed:", err);
      if (err?.data) console.error("Server response:", err.data);
      toast.error(t("failedUpdateVacancy"));
    }
  }, [formData, selectedImageFile, currentEditId, updateVacancy, t, emptyForm, refetchVacancies]);

  // CORRECTED QUESTION FUNCTIONS (JSON format)
  const handleAddQuestion = useCallback(async () => {
    try {
      const backendData = convertQuestionToBackend(formDataQuestion);
      await addQuestion(backendData).unwrap();

      // Show success toast
      toast.success(t("addQuestionSuccess"));

      setFormDataQuestion(emptyFormQuestion);
      setAddQModalOpen(false);
      refetchAnswers();
    } catch (err) {
      console.error("Add question failed:", err);
      if (err?.data) console.error("Server response:", err.data);
      toast.error(t("failedAddQuestion"));
    }
  }, [formDataQuestion, convertQuestionToBackend, addQuestion, t, emptyFormQuestion, refetchAnswers]);

  const handleEditQuestion = useCallback(async () => {
    try {
      const backendData = convertQuestionToBackend(formDataQuestion);
      await updateQuestion({
        id: currentEditIdQuestion,
        data: backendData,
      }).unwrap();

      // Show success toast
      toast.success(t("updateQuestion"));

      setFormDataQuestion(emptyFormQuestion);
      setCurrentEditIdQuestion(null);
      setEditModalOpenQuestion(false);
      refetchAnswers();
    } catch (err) {
      console.error("Update question failed:", err);
      if (err?.data) console.error("Server response:", err.data);
      toast.error(t("failedUpdateQuestion"));
    }
  }, [formDataQuestion, convertQuestionToBackend, currentEditIdQuestion, updateQuestion, t, emptyFormQuestion, refetchAnswers]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteVacancy(itemToDelete).unwrap();

      // Show success toast
      toast.success(t("deleteVacancy"));

      setDeleteModalOpen(false);
      setItemToDelete(null);
      refetchVacancies();
    } catch (err) {
      console.error("Delete vacancy failed:", err);
      toast.error(t("failedDeleteVacancy"));
    }
  }, [itemToDelete, deleteVacancy, t, refetchVacancies]);

  const handleDeleteQuestion = useCallback(async () => {
    try {
      await deleteQuestion(itemToDeleteQuestion).unwrap();

      // Show success toast
      toast.success(t("deleteSuccess"));

      setDeleteQuestionModalOpen(false);
      setItemToDeleteQuestion(null);
      refetchAnswers();
    } catch (err) {
      console.error("Delete question failed:", err);
      toast.error(t("failedDelete"));
    }
  }, [itemToDeleteQuestion, deleteQuestion, t, refetchAnswers]);

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error(t("validImage"));
        return;
      }

      if (file.size > maxSize) {
        toast.error(t("size"));
        return;
      }

      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);

  const openDelete = useCallback((id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const openDeleteQuestion = useCallback((id) => {
    setItemToDeleteQuestion(id);
    setDeleteQuestionModalOpen(true);
  }, []);

  const openEdit = useCallback(
    (item) => {
    const frontendItem = convertVacancyToFrontend(item);
    setFormData(frontendItem);
    setSelectedImage(item.image || null);
    setSelectedImageFile(null); // Reset file when opening edit
      setCurrentEditId(item.id);
      setEditModalOpen(true);
    },
    [convertVacancyToFrontend]
  );

  const openEditQuestion = useCallback(
    (item) => {
    const frontendItem = convertQuestionToFrontend(item);
    setFormDataQuestion(frontendItem);
      setCurrentEditIdQuestion(item.id);
      setEditModalOpenQuestion(true);
    },
    [convertQuestionToFrontend]
  );

  // Close modal functions
  const closeAddModal = useCallback(() => {
    setFormData(emptyForm);
    setSelectedImage(null);
      setSelectedImageFile(null);
      setAddModalOpen(false);
    },
    [emptyForm]
  );

  const closeEditModal = useCallback(() => {
    setFormData(emptyForm);
    setSelectedImage(null);
    setSelectedImageFile(null);
      setCurrentEditId(null);
      setEditModalOpen(false);
    },
    [emptyForm]
  );

  const closeAddQModal = useCallback(() => {
      setFormDataQuestion(emptyFormQuestion);
      setAddQModalOpen(false);
    },
    [emptyFormQuestion]
  );

  const closeEditQuestionModal = useCallback(() => {
    setFormDataQuestion(emptyFormQuestion);
      setCurrentEditIdQuestion(null);
      setEditModalOpenQuestion(false);
    },
    [emptyFormQuestion]
  );

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, [setTheme]);

  const handleOpenAddModal = useCallback(() => {
    setFormData(emptyForm);
    setSelectedImage(null);
    setSelectedImageFile(null);
    setAddModalOpen(true);
  }, [emptyForm]);

  const handleOpenAddQuestionModal = useCallback(() => {
    setFormDataQuestion(emptyFormQuestion);
    setAddQModalOpen(true);
  }, [emptyFormQuestion]);

  const handleSetActiveLang = useCallback((lang) => {
    setActiveLang(lang);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  const handleCloseDeleteQuestionModal = useCallback(() => {
    setDeleteQuestionModalOpen(false);
  }, []);

  
  const handleToggleExpand = useCallback((id) => {
    setExpandedStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);
  
  if (!mounted) return null;
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
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans`}
    >
      <Toaster />
      <div className="lg:max-w-[1280px] z-10 mx-5  py-5 lg:mx-auto">
        <SectionOne title={t("title")} description={t("descriptionVacancy")} />

        <VacancyRequirements />

        <VacancyInfoCards />

        <div className="my-[140px]">
          <div className="mt-[60px]">
            <p className="text-[45px] leading-10 font-[500]">{t("ugodna")}</p>
            <p className="text-[25px] font-[500] leading-8 mt-[20px]">
              {t("desc")}
            </p>
            <div className="flex justify-end mt-5">
              {isAdmin && (
                <Button
                  className="px-4 flex gap-2 items-center py-2 bg-blue-500 text-white rounded cursor-pointer"
                  onClick={handleOpenAddModal}
                  variant="contained"
                >
                  <PlusCircle size={18} /> {t("addVacancy")}
                </Button>
              )}
            </div>

            <VacancyList
              vacanciesFrontend={vacanciesFrontend}
              vacancies={vacancies}
              lang={lang}
              expandedStates={expandedStates}
              onToggleExpand={handleToggleExpand}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </div>
        </div>

        <FAQSection
          answersFrontend={answersFrontend}
          answer={answer}
          lang={lang}
          isAdmin={isAdmin}
          onAddQuestion={handleOpenAddQuestionModal}
          onEditQuestion={openEditQuestion}
          onDeleteQuestion={openDeleteQuestion}
        />

        <VacancyForm />
      </div>
      <AddVacancyModal
        open={isAddModalOpen}
        onClose={closeAddModal}
        formData={formData}
        onFormDataChange={handleChange}
        activeLang={activeLang}
        onActiveLangChange={handleSetActiveLang}
        selectedImage={selectedImage}
        onFileUpload={handleFileUpload}
        onSubmit={handleAdd}
      />

      <EditVacancyModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        formData={formData}
        onFormDataChange={handleChange}
        activeLang={activeLang}
        onActiveLangChange={handleSetActiveLang}
        selectedImage={selectedImage}
        formDataImage={formData.image}
        onFileUpload={handleFileUpload}
        onSubmit={handleEdit}
      />

      <AddQuestionModal
        open={isAddQModalOpen}
        onClose={closeAddQModal}
        formData={formDataQuestion}
        onFormDataChange={handleChangeQuestion}
        activeLang={activeLang}
        onActiveLangChange={handleSetActiveLang}
        onSubmit={handleAddQuestion}
      />

      <EditQuestionModal
        open={isEditModalOpenQuestion}
        onClose={closeEditQuestionModal}
        formData={formDataQuestion}
        onFormDataChange={handleChangeQuestion}
        activeLang={activeLang}
        onActiveLangChange={handleSetActiveLang}
        onSubmit={handleEditQuestion}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        message={t("ansDelete")}
      />

      <DeleteConfirmModal
        open={isDeleteQuestionModalOpen}
        onClose={handleCloseDeleteQuestionModal}
        onConfirm={handleDeleteQuestion}
        message={t("questDelete")}
      />
    </div>
  );
};

export default Vacancy;
