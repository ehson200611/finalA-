"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import toast, { Toaster } from "react-hot-toast";
import { useAddNotificationMutation } from "@/store/slices/notificationAdminApi";
import { useSendSmsMutation } from "@/store/slices/auth";

const ConsultationModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const t = useTranslations("consultation");

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState(false);

  const [sendSmsMutation] = useSendSmsMutation();
  const [addNotification] = useAddNotificationMutation();

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setStatus("");
    setLoading(false);
    setName("");
    setPhone("");
    setCode("");
    setSentCode(false);
  };

  // === SEND SMS ===
  const sendSms = async () => {
    if (!name.trim() || !phone.trim()) {
      setStatus(t("enterNamePhone"));
      toast.error(t("enterNamePhone"));
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      await sendSmsMutation({
        phoneNumber: phone,
        purpose: "notification",
      }).unwrap();

      setSentCode(true);
      setStep(2);
      setStatus(t("smsSent"));
      toast.success(t("smsSent"));
    } catch (err) {
      setStatus(t("smsError"));
      toast.error(t("smsError"));
    } finally {
      setLoading(false);
    }
  };

  // === VERIFY CODE & CREATE NOTIFICATION ===
  const verifyCode = async () => {
    if (!code.trim()) {
      setStatus(t("enterCode"));
      toast.error(t("enterCode"));
      return;
    }

    setLoading(true);
    try {
      await addNotification({
        name,
        title: phone,
        type: "success",
        code,
        status: "unread",
      }).unwrap();

      setStatus(t("notificationSent"));
      toast.success(t("notificationSent"));
      setStep(3);

      setTimeout(() => onClose(), 3000);
    } catch (err) {
      setStatus(t("notificationError"));
      toast.error(t("notificationError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className={`relative w-[90%] sm:w-[500px] p-6 rounded-xl shadow-xl ${
                theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-black"
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-center mb-3">
                {t("title")}
              </h2>
              <p className="text-center text-gray-500 mb-6">
                {t("description")}
              </p>

              {/* STEP 1: ENTER NAME & PHONE */}
              {step === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendSms();
                  }}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    placeholder={t("namePlaceholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full p-3 border rounded-lg bg-transparent placeholder-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder={t("phonePlaceholder")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="w-full p-3 border rounded-lg bg-transparent placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition disabled:opacity-50"
                  >
                    {loading ? t("sending") : t("sendCode")}
                  </button>
                </form>
              )}

              {/* STEP 2: ENTER SMS CODE */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <p className="text-center">{t("enterSms")}</p>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    className="w-full p-3 border rounded-lg bg-transparent placeholder-gray-400"
                  />
                  <button
                    onClick={verifyCode}
                    disabled={loading || code.length < 4}
                    className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition disabled:opacity-50"
                  >
                    {loading ? t("loading") : t("confirmCode")}
                  </button>
                  <button
                    onClick={sendSms}
                    disabled={loading}
                    className="text-sm text-blue-500 hover:text-blue-600 underline self-center"
                  >
                    {t("resendCode")}
                  </button>
                </div>
              )}

              {/* STEP 3: SUCCESS MESSAGE */}
              {step === 3 && (
                <div className="text-center text-green-500 font-semibold">
                  {t("successMessage")}
                </div>
              )}

              {/* STATUS */}
              {status && (
                <p className={`mt-4 text-center text-sm text-green-500`}>
                  {status}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsultationModal;
