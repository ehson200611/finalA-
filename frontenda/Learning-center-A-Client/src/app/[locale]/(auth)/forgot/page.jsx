"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSendSmsMutation,
} from "@/store/slices/auth";
import Link from "next/link";

export default function Forgot() {
  const { theme } = useTheme();
  const t = useTranslations("forgot");

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    phoneNumber: "",
    code: "",
    password: "",
    passwordConfirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [forgotPassword] = useForgotPasswordMutation();
  const [sendSms] = useSendSmsMutation();
  const [resetPassword] = useResetPasswordMutation();

  const sendCode = async () => {
    if (!form.phoneNumber) {
      setStatus("❌ Введите номер телефона");
      return;
    }

    try {
      await forgotPassword({
        phoneNumber: form.phoneNumber,
      }).unwrap();
    } catch (error) {
      setStatus("❌ Аккаунт не сушествует");
      return;
    }

    // Отправка SMS
    try {
      const res = await sendSms({
        phoneNumber: form.phoneNumber,
        purpose: "reset_password",
      }).unwrap();

      if (res.message) {
        setStatus("✅ Код отправлен");
        setStep(2);
      } else {
        setStatus("❌ Ошибка при отправке SMS");
      }
    } catch {
      setStatus("❌ Сервер недоступен");
    }
  };

  const resetPassword2 = async () => {
    if (form.password !== form.passwordConfirm) {
      setStatus("❌ Пароли не совпадают");
      return;
    }

    try {
      const res = await resetPassword({
        phoneNumber: form.phoneNumber,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        code: form.code, // <-- ОТРАВЛЯЕМ КОД ТУТ
      }).unwrap();

      if (res?.message) {
        setStatus("✅ Пароль обновлён!");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setStatus("❌ Неверный код или ошибка");
      }
    } catch {
      setStatus("❌Не правилный пароль или Повторите позже");
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
        {step > 1 && (
          <button
            onClick={() => {
              setStatus("");
              setStep((prev) => prev - 1);
            }}
            className={`flex items-center gap-2 mb-4 ${
              theme === "dark"
                ? "text-gray-200 hover:text-white"
                : "text-gray-700 hover:text-black"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
        )}

        <h2 className="text-center text-2xl font-bold mb-6">
          Восстановление пароля
        </h2>

        {step === 1 && (
          <>
            <input
              name="phoneNumber"
              placeholder="Номер телефона 987654321"
              value={form.phoneNumber}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border mb-3 bg-transparent ${
                theme === "dark"
                  ? "border-gray-600 text-white"
                  : "border-gray-300 text-black"
              }`}
            />

            <button
              onClick={sendCode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg mt-2"
            >
              Отправить код
            </button>

            <p className="mt-6 text-center text-sm">
              Уже есть аккаунт?
              <Link href="/login" className="text-indigo-600 ml-1">
                Войти
              </Link>
            </p>
            <p className=" text-center text-sm">
              Нет аккаунта?
              <Link href="/register" className="text-indigo-600 ml-1">
                Регистрация
              </Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <input
              name="code"
              placeholder="Введите код"
              value={form.code}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border mb-3 bg-transparent ${
                theme === "dark"
                  ? "border-gray-600 text-white"
                  : "border-gray-300 text-black"
              }`}
            />

            <button
              onClick={() => {
                if (!form.code) {
                  setStatus("❌ Введите код");
                  return;
                }
                setStep(3);
                setStatus("");
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg mt-2"
            >
              Продолжить
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Новый пароль"
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

            <div className="relative">
              <input
                name="passwordConfirm"
                type={showPassword2 ? "text" : "password"}
                placeholder="Повторите пароль"
                value={form.passwordConfirm}
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
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              onClick={resetPassword2}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg mt-2"
            >
              Обновить пароль
            </button>
          </>
        )}

        <p className="text-center mt-4">{status}</p>
      </div>
    </div>
  );
}
