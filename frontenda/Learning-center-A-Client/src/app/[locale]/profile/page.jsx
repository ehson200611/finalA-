"use client";
import React, { useEffect, useState } from "react";
import { useGetBooksQuery } from "@/store/slices/booksApi";
import { useTheme } from "next-themes";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { redirect } from "next/navigation";


import Errors from "@/components/error/errors";
import Loading from "@/components/loading/loading";

const page = () => {
  const { data: meProfile, refetch, error } = useGetMeProfileQuery();
  useEffect(() => {
    refetch();
  }, []);

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const { data: books, isLoading } = useGetBooksQuery();

  const [openLevel, setOpenLevel] = useState(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Формируем уровни с данными о тестах
  const levels = [
    { level: "A1" },
    { level: "A2" },
    { level: "B1" },
    { level: "B2" },
    { level: "C1" },
    { level: "C2" },
  ].map((lvl) => {
    const test = meProfile?.tests?.find((t) => t.level === lvl.level);
    return {
      ...lvl,
      completed: !!test,
      score: test ? `${test.score}%` : "0%",
      test,
    };
  });

  function logOut() {
    localStorage.removeItem("token");
    refetch()
    redirect("/login");
  }

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
        isDarkMode ? "bg-[#02202B] text-white" : "bg-[#F5F7FA] text-black"
      } min-h-screen transition-colors duration-400`}
    >
      <div className="max-w-6xl mx-auto p-5 lg:p-10">
        {/* Profile Card */}
        <div className={`rounded-2xl shadow-xl p-8 mb-6`}>
          <div className="relative">
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3`}
            >
              {meProfile?.user_name || "-"}
            </h1>
            <span className={`text-sm text-blue-800 font-semibold`}>
              {meProfile?.phone || "-"}
            </span>
            <p className="">
              {meProfile?.is_pdf ? "Книги доступно" : "Книги недоступно"}
            </p>

            <button
              onClick={() => logOut()}
              className={`absolute top-0 right-0 sm:w-auto py-2 px-6 sm:px-8 cursor-pointer font-semibold rounded-md text-sm sm:text-base transition-colors duration-200 ${
                isDarkMode
                  ? "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                  : "bg-yellow-400 hover:bg-yellow-500"
              }`}
            >
              Выйти
            </button>
          </div>
        </div>

        {/* LEVELS */}
        <div className="rounded-2xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            {levels.map((item, index) => (
              <div
                key={item.level}
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setOpenLevel(openLevel === item.level ? null : item.level)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        item.completed
                          ? "bg-green-500 text-white"
                          : isDarkMode
                          ? "bg-gray-600 text-gray-300"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div
                        className={`font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        Уровень {item.level}
                      </div>
                      <div
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {item.completed ? "Завершено" : "Ожидается"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.completed
                          ? isDarkMode
                            ? "bg-green-900/30 text-green-400"
                            : "bg-green-100 text-green-800"
                          : isDarkMode
                          ? "bg-gray-900 text-gray-400"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.score}
                    </div>
                    {openLevel === item.level ? (
                      <ArrowUpCircle />
                    ) : (
                      <ArrowDownCircle />
                    )}
                  </div>
                </div>

                {/* Questions & Answers */}
                {openLevel === item.level && item.test && (
                  <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm space-y-2">
                    {item.test.answers &&
                      Object.entries(item.test.answers).map(([id, obj]) => {
                        const isTrue = obj.isTrue;

                        return (
                          <div
                            key={id}
                            className={`border-b pb-2 ${
                              isTrue
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            <p>
                              <b>Вопрос:</b> {obj.question}
                            </p>
                            <p>
                              <b>Ответ:</b> {obj.answer || "—"}
                            </p>

                            {/* Можно добавить отображение правильности */}
                            <p className="text-xs opacity-70">
                              {isTrue ? "Правильно" : "Неправильно"}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOOKS */}
        {meProfile?.is_pdf && (
          <div className="rounded-2xl shadow-xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Мои книги</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {books?.map((e) => (
                <div
                  key={e.id}
                  className="flex justify-between items-center p-4 mb-2 border rounded-lg cursor-pointer hover:bg-blue-200"
                  onClick={() =>
                    window.open(
                      `/api/pdf?url=${encodeURIComponent(e.pdf)}#toolbar=0`,
                      "_blank"
                    )
                  }
                >
                  {e.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
