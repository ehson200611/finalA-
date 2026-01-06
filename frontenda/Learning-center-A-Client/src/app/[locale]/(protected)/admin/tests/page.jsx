"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  BookOpen,
  Calendar,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useGetTestAdminQuery } from "@/store/slices/testAdminApi";
import { useTranslations } from "next-intl";
import Loading from "@/components/loading/loading";

const Tests = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState("")
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const t = useTranslations("test");
  const [openTest, setOpenTest] = useState(null); // Changed to track open test by ID

  const {
    data: tests = [],
    isLoading,
    error,
    refetch,
  } = useGetTestAdminQuery();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    // 1. Проверяем интернет
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // 2. Определяем тип ошибки
    let title = "";
    if (!isOnline) {
      title = t("noINternet");
    } else {
      title = t("server");
    }

    // 3. Получаем сообщение сервера если есть
    const serverMessage =
      error?.data?.detail ||
      error?.data?.message ||
      error?.message ||
      t("notFoundError");

    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center text-center text-red-600 gap-2">
          <div className="text-3xl">⚠️</div>

          {/* Заголовок */}
          <p className="text-xl font-semibold">{title}</p>

          {/* Сообщение сервера */}
          <p className="text-sm text-red-500 max-w-xs">{serverMessage}</p>

          {/* Сообщение браузера (для дебага) */}
          <p className="text-xs text-gray-500 mt-2">
            {t("errorCode")}: {error.status || t("noData")}
          </p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Ensure filteredTests is always an array
  // Determine which property has the array
  const testArray = tests?.testAdmin || tests?.data || [];

  const filteredTests = testArray.filter((test) => {
    const searchMatch = test?.userName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const levelMatch = levelFilter === "all" || test?.level === levelFilter;

    return searchMatch && levelMatch;
  });

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

   useEffect(() => {
      if (mounted && theme) {
        localStorage.setItem("theme", theme);
      }
    }, [theme, mounted]);


  const getLevelColor = (level) => {
    const colors = {
      A1: "bg-blue-500",
      A2: "bg-blue-600",
      B1: "bg-green-500",
      B2: "bg-green-600",
      C1: "bg-purple-500",
      C2: "bg-purple-600",
    };
    return colors[level] || "bg-gray-500";
  };

  // Toggle test details view
  const toggleTestDetails = (testId) => {
    setOpenTest(openTest === testId ? null : testId);
  };

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <BookOpen className="w-6 h-6" />
            {t("testRes")}
          </h1>
          <p
            className={`mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("veiwTest")}
          </p>
        </div>
      </div>

      <div
        className={`rounded-xl p-4 border ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
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
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">{t("allLevels")}</option>
              <option value="A1">Beginner (A1)</option>
              <option value="A2">Elementary (A2)</option>
              <option value="B1">Intermediate (B1)</option>
              <option value="B2">Upper Intermediate (B2)</option>
              <option value="C1">Advanced (C1)</option>
              <option value="C2">Proficiency (C2)</option>
            </select>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border overflow-hidden ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("level")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("testInformation")}
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("result")}
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("correct")}
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("wrong")}
                </th>
                <th
                  className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {t("action")}
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === "dark" ? "divide-gray-600" : "divide-gray-200"
              }`}
            >
              {/* ✅ FIXED: Now filteredTests is guaranteed to be an array */}
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => (
                  <React.Fragment key={test.id}>
                    <tr
                      className={`transition-colors ${
                        theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${getLevelColor(
                            test.level
                          )}`}
                        >
                          {test.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {test.userName}
                          </p>
                          {test.dateCompleted && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar
                                className={`w-3 h-3 ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              />
                              <span
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {t("completed")}:{" "}
                                {new Date(
                                  test.dateCompleted
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {test.status === "completed" ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p
                                  className={`text-2xl font-bold ${getScoreColor(
                                    test.score
                                  )}`}
                                >
                                  {test.score}%
                                </p>
                                <p
                                  className={`text-xs ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {t("finalScore")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {t("testYet")}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-1 justify-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span
                              className={`text-sm font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {test.correctAnswers}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span
                              className={`text-sm font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {test.incorrectAnswers}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleTestDetails(test.id)}
                            className={`p-2 rounded-lg flex items-center gap-1 ${
                              theme === "dark"
                                ? "text-blue-400 hover:bg-blue-900/30"
                                : "text-blue-600 hover:bg-blue-50"
                            } transition-colors`}
                            title={
                              openTest === test.id
                                ? "Hide test details"
                                : "View test details"
                            }
                          >
                            {openTest === test.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Test details section - appears below the row when opened */}
                    {openTest === test.id && (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <div
                            className={`mt-0 px-6 py-4 border-t ${
                              theme === "dark"
                                ? "bg-gray-900 border-gray-700 text-gray-300"
                                : "bg-gray-50 border-gray-200 text-gray-800"
                            }`}
                          >
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Test Details for {test.userName} - Level{" "}
                              {test.level}
                            </h3>

                            {/* Check if test has answers data */}
                            {test.answers &&
                            Object.keys(test.answers).length > 0 ? (
                              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {Object.entries(test.answers).map(
                                  ([questionId, answerData], index) => {
                                    const isCorrect = answerData.isTrue;

                                    return (
                                      <div
                                        key={questionId}
                                        className={`p-3 rounded border ${
                                          isCorrect
                                            ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                                            : "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                                        }`}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <p className="font-medium mb-1">
                                              Question {index + 1}:{" "}
                                              {answerData.question ||
                                                `Question ID: ${questionId}`}
                                            </p>
                                            <p className="text-sm">
                                              <span className="font-medium">
                                                Answer:
                                              </span>{" "}
                                              {answerData.answer || "—"}
                                            </p>
                                          </div>
                                          <span
                                            className={`text-xs font-medium px-2 py-1 rounded ${
                                              isCorrect
                                                ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40"
                                                : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40"
                                            }`}
                                          >
                                            {isCorrect
                                              ? "Correct"
                                              : "Incorrect"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <p className="text-gray-500 dark:text-gray-400">
                                  No detailed answer data available for this
                                  test.
                                </p>
                              </div>
                            )}

                            {/* Test summary */}
                            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Total Questions
                                </p>
                                <p className="text-lg font-semibold">
                                  {test.totalQuestions ||
                                    test.correctAnswers +
                                      test.incorrectAnswers ||
                                    0}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Accuracy
                                </p>
                                <p
                                  className={`text-lg font-semibold ${getScoreColor(
                                    test.score
                                  )}`}
                                >
                                  {test.score}%
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Completion Date
                                </p>
                                <p className="text-lg font-semibold">
                                  {test.dateCompleted
                                    ? new Date(
                                        test.dateCompleted
                                      ).toLocaleDateString()
                                    : "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p
                      className={`text-lg font-medium ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {t("testsNotFound")}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {searchTerm || levelFilter !== "all"
                        ? t("tryAgain")
                        : t("noTest")}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tests;
