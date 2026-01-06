"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { useSendSmsMutation, useRegisterMutation } from "@/store/slices/auth";

export default function Register() {
  const { theme } = useTheme();
  const t = useTranslations("register");

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    code: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0);
  const [sendSms] = useSendSmsMutation();
  const [registerUser] = useRegisterMutation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Таймер повторной отправки SMS
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Валидация номера телефона
  const validatePhone = (phone) => /^[0-9]{9,12}$/.test(phone);

  // === 1. SEND SMS ===
  const sendSmsCode = async () => {
    if (!form.name) {
      setStatus("❌ Введите имя");
      return;
    }

    if (!validatePhone(form.phoneNumber)) {
      setStatus(`❌ ${t("invalidPhone")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await sendSms({
        phoneNumber: form.phoneNumber,
        purpose: "register",
      }).unwrap();

      if (res.message) {
        setStatus(`✅ ${t("smsSent")}`);
        setStep(2);
        setTimer(60);
      } else {
        setStatus(`❌ ${t("serverError")}`);
      }
    } catch {
      setStatus(`❌ ${t("serverUnavailable")}`);
    } finally {
      setLoading(false);
    }
  };

  // === 2. REGISTER ===
  const finishRegister = async () => {
    if (!form.code || !form.password) {
      setStatus(`❌ ${t("fillAll")}`);
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        phone: form.phoneNumber,
        code: form.code,
        password: form.password,
        name: form.name, // 👈 ДОБАВИЛ ИМЯ
      }).unwrap();

      if (res?.message || res?.success) {
        setStatus(`✅ ${t("success")}`);
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setStatus(`❌ ${t("invalidCode")}`);
      }
    } catch {
      setStatus(`❌ ${t("checkCode")}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center p-10 min-h-[80vh] ${
        theme === "dark" ? "bg-[#02202B] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-[#033544]" : "bg-white"
        }`}
      >
        {/* Back Button */}
        {step === 2 && (
          <button
            onClick={() => {
              setStatus("");
              setStep(1);
            }}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" /> {t("back")}
          </button>
        )}
        <h2 className="text-center text-2xl font-bold mb-6">{t("title")}</h2>
        {/* === STEP 1 === */}
        {step === 1 && (
          <>
            {/* NAME */}
            <input
              name="name"
              placeholder={t("namePlaceholder")}
              value={form.name}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border mb-3 bg-transparent ${
                theme === "dark"
                  ? "border-gray-600 text-white"
                  : "border-gray-300 text-black"
              }`}
            />

            {/* PHONE */}
            <input
              name="phoneNumber"
              placeholder={t("phonePlaceholder")}
              value={form.phoneNumber}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border mb-3 bg-transparent ${
                theme === "dark"
                  ? "border-gray-600 text-white"
                  : "border-gray-300 text-black"
              }`}
            />

            <button
              onClick={sendSmsCode}
              disabled={loading || timer > 0}
              className={`w-full p-3 rounded-lg mt-2 text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? t("loading")
                : timer > 0
                ? `${t("resendIn")} ${timer}s`
                : t("sendSms")}
            </button>

            <p className="mt-6 text-center text-sm">
              {t("haveAccount")}{" "}
              <Link href="/login" className="text-indigo-600 ml-1">
                {t("login")}
              </Link>
            </p>
          </>
        )}
        {/* === STEP 2 === */}
        {step === 2 && (
          <>
            <input
              name="code"
              placeholder={t("codePlaceholder")}
              value={form.code}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border mb-3 bg-transparent ${
                theme === "dark"
                  ? "border-gray-600 text-white"
                  : "border-gray-300 text-black"
              }`}
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                value={form.password}
                onChange={handleChange}
                className={`w-full p-3 rounded-lg border mb-3 bg-transparent ${
                  theme === "dark"
                    ? "border-gray-600 text-white"
                    : "border-gray-300 text-black"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              onClick={finishRegister}
              disabled={loading}
              className={`w-full p-3 rounded-lg mt-2 text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? t("loading") : t("register")}
            </button>
          </>
        )}

        <p className="text-center mt-4">{status}</p>
      </div>
    </div>
  );
}
