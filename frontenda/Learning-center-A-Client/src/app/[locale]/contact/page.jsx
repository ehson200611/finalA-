"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Trash2,
  Edit2,
  Plus,
  X,
  PlusCircle,
  MessageSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useGetContactsQuery,
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "@/store/slices/contactApi";
import Faq from "@/components/faq";
import SectionOne from "@/components/SectionOne";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// MUI Components
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
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import { useUser } from "@/hooks/useUser";
import Errors from "@/components/error/errors";
import Loading from "@/components/loading/loading";
import { useCreateFeedbackMutation } from "@/store/slices/feedbackApi";
import { Send } from "@mui/icons-material";
import toast, { Toaster } from "react-hot-toast";

export default function Contact() {
  const { theme } = useTheme();
  const t = useTranslations("contactPage");
  const [mounted, setMounted] = useState(false);

  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  const { data: locations = [], isLoading, error } = useGetContactsQuery();
  const [createFeedback, { isLoading: isSubmittingFeedback }] = useCreateFeedbackMutation();
  const [addContact] = useAddContactMutation();
  const [updateContact] = useUpdateContactMutation();
  const [deleteContact] = useDeleteContactMutation();

  const [modalType, setModalType] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    phone_number: "",
    text: "",
  });
  const [feedbackError, setFeedbackError] = useState("");
  const handleFeedbackSubmit = async (e) => {
  e.preventDefault();
  
  if (!feedbackForm.name.trim()) {
    setFeedbackError(t("nameRequired") || "Name is required");
    return;
  }
  if (!feedbackForm.phone_number.trim()) {
    setFeedbackError(t("phoneRequired") || "Phone number is required");
    return;
  }
  if (!feedbackForm.text.trim()) {
    setFeedbackError(t("feedbackRequired") || "Feedback text is required");
    return;
  }
  
  setFeedbackError("");
  
  try {
    const formData = new FormData();
    formData.append('name', feedbackForm.name);
    formData.append('phone_number', feedbackForm.phone_number);
    formData.append('text', feedbackForm.text);
    
    await createFeedback(formData).unwrap();
    
    setFeedbackForm({
      name: "",
      phone_number: "",
      text: "",
    });
    
    toast.success(t("feedbackSuccess") || "Feedback submitted successfully!");
    
    setTimeout(() => toast(""), 3000);
    
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    toast.error(
      t("feedbackError") || 
      "Failed to submit feedback. Please try again later."
    );
  }
};
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    address: "",
    phone: "",
    email: "",
    iframe: "",
    hours: "",
  });

  useEffect(() => setMounted(true), []);
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

  const openModal = (type, contact = null) => {
    setModalType(type);
    setSelectedContact(contact);
    if (type === "edit" && contact) {
      setFormData(contact);
    } else if (type === "add") {
      setFormData({
        name: "",
        title: "",
        address: "",
        phone: "",
        email: "",
        iframe: "",
        hours: "",
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedContact(null);
  };

  const handleAdd = async () => {
    await addContact(formData);
    closeModal();
  };

  const handleEdit = async () => {
    if (!selectedContact?.id) return;
    try {
      await updateContact({
        id: selectedContact.id,
        updatedContact: formData,
      }).unwrap();
      closeModal();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async () => {
    await deleteContact(selectedContact.id);
    closeModal();
  };

  const containerClass =
    theme === "dark"
      ? "bg-[#0a1a23] text-white"
      : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]";
  const cardClass =
    theme === "dark"
      ? "bg-[#112a36]/80 backdrop-blur-xl border border-gray-700"
      : "bg-white/60 backdrop-blur-xl border border-gray-200 shadow-lg";
  const infoText = theme === "dark" ? "text-gray-300" : "text-gray-600";

  if (isLoading) return <Loading />;

  return (
    <div className={`${containerClass} font-sans min-h-screen`}>
      <Toaster />
      <div className="lg:max-w-7xl lg:mx-auto md:mx-5 py-5">
        <SectionOne
          title={t("branches")}
          description={t("branchesDescription")}
        />

        {isAdmin && (
          <div className="flex justify-center m-10 max-w-[1400px] mx-auto">
            <Button
              onClick={() => openModal("add")}
              className="flex items-center gap-2 px-6 py-2 rounded-xl"
              sx={{ backgroundColor: "blue", color: "white" }}
            >
              <PlusCircle size={18} /> {t("addAdress")}
            </Button>
          </div>
        )}

        <section className="px-3 lg:px-[10%] flex flex-col gap-16 pb-24 max-w-[1400px] mx-auto mt-10">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className={`group flex flex-col lg:flex-row gap-10 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(52,211,214,0.2)] ${cardClass}`}
            >
              <div className="lg:w-1/2 p-8 flex flex-col justify-between">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{loc.name}</h2>
                    <p className="text-sm md:text-base text-gray-400">
                      {loc.title}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal("edit", loc)}
                        className=" bg-gray-400 w-8 h-8 rounded-full text-white hover:bg-gray-500 transition flex items-center justify-center"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => openModal("delete", loc)}
                        className=" bg-red-600 text-white w-8 h-8 rounded-full hover:bg-red-700 transition flex items-center justify-center"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  )}
                </div>

                {[MapPin, Phone, Mail, Clock].map((Icon, i) => {
                  const labels = [
                    t("address"),
                    t("phone"),
                    t("email"),
                    t("hourWork"),
                  ];
                  const values = [loc.address, loc.phone, loc.email, loc.hours];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-4 rounded-2xl bg-opacity-5 transition-all duration-300 hover:bg-opacity-10 ${
                        theme === "dark"
                          ? "hover:bg-gray-700/40"
                          : "hover:bg-white/70"
                      }`}
                    >
                      <div className="p-3 bg-linear-to-tr from-[#34d3d6] to-[#216f6f] rounded-xl shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">
                          {labels[i]}
                        </p>
                        <p className={`text-sm ${infoText}`}>{values[i]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:w-1/2 relative overflow-hidden shadow-md">
                <iframe
                  src={loc.iframe}
                  className="w-full h-[400px] lg:h-full"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
                  📍 {loc.address}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* MUI Add/Edit Modal */}
        <Dialog
          open={modalType === "add" || modalType === "edit"}
          onClose={closeModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: theme === "dark" ? "#1e293b" : "white",
              color: theme === "dark" ? "white" : "black",
              borderRadius: 3,
              boxShadow:
                theme === "dark"
                  ? "0 4px 20px rgba(0,0,0,0.5)"
                  : "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: theme === "dark" ? "#0f172a" : "#f8fafc",
              borderBottom: `1px solid ${
                theme === "dark" ? "#334155" : "#e2e8f0"
              }`,
            }}
          >
            <Plus sx={{ color: "#34d3d6" }} />
            {modalType === "add" ? t("addNewAddress") : t("editAddress")}
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              {Object.keys(formData)
                .filter((key) => key !== "id")
                .map((key) => (
                  <TextField
                    key={key}
                    fullWidth
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: theme === "dark" ? "white" : "black",
                        "& fieldset": {
                          borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
                        },
                        "&:hover fieldset": {
                          borderColor: "#34d3d6",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: theme === "dark" ? "#94a3b8" : "#64748b",
                      },
                    }}
                  />
                ))}
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              bgcolor: theme === "dark" ? "#0f172a" : "#f8fafc",
              borderTop: `1px solid ${
                theme === "dark" ? "#334155" : "#e2e8f0"
              }`,
            }}
          >
            <Button onClick={closeModal} variant="outlined">
              {t("cancel")}
            </Button>
            <Button
              onClick={modalType === "add" ? handleAdd : handleEdit}
              variant="contained"
            >
              {modalType === "add" ? t("add") : t("save")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* MUI Delete Confirmation Modal */}
        <Dialog
          open={modalType === "delete"}
          onClose={closeModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: theme === "dark" ? "#1e293b" : "white",
              color: theme === "dark" ? "white" : "black",
              borderRadius: 3,
              boxShadow:
                theme === "dark"
                  ? "0 4px 20px rgba(0,0,0,0.5)"
                  : "0 4px 20px rgba(0,0,0,0.1)",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: theme === "dark" ? "#0f172a" : "#f8fafc",
              borderBottom: `1px solid ${
                theme === "dark" ? "#334155" : "#e2e8f0"
              }`,
              color: theme === "dark" ? "#ef4444" : "#dc2626",
              fontWeight: "bold",
            }}
          >
            {t("confirmDelete")}
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t("branch")} "{selectedContact?.name}"? {t("undone")}
            </Alert>
            <Typography
              variant="body2"
              sx={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
            >
              {t("system")}
            </Typography>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              gap: 1,
              bgcolor: theme === "dark" ? "#0f172a" : "#f8fafc",
              borderTop: `1px solid ${
                theme === "dark" ? "#334155" : "#e2e8f0"
              }`,
            }}
          >
            <Button onClick={closeModal} variant="outlined">
              {t("cancel")}
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              {t("delete")}
            </Button>
          </DialogActions>
        </Dialog>

        <Faq />

        <div className="px-3 lg:px-[10%] max-w-[1400px] mx-auto mt-16 mb-24">
          <div
            className={`${cardClass} rounded-3xl overflow-hidden p-8 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(52,211,214,0.15)]`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-linear-to-tr from-[#34d3d6] to-[#216f6f] rounded-xl">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {t("sendFeedback") || "Send Your Feedback"}
                </h3>
                <p className={`text-sm ${infoText}`}>
                  {t("feedbackDescription") ||
                    "We value your opinion. Share your thoughts with us."}
                </p>
              </div>
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("yourName") || "Your Name"} *
                  </label>
                  <input
                    type="text"
                    value={feedbackForm.name}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === "dark"
                        ? "bg-[#1e293b] border-gray-700 text-white"
                        : "bg-white border-gray-300 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-[#34d3d6]`}
                    placeholder={t("enterName") || "Enter your name"}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("phoneNumber") || "Phone Number"} *
                  </label>
                  <input
                    type="tel"
                    value={feedbackForm.phone_number}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === "dark"
                        ? "bg-[#1e293b] border-gray-700 text-white"
                        : "bg-white border-gray-300 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-[#34d3d6]`}
                    placeholder={t("enterPhone") || "Enter your phone number"}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    {t("yourFeedback") || "Your Feedback"} *
                  </label>
                  <textarea
                    value={feedbackForm.text}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        text: e.target.value,
                      }))
                    }
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === "dark"
                        ? "bg-[#1e293b] border-gray-700 text-white"
                        : "bg-white border-gray-300 text-black"
                    } focus:outline-none focus:ring-2 focus:ring-[#34d3d6] resize-none`}
                    placeholder={
                      t("enterFeedback") || "Write your feedback here..."
                    }
                    required
                  />
                </div>
              </div>

              {feedbackError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                  {feedbackError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#34d3d6] to-[#216f6f] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("submitting") || "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t("sendFeedback") || "Send Feedback"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
