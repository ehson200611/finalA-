"use client";
import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "next-themes";
import {
  useGetFeedbacksQuery,
  useDeleteFeedbackMutation,
} from "@/store/slices/feedbackApi";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Loading from "@/components/loading/loading";
import { Search, MessageSquare, Phone, Calendar } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Feedback = () => {
  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  const { theme } = useTheme();
  const { data, isLoading, error } = useGetFeedbacksQuery();
  const [deleteFeedback] = useDeleteFeedbackMutation();

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("feedback");

  const handleOpenDelete = (feedback) => {
    setSelectedFeedback(feedback);
    setOpenDelete(true);
  };
  const handleConfirmDelete = async () => {
    try {
      await deleteFeedback(selectedFeedback.id).unwrap();
      setOpenDelete(false);
      toast.success(t("deleteSuccess") || "Feedback deleted successfully");
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      toast.error(
        t("deleteError") ||
          error?.data?.message ||
          "Failed to delete feedback. Please try again."
      );
    }
  };

  // Filter feedbacks based on search term
  const filteredFeedbacks = data?.filter(
    (feedback) =>
      feedback?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback?.phone_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      feedback?.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  if (error) return <p className="text-red-500">{t("failedLoadFeedbacks")}</p>;

  const isDark = theme === "dark";

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              } flex items-center gap-2`}
            >
              <MessageSquare className="w-6 h-6" />
              {t("reviews")}
            </h1>
            <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {t("manageAllFeedbacks") ||
                "Manage all customer feedback and reviews"}
            </p>
          </div>

          {/* Search */}
          <div
            className={`rounded-xl p-4 border transition-colors duration-200 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="relative md:max-w-md">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder={t("searchFeedbacks") || "Search feedbacks..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`md:w-[300px] w-[240px] pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    } transition-colors duration-200`}
                  >
                    {t("customer")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    } transition-colors duration-200`}
                  >
                    {t("phone")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    } transition-colors duration-200`}
                  >
                    {t("comment")}
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    } transition-colors duration-200`}
                  >
                    {t("date")}
                  </th>
                  {isAdmin && (
                    <th
                      className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      } transition-colors duration-200`}
                    >
                      {t("actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-gray-600" : "divide-gray-200"
                }`}
              >
                {filteredFeedbacks?.length > 0 ? (
                  filteredFeedbacks.map((item) => (
                    <tr
                      key={item.id}
                      className={`${
                        isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      } transition-colors duration-200`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {item.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-medium ${
                                isDark ? "text-white" : "text-gray-900"
                              } transition-colors duration-200`}
                            >
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone
                            className={`w-3 h-3 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            } transition-colors duration-200`}
                          />
                          <p
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            } transition-colors duration-200`}
                          >
                            {item.phone_number}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          } transition-colors duration-200`}
                        >
                          {item.text}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenDelete(item)}
                              className={`p-2 rounded-lg transition-colors duration-200 ${
                                isDark
                                  ? "text-red-400 hover:bg-red-900/30"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              title={t("deleteFeedback") || "Delete feedback"}
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 5 : 4}
                      className="px-6 py-24 text-center"
                    >
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p
                        className={`text-lg font-medium ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {searchTerm
                          ? t("noFeedbacksFound") || "No feedbacks found"
                          : t("noFeedbacks") || "No feedbacks yet"}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {searchTerm
                          ? t("tryAdjustingSearch") ||
                            "Try adjusting your search"
                          : t("noFeedbacksDescription") ||
                            "Customer feedbacks will appear here"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: isDark ? "#0a1a23" : "white",
            color: isDark ? "white" : "#101828",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDark ? "white" : "#101828",
            backgroundColor: isDark ? "#0a1a23" : "white",
            borderBottom: isDark ? "1px solid #1e3a4a" : "1px solid #e5e7eb",
            fontSize: "1.25rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DeleteIcon className="w-5 h-5 text-red-500" />
          {t("confirmDelete")}
        </DialogTitle>

        <DialogContent
          sx={{
            backgroundColor: isDark ? "#0a1a23" : "white",
            pt: 3,
          }}
        >
          <Box sx={{ pt: 1 }}>
            <Typography
              sx={{
                color: isDark ? "white" : "#101828",
                fontSize: "1rem",
                lineHeight: 1.5,
              }}
            >
              {t("deleteFeedbackMessage")}
            </Typography>

            {selectedFeedback && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.1)"
                    : "rgba(254, 226, 226, 0.5)",
                  border: isDark
                    ? "1px solid rgba(239, 68, 68, 0.3)"
                    : "1px solid rgba(254, 226, 226, 0.8)",
                }}
              >
                <Typography
                  sx={{
                    color: isDark ? "#ef4444" : "#dc2626",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {t("permanentlyRemoveFeedback") ||
                    "This action will permanently remove this feedback."}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            backgroundColor: isDark ? "#0a1a23" : "white",
            borderTop: isDark ? "1px solid #1e3a4a" : "1px solid #e5e7eb",
          }}
        >
          <Button
            onClick={() => setOpenDelete(false)}
            variant="outlined"
            sx={{
              color: isDark ? "#9ca3af" : "#6b7280",
              borderColor: isDark ? "#374151" : "#cbd5e1",
              "&:hover": {
                borderColor: isDark ? "#60a5fa" : "#3b82f6",
                backgroundColor: isDark
                  ? "rgba(96, 165, 250, 0.1)"
                  : "rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: "#ef4444",
              color: "white",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            {t("deleteText")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Feedback;
