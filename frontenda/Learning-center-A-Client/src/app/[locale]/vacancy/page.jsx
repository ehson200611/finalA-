"use client";
import React, { useEffect, useState } from "react";
import { Info, PlusCircle } from "lucide-react";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import { Zap } from "lucide-react";
import { FolderPlus } from "lucide-react";
import LanguageIcon from "@mui/icons-material/Language";
import { ArrowLeftRight } from "lucide-react";
import { Cog } from "lucide-react";
import { Glasses } from "lucide-react";
import { Users } from "lucide-react";
import InfoCard from "@/components/vacancy/infoCard";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Save, X, Globe, Languages } from "lucide-react";
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

// Material-UI Modal Components
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { useAddVacancyWorkMutation } from "@/store/slices/vacancyWorksApi";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Errors from "@/components/error/errors";
import { ToastBar, Toaster, toast } from "react-hot-toast";
import { Delete, Edit } from "@mui/icons-material";
import Loading from "@/components/loading/loading";

const Vacancy = () => {
  const { theme, setTheme } = useTheme();
  let t = useTranslations("vacancy");
  const [mounted, setMounted] = useState(false);
  const [expandedStates, setExpandedStates] = useState({});
  const [activeTab, setActiveTab] = useState("english");
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
  const convertVacancyToFrontend = (backendVacancy) => {
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
  };

  const convertQuestionToFrontend = (backendQuestion) => {
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
  };

  const convertQuestionToBackend = (frontendQuestion) => {
    return {
      question_en: frontendQuestion.question?.en || "",
      question_ru: frontendQuestion.question?.ru || "",
      question_tj: frontendQuestion.question?.tj || "",
      answer_en: frontendQuestion.answer?.en || "",
      answer_ru: frontendQuestion.answer?.ru || "",
      answer_tj: frontendQuestion.answer?.tj || "",
    };
  };

  // Empty form templates
  const emptyForm = {
    name: { en: "", ru: "", tj: "" },
    title: { en: "", ru: "", tj: "" },
    description: { en: "", ru: "", tj: "" },
    image: "",
  };

  const emptyFormQuestion = {
    question: { en: "", ru: "", tj: "" },
    answer: { en: "", ru: "", tj: "" },
  };

  const [formData, setFormData] = useState(emptyForm);
  const [formDataQuestion, setFormDataQuestion] = useState(emptyFormQuestion);
  const [activeLang, setActiveLang] = useState("en");

  // Convert backend data to frontend format for display
  const vacanciesFrontend = vacancies?.map(convertVacancyToFrontend) || [];
  const answersFrontend = answer?.map(convertQuestionToFrontend) || [];
  const [addVacancyWork, refetch] = useAddVacancyWorkMutation();

  // Add these state variables near your other state declarations
  const [formVacancyData, setFormVacancyData] = useState({
    name: "",
    surname: "",
    email: "",
    date: "",
    phone: "",
    resume: null,
  });

  // Add this function to handle form input changes
  // Update handleFormChange to use correct state property names
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resumefile") {
      setFormVacancyData((prev) => ({
        ...prev,
        resume: files[0], // Store in 'resume' but the input name is 'resumefile'
      }));
    } else {
      // Map input names to state property names
      const stateProperty =
        name === "phonenumber"
          ? "phone"
          : name === "date_of_birth"
          ? "date"
          : name;

      setFormVacancyData((prev) => ({
        ...prev,
        [stateProperty]: value,
      }));
    }
  };

  // Add this function to handle form submission
  // Update the handleFormSubmit function with correct field names:
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (
        !formVacancyData.name ||
        !formVacancyData.surname ||
        !formVacancyData.email ||
        !formVacancyData.phone ||
        !formVacancyData.date ||
        !formVacancyData.resume
      ) {
        toast.error(t("pleasePol"));
        return;
      }

      // Create FormData object for file upload
      const formDataToSend = new FormData();

      // Append all form fields with EXACT field names backend expects
      formDataToSend.append("name", formVacancyData.name);
      formDataToSend.append("surname", formVacancyData.surname);
      formDataToSend.append("email", formVacancyData.email);
      formDataToSend.append("phonenumber", formVacancyData.phone); // Backend expects 'phonenumber'
      formDataToSend.append("date_of_birth", formVacancyData.date); // Backend expects 'date_of_birth'
      formDataToSend.append("resumefile", formVacancyData.resume); // Backend expects 'resumefile'

      // Call the mutation
      const result = await addVacancyWork(formDataToSend).unwrap();

      // Show success message
      toast.success(t("application"));

      // Reset form
      setFormVacancyData({
        name: "",
        surname: "",
        email: "",
        date: "",
        phone: "",
        resume: null,
      });

      // Reset file input
      const fileInput = document.querySelector('input[name="resume"]');
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Error submitting vacancy application:", err);

      // Log the full error response
      if (err?.data) {
        console.error("Error details:", err.data);
        console.error("Error fields:", err.data?.errors || err.data);

        // Show specific validation errors
        if (err.data?.errors) {
          const errorMessages = [];
          if (err.data.errors.name)
            errorMessages.push(
              `${t("name")}: ${err.data.errors.name.join(", ")}`
            );
          if (err.data.errors.surname)
            errorMessages.push(
              `Surname: ${err.data.errors.surname.join(", ")}`
            );
          if (err.data.errors.email)
            errorMessages.push(
              `${t("email")}: ${err.data.errors.email.join(", ")}`
            );
          if (err.data.errors.phonenumber)
            errorMessages.push(
              `Phone: ${err.data.errors.phonenumber.join(", ")}`
            );
          if (err.data.errors.date_of_birth)
            errorMessages.push(
              `${t("date")}: ${err.data.errors.date_of_birth.join(", ")}`
            );
          if (err.data.errors.resumefile)
            errorMessages.push(
              `${t("resume")}: ${err.data.errors.resumefile.join(", ")}`
            );

          if (errorMessages.length > 0) {
            toast.error(`${t("fixFollowing")}:\n\n${errorMessages.join("\n")}`);
            return;
          }
        }
      }

      // Show generic error message
      toast.error(t("errorSubmit"));
    }
  };

  const handleChange = (e, lang, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: e.target.value,
      },
    }));
  };

  const handleChangeQuestion = (e, lang, field) => {
    setFormDataQuestion((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: e.target.value,
      },
    }));
  };

  // CORRECTED VACANCY FUNCTIONS WITH FORMDATA
  const handleAdd = async () => {
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
  };

  const handleEdit = async () => {
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
  };

  // CORRECTED QUESTION FUNCTIONS (JSON format)
  const handleAddQuestion = async () => {
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
  };

  const handleEditQuestion = async () => {
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
  };

  const handleDelete = async () => {
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
  };

  const handleDeleteQuestion = async () => {
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
  };

  // Handle file upload
  const handleFileUpload = (e) => {
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
  };

  const openDelete = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const openDeleteQuestion = (id) => {
    setItemToDeleteQuestion(id);
    setDeleteQuestionModalOpen(true);
  };

  const openEdit = (item) => {
    const frontendItem = convertVacancyToFrontend(item);
    setFormData(frontendItem);
    setSelectedImage(item.image || null);
    setSelectedImageFile(null); // Reset file when opening edit
    setCurrentEditId(item.id);
    setEditModalOpen(true);
  };

  const openEditQuestion = (item) => {
    const frontendItem = convertQuestionToFrontend(item);
    setFormDataQuestion(frontendItem);
    setCurrentEditIdQuestion(item.id);
    setEditModalOpenQuestion(true);
  };

  // Close modal functions
  const closeAddModal = () => {
    setFormData(emptyForm);
    setSelectedImage(null);
    setSelectedImageFile(null);
    setAddModalOpen(false);
  };

  const closeEditModal = () => {
    setFormData(emptyForm);
    setSelectedImage(null);
    setSelectedImageFile(null);
    setCurrentEditId(null);
    setEditModalOpen(false);
  };

  const closeAddQModal = () => {
    setFormDataQuestion(emptyFormQuestion);
    setAddQModalOpen(false);
  };

  const closeEditQuestionModal = () => {
    setFormDataQuestion(emptyFormQuestion);
    setCurrentEditIdQuestion(null);
    setEditModalOpenQuestion(false);
  };

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

  useEffect(() => {
    if (mounted && theme) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  const handleToggleExpand = (id) => {
    setExpandedStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans`}
    >
      <Toaster
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === "dark" ? "#1e293b" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "10px",
            border:
              theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
          },
        }}
      />
      <div className="lg:max-w-[1280px] z-10 mx-5  py-5 lg:mx-auto">
        <SectionOne title={t("title")} description={t("descriptionVacancy")} />

        <div
          className={`${
            theme == "dark"
              ? "bg-gradient-to-r from-[#023d94] via-[#164c8b] to-[#1435a0]"
              : "bg-gradient-to-r from-[#0166fd] via-[#3a96ff] to-[#7a99ff]"
          } rounded-md mb-[70px] flex flex-col items-center relative box mt-[40px]
  p-4 lg:p-6 ${
    theme === "dark" ? "border border-gray-700" : "border border-gray-200"
  }`}
        >
          <h2 className="text-2xl text-white lg:text-5xl w-full md:w-auto font-semibold mb-3 lg:mb-4 text-center px-4">
            {t("lang")}
          </h2>

          <p className="text-base text-white md:text-2xl font-medium mb-5 lg:mb-6 max-w-[90%] lg:max-w-[70%] text-center">
            {t("trelang")}
          </p>

          <div className="flex justify-center gap-2 lg:gap-4 mb-5 lg:mb-6">
            <button
              onClick={() => setActiveTab("english")}
              className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition cursor-pointer text-sm md:text-xl ${
                activeTab === "english"
                  ? "bg-white text-yellow-600"
                  : theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {t("english")}
            </button>

            <button
              onClick={() => setActiveTab("russian")}
              className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition cursor-pointer text-sm md:text-base ${
                activeTab === "russian"
                  ? "bg-white text-[#FF4500]"
                  : theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {t("russian")}
            </button>

            <button
              onClick={() => setActiveTab("preschool")}
              className={`px-4 lg:px-6 py-2 rounded-lg font-medium transition cursor-pointer text-sm md:text-base ${
                activeTab === "preschool"
                  ? "bg-white text-green-600"
                  : theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {t("dashcol")}
            </button>
          </div>

          <div className="w-full max-w-3xl grid sm:grid-cols-1 md:grid-cols-1 gap-5 md:gap-6">
            {activeTab === "english" && (
              <div
                className={`p-4 md:p-6 rounded-2xl shadow-lg transition-all border ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-700 hover:shadow-2xl"
                    : "bg-white border-gray-200 hover:shadow-2xl"
                }`}
              >
                <h3 className="text-xl md:text-2xl font-extrabold mb-3 md:mb-4 text-yellow-600 text-center">
                  {t("langEn")}
                </h3>
                <ul
                  className={`list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 ${
                    theme == "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>{t("minUrov")}</li>
                  <li>{t("age")}</li>
                  <li>{t("opit")}</li>
                  <li>{t("sertificate")}</li>
                </ul>
              </div>
            )}

            {activeTab === "russian" && (
              <div
                className={`p-4 md:p-6 rounded-2xl shadow-lg transition-all border ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-700 hover:shadow-2xl"
                    : "bg-white border-gray-200 hover:shadow-2xl"
                }`}
              >
                <h3 className="text-xl md:text-2xl font-extrabold mb-3 md:mb-4 bg-linear-to-r from-[#FF6347] to-[#FF4500] bg-clip-text text-transparent text-center">
                  {t("langRu")}
                </h3>
                <ul
                  className={`list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 ${
                    theme == "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>{t("minUrovRu")}</li>
                  <li>{t("age")}</li>
                  <li>{t("opit")}</li>
                  <li>{t("sertificate")}</li>
                </ul>
              </div>
            )}

            {activeTab === "preschool" && (
              <div
                className={`p-4 md:p-6 rounded-2xl shadow-lg transition-all border ${
                  theme === "dark"
                    ? "bg-gray-900 border-gray-700 hover:shadow-2xl"
                    : "bg-white border-gray-200 hover:shadow-2xl"
                }`}
              >
                <h3 className="text-xl md:text-2xl font-extrabold mb-3 md:mb-4 text-green-600 text-center">
                  {t("langDash")}
                </h3>
                <ul
                  className={`list-disc pl-4 md:pl-5 space-y-1 md:space-y-2 ${
                    theme == "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <li>{t("obroz")}</li>
                  <li>{t("uroven")}</li>
                  <li>{t("ageDash")}</li>
                  <li>{t("opitDahs")}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className=" relative w-full  lg:py-16 lg:px-6">
          <div
            className="flex flex-nowrap lg:justify-center lg:gap-10 gap-6 overflow-x-auto lg:overflow-visible
    scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-thumb-[#00CED1] scroll-smooth pb-4"
          >
            <div
              className={`w-[85%] sm:w-[70%] lg:w-[415px] h-[260px] lg:h-[280px] min-w-[300px] p-6 rounded-3xl transform transition-all duration-500 lg:hover:scale-105 shrink-0 
      ${
        theme === "dark"
          ? "bg-linear-to-br from-[#1a1a1a] via-[#552a2a] to-[#333] text-gray-100 border-gray-700"
          : "bg-linear-to-br from-[#FFDEE9] via-[#B5FFFC] to-[#00CED1]  bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#FFDEE9_100%)]  text-gray-900"
      }`}
              style={{ backgroundBlendMode: "overlay" }}
            >
              <div className="flex flex-col justify-between h-full">
                <h3 className="text-xl md:text-3xl font-extrabold mb-2">
                  {t("langDash")}
                </h3>
                <ul className="text-base md:text-xl leading-relaxed space-y-1">
                  <li>{t("forChild")}</li>
                  <li>{t("nedelu")}</li>
                  <li>{t("rechi")}</li>
                </ul>
              </div>
            </div>

            <div
              className={`w-[85%] sm:w-[70%] lg:w-[415px] h-[260px] lg:h-[280px] min-w-[300px] p-6 rounded-3xl transform transition-all duration-500 lg:hover:scale-105 shrink-0
      ${
        theme === "dark"
          ? "bg-linear-to-br from-[#1f2937] via-[#334155] to-[#475569] text-gray-100 border border-gray-700 shadow-lg"
          : " bg-linear-to-br from-[#FFD194] via-[#D191FF] to-[#00CED1]  bg-[radial-gradient(circle_at_top_right,_#ffffff_0%,_#FFD194_100%)] text-gray-900 border border-transparent"
      }`}
              style={{ backgroundBlendMode: "overlay" }}
            >
              <div className="flex flex-col justify-between h-full">
                <h3 className="text-xl md:text-3xl font-extrabold mb-2">
                  {t("courseEn")}
                </h3>
                <ul className="text-base md:text-xl leading-relaxed space-y-1">
                  <li>{t("year")}</li>
                  <li>
                    7–10 {t("years")} — <b>Round-Up</b>, <b>Prepare 1</b>
                  </li>
                  <li>
                    10–14 {t("years")} — <b>A1–B2</b>
                  </li>
                  <li>
                    {t("men")} — <b>TOEFL / IELTS</b>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className={`w-[85%] sm:w-[70%] lg:w-[415px] h-[260px] lg:h-[280px] p-6 rounded-3xl transform transition-all duration-500 lg:hover:scale-105 shrink-0
      ${
        theme === "dark"
          ? "bg-linear-to-br from-[#0f172a] via-[#1e3a8a] to-[#155ew75] text-gray-100 border border-gray-700 shadow-lg"
          : "bg-linear-to-br from-[#6DD5FA] via-[#2980B9] to-[#00CED1] bg-[radial-gradient(circle_at_bottom_left,_#ffffff_0%,_#6DD5FA_100%)] text-black border border-transparent"
      }`}
              style={{ backgroundBlendMode: "overlay" }}
            >
              <div className="flex flex-col justify-between h-full">
                <h3 className="text-xl md:text-3xl font-extrabold mb-2">
                  {t("courseRu")}
                </h3>
                <ul className="text-base md:text-xl leading-relaxed space-y-1">
                  <li>{t("ages")}</li>
                  <li>{t("child")}</li>
                  <li>{t("big")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className=" my-[100px] lg:my-[100px]">
          <h3
            className={`text-3xl lg:text-5xl lg:text-[40px] font-bold text-center leading-snug md:leading-tight ${
              theme == "dark" ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {t("educCenter")}
          </h3>

          <div className="mt-[60px] flex flex-nowrap overflow-x-auto gap-4 px-2 md:flex-wrap md:justify-center md:gap-[40px] scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-thumb-[#00CED1] scroll-smooth">
            <InfoCard
              icon={<Zap />}
              name={t("strCom")}
              description={t("strDesc")}
            />
            <InfoCard
              icon={<FolderPlus />}
              name={t("easyCom")}
              description={t("easyDesc")}
            />
            <InfoCard
              icon={<ArrowLeftRight />}
              name={t("format")}
              description={t("formatDesc")}
            />
            <InfoCard
              icon={<Cog />}
              name={t("regular")}
              description={t("regularDesc")}
            />
            <InfoCard
              icon={<Glasses />}
              name={t("rut")}
              description={t("rutDesc")}
            />
            <InfoCard
              icon={<Users />}
              name={t("pupil")}
              description={t("pupilDesc")}
            />
          </div>
        </div>

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
                  onClick={() => {
                    setFormData(emptyForm);
                    setSelectedImage(null);
                    setSelectedImageFile(null);
                    setAddModalOpen(true);
                  }}
                  sx={{ backgroundColor: "blue", color: "white" }}
                >
                  <PlusCircle size={18} /> {t("addVacancy")}
                </Button>
              )}
            </div>

            <div className="mt-[45px] flex gap-4 overflow-x-auto scrollbar-hide scrollbar-thin scrollbar-thumb-[#00CED1] snap-x">
              {vacanciesFrontend?.map((e) => {
                const isExpanded = expandedStates[e.id] || false;
                const descriptionLength = e.description?.[lang]?.length || 0;

                // Ensure we get the description text for current language
                const descriptionText = e.description?.[lang] || "";

                // Create short description based on expanded state
                const shortDescription =
                  descriptionLength > 30 && !isExpanded
                    ? descriptionText.slice(0, 30) + "..."
                    : descriptionText;

                return (
                  <div
                    className={`shrink-0 snap-start rounded-md p-[20px] md:min-w-[330px] max-w-[350px] min-h-[200px] flex flex-col ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    }`}
                    key={e.id}
                  >
                    <div className="flex items-center justify-between">
                      {e.image && (
                        <SafeImage
                          src={e.image}
                          alt={e.name?.[lang] || "vacancy"}
                          width={50}
                          height={50}
                          className="rounded"
                          style={{ width: "auto", height: "auto" }}
                        />
                      )}
                      <div className="flex flex-col gap-[8px]">
                        <h2 className="text-[18px] font-[500]">
                          {e.name?.[lang] || ""}
                        </h2>
                        <p
                          className={`${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          } font-[500]`}
                        >
                          {e.title?.[lang] || ""}
                        </p>
                      </div>
                    </div>

                    {/* Description with read more/back - Fixed container */}
                    <div className="mt-[10px] flex-1 overflow-hidden">
                      <div className="h-full">
                        <p className="normal-case break-words">
                          {shortDescription}
                          {descriptionLength > 30 && (
                            <button
                              className="text-[#00CED1] ml-[5px] underline focus:outline-none whitespace-nowrap"
                              onClick={() => handleToggleExpand(e.id)}
                            >
                              {isExpanded ? t("back") : t("readMore")}
                            </button>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {isAdmin && (
                        <>
                          <Button
                            className="p-1.5 bg-blue-500 text-white rounded-full cursor-pointer min-w-0 w-8 h-8"
                            onClick={() => {
                              const originalItem = vacancies?.find(
                                (v) => v.id === e.id
                              );
                              if (originalItem) openEdit(originalItem);
                            }}
                            sx={{
                              backgroundColor: "gray",
                              color: "white",
                              borderRadius: "50%",
                              minWidth: "32px",
                              padding: "6px",
                            }}
                          >
                            <Edit sx={{ fontSize: 18 }} />
                          </Button>
                          <Button
                            className="p-1.5 bg-red-500 text-white rounded-full cursor-pointer min-w-0 w-8 h-8"
                            onClick={() => openDelete(e.id)}
                            sx={{
                              backgroundColor: "red",
                              color: "white",
                              minWidth: "32px",
                              borderRadius: "50%",
                              padding: "6px",
                            }}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-[150px] max-lg:mb-[80px] max-sm:mb-[60px]">
          <h5 className="text-[55px] max-lg:text-[35px] max-sm:text-[28px] font-semibold text-center max-lg:mb-[20px]">
            {t("quest")}
          </h5>

          <div className="flex justify-end max-lg:justify-center max-sm:justify-center">
            {isAdmin && (
              <Button
                onClick={() => {
                  setFormDataQuestion(emptyFormQuestion);
                  setAddQModalOpen(true);
                }}
                className="bg-blue-500 items-center flex gap-2 p-2 px-5 font-bold text-white rounded-md cursor-pointer 
        max-md:px-4 max-md:py-2 max-md:text-[14px]"
                sx={{ backgroundColor: "blue", color: "white" }}
              >
                <PlusCircle size={18} /> {t("add")}
              </Button>
            )}
          </div>

          <div className="sm:mt-[30px] flex flex-col gap-[20px] max-lg:gap-[15px] max-sm:gap-[10px] max-lg:mt-[20px]">
            {answersFrontend?.map((e) => (
              <Accordion
                key={e.id}
                style={{
                  padding: "10px",
                  borderRadius: "15px",
                  background: theme === "dark" ? "#2D3748" : "#FFFFFF",
                  border:
                    theme === "dark"
                      ? "1px solid #4A5568"
                      : "1px solid #E2E8F0",
                }}
                className="max-md:p-[8px] max-sm:p-[5px]"
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      style={{
                        color: theme === "dark" ? "#FFFFFF" : "#000000",
                      }}
                    />
                  }
                  aria-controls={`panel-${e.id}-content`}
                  id={`panel-${e.id}-header`}
                >
                  <Typography
                    style={{
                      fontSize: "17px",
                      fontWeight: "bold",
                      color: theme === "dark" ? "#FFFFFF" : "#000000",
                    }}
                    className=" md:text-[10px] max-sm:text-[10px]"
                    component="span"
                  >
                    {e.question && e.question[lang] ? e.question[lang] : ""}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Typography
                    style={{
                      fontSize: "15px",
                      fontWeight: "400",
                      width: "90%",
                      color: theme === "dark" ? "#E2E8F0" : "#4A5568",
                    }}
                    className="max-md:text-[15px] max-sm:text-[14px] max-md:w-full"
                  >
                    {e.answer && e.answer[lang] ? e.answer[lang] : ""}
                  </Typography>
                </AccordionDetails>

                <div className="flex gap-4 items-center justify-end max-md:flex-col max-md:items-stretch max-md:gap-[10px] max-sm:gap-[8px]">
                  {isAdmin && (
                    <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4">
                      {/* Delete Button */}
                      <button
                        onClick={() => openDeleteQuestion(e.id)}
                        className="
        w-7 h-7 
        sm:w-8 sm:h-8 
        flex items-center justify-center 
        bg-red-500 hover:bg-red-600 
        text-white 
        rounded-full 
        transition-all duration-200 
        cursor-pointer 
        p-1.5
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1
      "
                        aria-label={t("delete") || "Delete"}
                        title={t("delete") || "Delete"}
                      >
                        <Delete
                          className="
          w-3.5 h-3.5 
          sm:w-4 sm:h-4
        "
                        />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          const originalItem = answer?.find(
                            (q) => q.id === e.id
                          );
                          if (originalItem) openEditQuestion(originalItem);
                        }}
                        className="
        w-7 h-7 
        sm:w-8 sm:h-8 
        flex items-center justify-center 
        bg-gray-500 hover:bg-gray-600 
        text-white 
        rounded-full 
        transition-all duration-200 
        cursor-pointer 
        p-1.5
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
      "
                        aria-label={t("edit") || "Edit"}
                        title={t("edit") || "Edit"}
                      >
                        <Edit
                          className="
          w-3.5 h-3.5 
          sm:w-4 sm:h-4
        "
                        />
                      </button>
                    </div>
                  )}
                </div>
              </Accordion>
            ))}
          </div>
        </div>

        <div
          className={`mt-[50px] h-[600px] bg-linear-to-r from-[#40E0D0] to-[#00CED1] rounded-md mb-[70px] 
  flex items-center justify-around relative box 
  ${theme === "dark" ? "border border-gray-700" : "border border-gray-200"} 
  max-lg:flex-col max-lg:h-auto max-md:p-5 max-lg:p-10 max-lg:gap-8 max-lg:bg-linear-to-b`}
        >
          <div className="p-[25px] w-[650px] flex flex-col gap-[11px] box1 max-lg:w-full max-lg:p-[10px]">
            <h2 className="text-[60px] font-[400] leading-[60px] max-md:text-[28px] max-lg:text-[35px] max-lg:leading-tight ">
              {t("letDo")}
            </h2>

            <ul className="list-disc z-10 text-[20px] flex flex-col gap-[15px] p-[20px] max-md:text-[16px] max-lg:items-start max-lg:px-[25px]">
              <li className="w-[50%] max-lg:w-full">{t("englishVlad")}</li>
              <li>{t("opt")}</li>
              <li className="w-[50%] max-lg:w-full">{t("ready")}</li>
            </ul>

            <Image
              className="w-[450px] absolute left-[28%] top-[54%] max-lg:hidden"
              src="/imagesVacancy/bg2.png"
              alt="Vacancy"
              width={500}
              height={200}
            />
          </div>

          <div
            className={`p-[15px] w-[420px] rounded-md 
    ${theme === "dark" ? "bg-gray-800 border-[#00CED1]" : "bg-white"} 
    max-lg:w-full max-lg:p-[20px]`}
          >
            <form
              className="flex flex-col items-start gap-[15px] max-md:gap-[10px]"
              onSubmit={handleFormSubmit}
            >
              <input
                required
                name="name"
                value={formVacancyData.name}
                onChange={handleFormChange}
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-2 border-[#00CED1]"
                    : "bg-gray-100 text-black border-none"
                } 
    font-[500] rounded-md w-full p-[15px] 
    outline-none max-md:p-[12px] max-md:text-[14px]`}
                type="text"
                placeholder={t("name")}
              />
              <input
                required
                name="surname"
                value={formVacancyData.surname}
                onChange={handleFormChange}
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-2 border-[#00CED1]"
                    : "bg-gray-100 text-black border-none"
                } 
    font-[500] rounded-md w-full p-[15px] 
    outline-none max-md:p-[12px] max-md:text-[14px]`}
                type="text"
                placeholder={t("sureName")}
              />
              <input
                required
                name="email"
                value={formVacancyData.email}
                onChange={handleFormChange}
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-2 border-[#00CED1]"
                    : "bg-gray-100 text-black border-none"
                } 
    font-[500] rounded-md w-full p-[15px] 
    outline-none max-md:p-[12px] max-md:text-[14px]`}
                type="email"
                placeholder={t("email")}
              />
              <input
                required
                name="date_of_birth" // Changed to match backend
                value={formVacancyData.date}
                onChange={handleFormChange}
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-2 border-[#00CED1]"
                    : "bg-gray-100 text-black border-none"
                } 
    font-[500] rounded-md w-full p-[15px] 
    outline-none max-md:p-[12px] max-md:text-[14px]`}
                type="date"
                placeholder={t("date")}
              />
              <input
                required
                name="phonenumber" // Changed to match backend
                value={formVacancyData.phone}
                onChange={handleFormChange}
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-2 border-[#00CED1]"
                    : "bg-gray-100 text-black border-none"
                } 
    font-[500] rounded-md w-full p-[15px] 
    outline-none max-md:p-[12px] max-md:text-[14px]`}
                type="tel"
                placeholder="+992 00 000-00-00"
              />

              <div className="cursor-pointer w-full">
                <input
                  required
                  name="resumefile" // Changed to match backend
                  onChange={handleFormChange}
                  className="border p-2 w-full rounded-md"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                />
                {formVacancyData.resume && (
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    Selected file: {formVacancyData.resume.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={`bg-[#40E0D0] text-white py-[10px] cursor-pointer rounded-md font-[500] w-[95%] m-auto 
    ${theme === "dark" ? "border-double border-4 border-[#00CED1]" : ""} 
    hover:bg-[#00d196fe] max-md:w-full max-md:text-[15px]`}
              >
                {t("interview")}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Edit Vacancy Modal - CORRECTED */}
      <Dialog
        open={isEditModalOpen}
        onClose={closeEditModal}
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
                onClick={() => setActiveLang(lang)}
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
            onChange={(e) => handleChange(e, activeLang, "name")}
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
            onChange={(e) => handleChange(e, activeLang, "title")}
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
            onChange={(e) => handleChange(e, activeLang, "description")}
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
              onChange={handleFileUpload}
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

          {(selectedImage || formData.image) && (
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
                src={selectedImage || formData.image}
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
              onClick={closeEditModal}
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
              onClick={handleEdit}
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
      {/* Add Vacancy Modal - Mobile Responsive */}
      <Dialog
        open={isAddModalOpen}
        onClose={closeAddModal}
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
          {t("addVacancy")}
        </DialogTitle>

        <DialogContent
          sx={{
            mt: 2,
            px: { xs: 2, sm: 3 },
            pb: 2,
            "& .MuiTextField-root": {
              mb: { xs: 1, sm: 2 },
            },
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
                onClick={() => setActiveLang(lang)}
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
            label={`${t("name")} (${activeLang.toUpperCase()})`}
            value={formData.name[activeLang]}
            onChange={(e) => handleChange(e, activeLang, "name")}
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
            onChange={(e) => handleChange(e, activeLang, "title")}
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
            onChange={(e) => handleChange(e, activeLang, "description")}
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
              onChange={handleFileUpload}
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

          {selectedImage && (
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
                src={selectedImage}
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

        <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
          <div className="w-full flex justify-between gap-2">
            <Button
              startIcon={<X sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              onClick={closeAddModal}
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
              onClick={handleAdd}
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
      {/* Question modals - Mobile Responsive */}
      <Dialog
        open={isEditModalOpenQuestion}
        onClose={closeEditQuestionModal}
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
          {t("editQuestion")}
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
                onClick={() => setActiveLang(lang)}
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
            value={formDataQuestion?.question?.[activeLang] || ""}
            onChange={(e) => handleChangeQuestion(e, activeLang, "question")}
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
            value={formDataQuestion?.answer?.[activeLang] || ""}
            onChange={(e) => handleChangeQuestion(e, activeLang, "answer")}
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
              onClick={closeEditQuestionModal}
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
              onClick={handleEditQuestion}
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
      <Dialog
        open={isAddQModalOpen}
        onClose={closeAddQModal}
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
                onClick={() => setActiveLang(lang)}
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
            value={formDataQuestion?.question?.[activeLang] || ""}
            onChange={(e) => handleChangeQuestion(e, activeLang, "question")}
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
            value={formDataQuestion?.answer?.[activeLang] || ""}
            onChange={(e) => handleChangeQuestion(e, activeLang, "answer")}
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
              onClick={closeAddQModal}
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
              onClick={handleAddQuestion}
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
      </Dialog>{" "}
      {/* Delete modals remain the same */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme === "dark" ? "#1e293b" : "white",
          },
        }}
      >
        <DialogTitle sx={{ color: theme === "dark" ? "white" : "black" }}>
          {t("confirmDelete")}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme === "dark" ? "#e2e8f0" : "#4a5568" }}>
            {t("ansDelete")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <div className="w-[100%] flex justify-between">
            <Button
              onClick={() => setDeleteModalOpen(false)}
              variant="outlined"
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              {t("delete")}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isDeleteQuestionModalOpen}
        onClose={() => setDeleteQuestionModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme === "dark" ? "#1e293b" : "white",
          },
        }}
      >
        <DialogTitle sx={{ color: theme === "dark" ? "white" : "black" }}>
          {t("confirmDelete")}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme === "dark" ? "#e2e8f0" : "#4a5568" }}>
            {t("questDelete")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <div className="w-[100%] flex justify-between">
            <Button
              onClick={() => setDeleteQuestionModalOpen(false)}
              variant="outlined"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleDeleteQuestion}
              variant="contained"
              color="error"
            >
              {t("delete")}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Vacancy;
