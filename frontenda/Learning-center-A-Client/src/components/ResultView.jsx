"use client";

import { useMemo } from "react";
import { CheckCircle, XCircle, Percent, ArrowLeftCircle } from "lucide-react";
import { useTheme } from "next-themes";

export default function ResultView({
  answers = [],
  questions = [],
  resultPayload = null,
  onBack,
  meProfile,
}) {
  const { theme } = useTheme();

  if (!questions?.length) return null;

  const { correct, incorrect, percent } = useMemo(() => {
    const c = (answers || []).reduce((acc, ans, i) => {
      return ans === questions[i]?.correctAnswer ? acc + 1 : acc;
    }, 0);

    const total = questions.length;
    return {
      correct: c,
      incorrect: total - c,
      percent: Math.round((c / total) * 100),
    };
  }, [answers, questions]);

  return (
    <div
      className={`lg:min-h-screen h-auto ${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      }`}
    >
      <div
        className={`rounded-lg shadow-xl p-4 sm:p-8 border backdrop-blur-md
          ${
            theme === "dark"
              ? "bg-white/10 border-white/10"
              : "bg-white border-gray-200"
          } max-w-2xl mx-auto`}
      >
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          Результаты теста
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4 overflow-hidden mb-6">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-green-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 lg:gap-4 gap-2 text-center mb-6 text-black">
          <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900">
            <CheckCircle className="mx-auto text-green-600 dark:text-green-300 w-6 h-6" />
            <p className="font-bold mt-1">{correct}</p>
            <p className="text-[10px] font-medium lg:text-sm opacity-80">
              Правильно
            </p>
          </div>

          <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900">
            <XCircle className="mx-auto text-red-600 dark:text-red-300 w-6 h-6" />
            <p className="font-bold mt-1">{incorrect}</p>
            <p className="text-[10px] font-medium lg:text-sm opacity-80">
              Неправильно
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900">
            <Percent className="mx-auto text-blue-600 dark:text-blue-300 w-6 h-6" />
            <p className="font-bold mt-1">{percent}%</p>
            <p className="text-[10px] font-medium lg:text-sm opacity-80">
              Результат
            </p>
          </div>
        </div>

        {/* Server Info */}
        {resultPayload && (
          <div
            className={`rounded-xl p-4 text-sm mb-6 ${
              theme === "dark"
                ? "bg-white/5 border border-white/10"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <h3 className="font-bold text-lg mb-3">Вопросы и ответы</h3>

            <div className="space-y-4">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? "border-green-400 bg-green-50 dark:bg-green-900/30"
                        : "border-red-400 bg-red-50 dark:bg-red-900/30"
                    }`}
                  >
                    <p className="font-medium text-base">
                      {i + 1}. {q.question}
                    </p>

                    <p className="mt-1">
                      <b>Ваш ответ:</b>{" "}
                      <span
                        className={
                          isCorrect ? "text-green-600" : "text-red-600"
                        }
                      >
                        {q.options[userAnswer] || "—"}
                      </span>
                    </p>

                    {!isCorrect && (
                      <p className="mt-1">
                        <b>Правильный:</b>{" "}
                        <span className="text-green-600">
                          {q.options[q.correctAnswer]}
                        </span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-blue-700 hover:opacity-90 transition text-white font-semibold flex justify-center items-center gap-2"
        >
          <ArrowLeftCircle className="w-5 h-5" />
          Завершить
        </button>
      </div>
    </div>
  );
}
