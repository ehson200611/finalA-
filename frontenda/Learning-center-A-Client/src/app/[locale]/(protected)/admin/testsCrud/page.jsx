"use client";

import { useState } from "react";
import {
  useGetQuestionA1Query,
  useGetQuestionA2Query,
  useGetQuestionB1Query,
  useGetQuestionB2Query,
  useGetQuestionC1Query,
  useGetQuestionC2Query,
  useUpdateQuestionMutation,
} from "@/store/slices/testApi";
import toast, { Toaster } from "react-hot-toast";
import { Edit, Save, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import Loading from "@/components/loading/loading";
import { useTheme } from "next-themes";

export default function TestCrud() {
  const { theme } = useTheme();
  const [activeLevel, setActiveLevel] = useState("A1");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    question: "",
    options: [],
    correctAnswer: 0,
    explanation: "",
  });
  const t = useTranslations("testCrud");

  const dataA1 = useGetQuestionA1Query();
  const dataA2 = useGetQuestionA2Query();
  const dataB1 = useGetQuestionB1Query();
  const dataB2 = useGetQuestionB2Query();
  const dataC1 = useGetQuestionC1Query();
  const dataC2 = useGetQuestionC2Query();

  const queries = {
    A1: dataA1,
    A2: dataA2,
    B1: dataB1,
    B2: dataB2,
    C1: dataC1,
    C2: dataC2,
  };
  const { data, isLoading } = queries[activeLevel];

  const [updateQuestion] = useUpdateQuestionMutation();

  const handleEdit = (question) => {
    setEditingId(question.id);
    setFormData({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
    });
  };

  const handleSave = async (q) => {
    try {
      await updateQuestion({
        id: q.id,
        data: { level: q.level, ...formData },
      });
      setEditingId(null);
      toast.success(t("updateSox"));
    } catch {
      toast.error(t("errorSave"));
    }
  };

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

  return (
    <div className="space-y-6 p-4">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <BookOpen className="w-6 h-6" />
            {t("testManagement")} {activeLevel}
          </h1>
          <p
            className={`mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("editQuestions")}
          </p>
        </div>
      </div>

      {/* Level Selection Card */}
      <div
        className={`rounded-xl p-4 border ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Level Buttons */}
          <div className="flex flex-wrap gap-2">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeLevel === lvl
                    ? `${getLevelColor(lvl)} text-white shadow-lg scale-105`
                    : theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      ) : (
        <div
          className={`rounded-xl border overflow-hidden ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}
              >
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Вопрос
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Вопрос
                  </th>
                  <th
                    className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Правильно
                  </th>
                  <th
                    className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  theme === "dark" ? "divide-gray-600" : "divide-gray-200"
                }`}
              >
                {data?.map((q) => {
                  const isEdit = editingId === q.id;
                  return (
                    <tr
                      key={q.id}
                      className={`transition-colors ${
                        isEdit
                          ? theme === "dark"
                            ? "bg-yellow-900/20"
                            : "bg-yellow-50"
                          : theme === "dark"
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Первая колонка - Вопрос */}
                      <td className="px-6 py-4">
                        {isEdit ? (
                          <input
                            value={formData.question}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                question: e.target.value,
                              })
                            }
                            className={`w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                              theme === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300"
                            }`}
                          />
                        ) : (
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-900"
                            }`}
                          >
                            {q.question}
                          </p>
                        )}
                      </td>

                      {/* Вторая колонка - Варианты ответов с запятыми */}
                      <td className="px-6 py-4">
                        {isEdit ? (
                          <div className="space-y-2">
                            {formData.options.map((opt, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <input
                                  value={opt}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      options: formData.options.map((o, i) =>
                                        i === idx ? e.target.value : o
                                      ),
                                    })
                                  }
                                  className={`flex-1 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                    theme === "dark"
                                      ? "bg-gray-700 border-gray-600 text-white"
                                      : "bg-white border-gray-300"
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            {q.options.map((opt, idx) => (
                              <span key={idx}>
                                {opt}
                                {idx < q.options.length - 1 && ", "}
                              </span>
                            ))}
                          </p>
                        )}
                      </td>

                      {/* Третья колонка - Правильно */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {isEdit ? (
                            <input
                              type="number"
                              min="1"
                              max={formData.options.length}
                              value={formData.correctAnswer + 1}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  correctAnswer: Number(e.target.value) - 1,
                                })
                              }
                              className={`w-20 p-2 border text-center rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${
                                theme === "dark"
                                  ? "bg-gray-700 border-gray-600 text-white"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                          ) : (
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                                theme === "dark"
                                  ? "bg-green-900/30 text-green-400"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {q.correctAnswer + 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Четвертая колонка - Действия */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {isEdit ? (
                            <button
                              onClick={() => handleSave(q)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                            >
                              <Save size={16} />
                              <span className="text-sm">Save</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(q)}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                                theme === "dark"
                                  ? "bg-blue-900/30 text-blue-400 hover:bg-blue-800/30"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              <Edit size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
