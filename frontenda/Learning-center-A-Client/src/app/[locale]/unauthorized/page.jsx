"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans min-h-[70vh] transition-colors duration-400 flex flex-col items-center justify-center`}
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md">
        <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
          Нет доступа
        </p>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          У вас нет прав для просмотра этой страницы.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            Назад
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}
