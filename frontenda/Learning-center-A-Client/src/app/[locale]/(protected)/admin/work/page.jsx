"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  Download,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslations } from "next-intl";
import {
  useGetVacancyWorkQuery,
  useDeleteVacancyWorkMutation,
} from "@/store/slices/vacancyWorksApi";
import Loading from "@/components/loading/loading";

const Resume = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("resume");

  // API hooks
  const { data: resumes, isLoading, error, refetch } = useGetVacancyWorkQuery();

  const [deleteResume, { isLoading: isDeleting, error: deleteError }] =
    useDeleteVacancyWorkMutation();

  // State management
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
    if (deleteError) console.error("Delete error:", deleteError);
  }, [deleteError]);

  if (!mounted) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    let title = "";
    if (!isOnline) {
      title = t("noInternet");
    } else {
      title = t("serverError");
    }

    const serverMessage =
      error?.data?.detail ||
      error?.data?.message ||
      error?.message ||
      t("unknownError");

    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center text-center text-red-600 gap-2">
          <div className="text-3xl">⚠️</div>
          <p className="text-xl font-semibold">{title}</p>
          <p className="text-sm text-red-500 max-w-xs">{serverMessage}</p>
          <p className="text-xs text-gray-500 mt-2">
            {t("errorCode")}: {error.status || t("noData")}
          </p>
        </div>
      </div>
    );
  }

  // Filter resumes based on search term
  const filteredResumes =
    resumes?.filter((resume) => {
      if (!resume) return false;

      const searchLower = searchTerm.toLowerCase();
      return (
        resume?.name?.toLowerCase().includes(searchLower) ||
        resume?.surname?.toLowerCase().includes(searchLower) ||
        resume?.email?.toLowerCase().includes(searchLower) ||
        resume?.phonenumber?.includes(searchTerm)
      );
    }) || [];

  // Open delete dialog
  const openDialog = (id) => {
    setSelectedId(id);
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const closeDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedId(null);
  };

  // Handle delete resume
  const handleDeleteResume = async (id) => {
    try {
      console.log("Deleting resume:", id);
      await deleteResume(id).unwrap();
      console.log("Delete success");
      refetch(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete resume:", error);
    }
  };

  // Handle download resume file
  const handleDownloadResume = (resumeUrl, fileName) => {
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = fileName || "resume.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Loading />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <User className="w-6 h-6" />
            {t("resumes") || "Submitted Resumes"}
          </h1>
          <p
            className={`${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } mt-1`}
          >
            {t("resumesDescription") || "Manage and view all submitted resumes"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-4 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("totalResumes") || "Total Resumes"}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {resumes?.length || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div
            className={`${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-xl p-4 border`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {t("thisMonth") || "This Month"}
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {resumes?.filter((r) => {
                    const resumeDate = new Date(r.created_at);
                    const now = new Date();
                    return (
                      resumeDate.getMonth() === now.getMonth() &&
                      resumeDate.getFullYear() === now.getFullYear()
                    );
                  }).length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div
        className={`${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } rounded-xl p-4 border`}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder={
                  t("searchResumes") || "Search by name, email or phone..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300 bg-white text-gray-900"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div
        className={`${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } rounded-xl border overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}
            >
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {t("applicant") || "Applicant"}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {t("contact") || "Contact"}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {t("resumeFile") || "Resume File"}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {t("dateOfBirth") || "Date of Birth"}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {t("submitted") || "Submitted"}
                </th>

                <th
                  className={`px-6 py-3 text-right text-xs font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  } uppercase tracking-wider`}
                >
                  {t("actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === "dark" ? "divide-gray-600" : "divide-gray-200"
              }`}
            >
              {filteredResumes.length > 0 ? (
                filteredResumes.map((resume) => (
                  <tr
                    key={resume.id}
                    className={`${
                      theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {resume.name} {resume.surname}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {resume.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <a
                            href={`mailto:${resume.email}`}
                            className="text-sm text-blue-500 hover:underline"
                          >
                            {resume.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{resume.phonenumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleDownloadResume(
                            resume.resumefile,
                            `resume_${resume.id}.pdf`
                          )
                        }
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download</span>
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                        {resume.resumefile?.split("/").pop()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {formatDate(resume.date_of_birth)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(resume.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(resume.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDialog(resume.id)}
                          disabled={isDeleting}
                          className={`p-2 text-red-600 ${
                            theme === "dark"
                              ? "hover:bg-red-900/30"
                              : "hover:bg-red-50"
                          } rounded-lg transition-colors ${
                            isDeleting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title={t("deleteResume") || "Delete Resume"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      } text-lg font-medium`}
                    >
                      {t("noResumesFound") || "No resumes found"}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {searchTerm
                        ? t("adjustFiltersMessage") ||
                          "Try adjusting your search"
                        : t("noResumes") ||
                          "No resumes have been submitted yet"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={closeDialog}>
        <DialogTitle>{t("deleteResume") || "Delete Resume"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("confirmDeleteResume") ||
              "Are you sure you want to delete this resume? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{t("cancel") || "Cancel"}</Button>
          <Button
            onClick={async () => {
              await handleDeleteResume(selectedId);
              closeDialog();
            }}
            color="error"
            autoFocus
          >
            {t("delete") || "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Resume;
