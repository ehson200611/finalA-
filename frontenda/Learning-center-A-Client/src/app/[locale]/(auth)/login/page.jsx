"use client";
import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLoginMutation } from "@/store/slices/auth";
import toast, { Toaster } from "react-hot-toast";
import { useTranslations } from "next-intl";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("login");

  const router = useRouter();
  const { theme } = useTheme();

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber.trim() || !password.trim()) {
      toast.error(t("fill"));
      return;
    }

    try {
      const res = await login({
        phoneNumber: phoneNumber.trim(),
        password,
      }).unwrap();

      // сохраняем токены
      localStorage.setItem("token", res.access);

      toast.success("Login successful!");

      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      toast.error(err?.detail || t("loginFailed"));
    }
  };

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      className={`p-10  min-h-[80vh] flex items-center justify-center transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster />

      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl p-8 transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-3xl font-bold text-center mb-6">{t("login")}</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium">
              {t("phoneNumber")}
            </label>
            <input
              type="text"
              placeholder="992987654321"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              {t("password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold rounded-xl bg-indigo-600 text-white"
          >
            {isLoading ? t("loginIn") : t("login")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          {t("haveNotAccount")}
          <Link href="/register" className="text-indigo-600 ml-1">
            {t("register")}
          </Link>
        </p>
        <p className=" text-center text-sm">
          <Link href="/forgot" className="text-indigo-600 ml-1">
            Забыл пароль
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
