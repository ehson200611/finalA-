"use client";

import { useEffect, useState, useRef } from "react";
import {
  useAddTestResultsMutation,
  useGetQuestionA1Query,
  useGetQuestionA2Query,
  useGetQuestionB1Query,
  useGetQuestionB2Query,
  useGetQuestionC1Query,
  useGetQuestionC2Query,
} from "@/store/slices/testApi";
import QuestionList from "@/components/QuestionList";
import ResultView from "@/components/ResultView";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@mui/material";
import { useGetMeProfileQuery } from "@/store/slices/profile";

export default function LevelPage() {
  const t = useTranslations("levelPage");
  const { level } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // запросы (как у тебя)
  const { data: questionsA1 } = useGetQuestionA1Query();
  const { data: questionsA2 } = useGetQuestionA2Query();
  const { data: questionsB1 } = useGetQuestionB1Query();
  const { data: questionsB2 } = useGetQuestionB2Query();
  const { data: questionsC1 } = useGetQuestionC1Query();
  const { data: questionsC2 } = useGetQuestionC2Query();
  const { data: meProfile } = useGetMeProfileQuery();
  const [addTestResults] = useAddTestResultsMutation();

  const questionsMap = {
    a1: questionsA1,
    a2: questionsA2,
    b1: questionsB1,
    b2: questionsB2,
    c1: questionsC1,
    c2: questionsC2,
  };

  const questionsLevel = questionsMap[level];

  const [userAnswers, setUserAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [resultPayload, setResultPayload] = useState(null);
  const startTimeRef = useRef(
    typeof window !== "undefined" ? Date.now() : null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("testStartTime");
      localStorage.setItem("testStartTime", String(startTimeRef.current));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("answers", JSON.stringify(userAnswers));
    }
  }, [userAnswers]);

  const handleAnswer = (questionIndex, selectedAnswer) => {
    setUserAnswers((prev) => {
      const copy = Array.isArray(prev) ? [...prev] : [];
      copy[questionIndex] = selectedAnswer;
      return copy;
    });
  };

  // sendResult: собирает payload, POST на сервер, возвращает {ok, payload}
  const sendResult = async () => {
    if (!questionsLevel || !Array.isArray(questionsLevel)) {
      console.error("Questions for level not found");
      return { ok: false, error: "questions not found" };
    }

    const total = questionsLevel.length;

    // формируем объект answers по новому формату
    const answersObj = {};
    userAnswers.forEach((selectedIndex, i) => {
      const q = questionsLevel[i];
      if (!q) return;

      const userAnswer = q.options[selectedIndex] ?? null;
      const isTrue = selectedIndex === q.correctAnswer;

      answersObj[q.id] = {
        question: q.question,
        answer: userAnswer,
        isTrue,
      };
    });

    const correct = userAnswers.reduce((acc, ans, i) => {
      if (typeof ans === "number" && questionsLevel[i]) {
        return acc + (ans === questionsLevel[i].correctAnswer ? 1 : 0);
      }
      return acc;
    }, 0);

    const incorrect = total - correct;
    const score = total === 0 ? 0 : Math.round((correct / total) * 100);

    const payload = {
      level: level?.toUpperCase() || "UNKNOWN",
      totalQuestions: total,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      score,
      answers: answersObj,
      profile: meProfile?.id,
    };

    try {
      // отправка через RTK Query
      await addTestResults(payload).unwrap();

      // очищаем localStorage
      localStorage.removeItem("answers");
      localStorage.removeItem("testStartTime");

      return { ok: true, payload };
    } catch (err) {
      console.error("Send result error:", err);
      return { ok: false, error: err.message || String(err) };
    }
  };

  // onFinish: вызывается из QuestionList (после последнего ответа)
  const handleFinish = async () => {
    toast.loading("Отправка результата...");
    const r = await sendResult();
    toast.dismiss(); // убрать загрузку

    if (r.ok) {
      toast.success("Результат отправлен");
      setResultPayload(r.payload);
      setFinished(true);
    } else {
      console.error("Ошибка при отправке результата:", r.error);
      toast.error("Ошибка при отправке результата. Попробуйте ещё раз.");
      // Всё равно показываем ResultView (опционально). Здесь — не показываем, оставляем пользователя на последнем вопросе.
    }
  };

  const handleBackFromResult = () => {
    // Очистить и перейти на /test
    localStorage.removeItem("answers");
    localStorage.removeItem("testStartTime");
    router.push("/test");
  };

  if (!questionsLevel) return <div className="p-6">{t("1")}</div>;
  if (!mounted) return null;

  return (
    <div
      className={`lg:min-h-screen p-4 ${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans`}
    >
      <Toaster />

      <div className="lg:max-w-7xl lg:mx-auto mx-5 py-5">
        <div className="flex justify-between items-center mb-4">
          <Link href={"/test"}>
            <Button variant="contained">
              <ArrowLeftCircle size={20} />
            </Button>
          </Link>
          <p className="text-2xl font-bold">
            {level.toUpperCase()} {t("2")}
          </p>
        </div>

        {!finished ? (
          <QuestionList
            questions={questionsLevel}
            answers={userAnswers}
            onAnswer={handleAnswer}
            onFinish={handleFinish}
          />
        ) : (
          <ResultView
            answers={userAnswers}
            questions={questionsLevel}
            resultPayload={resultPayload}
            onBack={handleBackFromResult}
            meProfile={meProfile}
          />
        )}
      </div>
    </div>
  );
}
