"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export default function QuestionList({
  questions = [],
  answers = [],
  onAnswer, // function(questionIndex, selectedIndex)
  onFinish, // function()
}) {
  const { theme } = useTheme();
  const t = useTranslations("questionList");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!questions || questions.length === 0)
    return <div className="p-6 text-center">{t("1")}</div>;

  const question = questions[currentQuestion];

  useEffect(() => {
    const saved = Array.isArray(answers) ? answers[currentQuestion] : undefined;
    if (typeof saved !== "undefined" && saved !== null) {
      setSelected(saved);
      setShowAnswer(true);
      setFeedback(saved === question.correctAnswer ? "correct" : "wrong");
    } else {
      setSelected(null);
      setShowAnswer(false);
      setFeedback("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, answers, question.id]);

  const handleSelect = (index) => {
    if (showAnswer) return;
    setSelected(index);
  };

  const handleAnswerClick = () => {
    if (selected === null) return;
    const isCorrect = selected === question.correctAnswer;
    setFeedback(isCorrect ? "correct" : "wrong");
    setShowAnswer(true);

    if (typeof onAnswer === "function") {
      try {
        onAnswer(currentQuestion, selected);
      } catch (err) {
        console.error("onAnswer error:", err);
      }
    }
  };

  const handleNext = () =>
    setCurrentQuestion((p) => Math.min(p + 1, questions.length - 1));

  const handlePrev = () => setCurrentQuestion((p) => Math.max(0, p - 1));

  const isLast = currentQuestion === questions.length - 1;

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } max-w-2xl mx-auto`}
    >
      <div
        className={`rounded-xl p-8 ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <p className="text-xl font-semibold mb-6">{question.question}</p>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                className={`    w-full flex items-center gap-4 px-5 py-3 rounded-lg border transition

    ${
      !showAnswer
        ? selected === i
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
          : "border-gray-300 bg-white dark:bg-gray-800"
        : i === question.correctAnswer
        ? "border-green-500 bg-green-50 dark:bg-green-900/30"
        : selected === i && selected !== question.correctAnswer
        ? "border-red-500 bg-red-50 dark:bg-red-900/30"
        : "border-gray-300 bg-white dark:bg-gray-800"
    }

    text-black dark:text-white
  `}
                aria-pressed={selected === i}
              >
                <div
                  className={`
      w-8 h-8 flex items-center justify-center rounded-full
      bg-gray-200 text-gray-700
      dark:bg-gray-700 dark:text-white
    `}
                >
                  {letter}
                </div>

                <span className="flex-1 text-left">{opt}</span>

                {showAnswer && i === question.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {showAnswer &&
                  i === selected &&
                  selected !== question.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="px-6 py-2 rounded-lg text-black bg-gray-300 cursor-pointer disabled:opacity-50"
          >
            {t("2")}
          </button>

          {!showAnswer ? (
            <button
              type="button"
              onClick={handleAnswerClick}
              disabled={selected === null}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white cursor-pointer disabled:opacity-50"
            >
              {t("3")}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNext}
                disabled={isLast}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white cursor-pointer disabled:hidden"
              >
                {t("4")}
              </button>
            </div>
          )}
        </div>
        {isLast ? (
          <button
            type="button"
            onClick={async () => {
              // Сохраняем текущий ответ (на всякий)
              if (typeof onAnswer === "function") {
                try {
                  onAnswer(currentQuestion, selected);
                } catch (err) {
                  console.error("onAnswer error:", err);
                }
              }
              // вызывать onFinish для отправки результата и показа ResultView
              if (typeof onFinish === "function") {
                await onFinish();
              }
            }}
            className="w-full my-3 gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white cursor-pointer"
          >
            Result
          </button>
        ) : null}

        {showAnswer && feedback && (
          <div
            className={`mt-4 p-3 rounded-lg text-center font-semibold ${
              feedback === "correct"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback === "correct" ? t("5") : t("6")}
          </div>
        )}

        {showAnswer && question.explanation && (
          <div
            className={`mt-3 p-3 rounded-md text-sm ${
              theme === "dark"
                ? "bg-gray-800 text-gray-200 border border-gray-700"
                : "bg-gray-50 text-gray-800 border border-gray-200"
            }`}
          >
            <div className="font-semibold mb-1">{t("7")}</div>
            <div>{question.explanation}</div>
          </div>
        )}
      </div>

      <div
        className={`text-center mt-4 ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {t("8", { current: currentQuestion + 1, total: questions.length })}
      </div>
    </div>
  );
}
