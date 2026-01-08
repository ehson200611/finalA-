"use client";
import React, { memo } from "react";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@mui/material";
import { PlusCircle } from "lucide-react";
import { Delete, Edit } from "@mui/icons-material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQSection = ({
  answersFrontend,
  answer,
  lang,
  isAdmin,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("vacancy");

  return (
    <div className="mb-[150px] max-lg:mb-[80px] max-sm:mb-[60px]">
      <h5 className="text-[55px] max-lg:text-[35px] max-sm:text-[28px] font-semibold text-center max-lg:mb-[20px]">
        {t("quest")}
      </h5>

      <div className="flex justify-end max-lg:justify-center max-sm:justify-center">
        {isAdmin && (
          <Button
            onClick={onAddQuestion}
            className="bg-blue-500 items-center flex gap-2 p-2 px-5 font-bold text-white rounded-md cursor-pointer 
        max-md:px-4 max-md:py-2 max-md:text-[14px]"
            variant="contained"
          >
            <PlusCircle size={18} /> {t("add")}
          </Button>
        )}
      </div>

      <div className="sm:mt-[30px] flex flex-col gap-[20px] max-lg:gap-[15px] max-sm:gap-[10px] max-lg:mt-[20px]">
        {answersFrontend?.map((e) => (
          <Accordion
            key={e.id}
            style={{
              padding: "10px",
              borderRadius: "15px",
              background: theme === "dark" ? "#2D3748" : "#FFFFFF",
              border:
                theme === "dark"
                  ? "1px solid #4A5568"
                  : "1px solid #E2E8F0",
            }}
            className="max-md:p-[8px] max-sm:p-[5px]"
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  style={{
                    color: theme === "dark" ? "#FFFFFF" : "#000000",
                  }}
                />
              }
              aria-controls={`panel-${e.id}-content`}
              id={`panel-${e.id}-header`}
            >
              <Typography
                style={{
                  fontSize: "17px",
                  fontWeight: "bold",
                  color: theme === "dark" ? "#FFFFFF" : "#000000",
                }}
                className=" md:text-[10px] max-sm:text-[10px]"
                component="span"
              >
                {e.question && e.question[lang] ? e.question[lang] : ""}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography
                style={{
                  fontSize: "15px",
                  fontWeight: "400",
                  width: "90%",
                  color: theme === "dark" ? "#E2E8F0" : "#4A5568",
                }}
                className="max-md:text-[15px] max-sm:text-[14px] max-md:w-full"
              >
                {e.answer && e.answer[lang] ? e.answer[lang] : ""}
              </Typography>
            </AccordionDetails>

            <div className="flex gap-4 items-center justify-end max-md:flex-col max-md:items-stretch max-md:gap-[10px] max-sm:gap-[8px]">
              {isAdmin && (
                <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4">
                  <button
                    onClick={() => onDeleteQuestion(e.id)}
                    className="
        w-7 h-7 
        sm:w-8 sm:h-8 
        flex items-center justify-center 
        bg-red-500 hover:bg-red-600 
        text-white 
        rounded-full 
        transition-all duration-200 
        cursor-pointer 
        p-1.5
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1
      "
                    aria-label={t("delete") || "Delete"}
                    title={t("delete") || "Delete"}
                  >
                    <Delete
                      className="
          w-3.5 h-3.5 
          sm:w-4 sm:h-4
        "
                    />
                  </button>

                  <button
                    onClick={() => {
                      const originalItem = answer?.find((q) => q.id === e.id);
                      if (originalItem) onEditQuestion(originalItem);
                    }}
                    className="
        w-7 h-7 
        sm:w-8 sm:h-8 
        flex items-center justify-center 
        bg-gray-500 hover:bg-gray-600 
        text-white 
        rounded-full 
        transition-all duration-200 
        cursor-pointer 
        p-1.5
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
      "
                    aria-label={t("edit") || "Edit"}
                    title={t("edit") || "Edit"}
                  >
                    <Edit
                      className="
          w-3.5 h-3.5 
          sm:w-4 sm:h-4
        "
                    />
                  </button>
                </div>
              )}
            </div>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default memo(FAQSection);

