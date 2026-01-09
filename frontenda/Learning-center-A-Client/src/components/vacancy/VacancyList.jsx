"use client";
import React, { memo } from "react";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@mui/material";
import { PlusCircle } from "lucide-react";
import { Delete, Edit } from "@mui/icons-material";
import SafeImage from "@/components/ui/SafeImage";

const VacancyList = ({
  vacanciesFrontend,
  vacancies,
  lang,
  expandedStates,
  onToggleExpand,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("vacancy");

  return (
    <div className="mt-[45px] flex gap-4 overflow-x-auto scrollbar-hide scrollbar-thin scrollbar-thumb-[#00CED1] snap-x">
      {vacanciesFrontend?.map((e) => {
        const isExpanded = expandedStates[e.id] || false;
        const descriptionLength = e.description?.[lang]?.length || 0;
        const descriptionText = e.description?.[lang] || "";
        const shortDescription =
          descriptionLength > 30 && !isExpanded
            ? descriptionText.slice(0, 30) + "..."
            : descriptionText;

        return (
          <div
            className={`shrink-0 snap-start rounded-md p-[20px] md:min-w-[330px] max-w-[350px] min-h-[200px] flex flex-col ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            key={e.id}
          >
            <div className="flex items-center gap-4">
              {e.image && (
                <SafeImage
                  src={e.image}
                  alt={e.name?.[lang] || "vacancy"}
                  width={80}
                  height={80}
                  className="rounded"
                  style={{ width: "auto", height: "auto" }}
                />
              )}
              <div className="flex flex-col gap-[8px]">
                <h2 className="text-[18px] font-[500]">
                  {e.name?.[lang] || ""}
                </h2>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } font-[500]`}
                >
                  {e.title?.[lang] || ""}
                </p>
              </div>
            </div>

            <div className="mt-[10px] flex-1 overflow-hidden">
              <div className="h-full">
                <p className="normal-case break-words">
                  {shortDescription}
                  {descriptionLength > 30 && (
                    <button
                      className="text-[#00CED1] ml-[5px] underline focus:outline-none whitespace-nowrap"
                      onClick={() => onToggleExpand(e.id)}
                    >
                      {isExpanded ? t("back") : t("readMore")}
                    </button>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {isAdmin && (
                <>
                  <Button
                    className="p-1.5 bg-blue-500 text-white rounded-full cursor-pointer min-w-0 w-8 h-8"
                    onClick={() => {
                      const originalItem = vacancies?.find(
                        (v) => v.id === e.id
                      );
                      if (originalItem) onEdit(originalItem);
                    }}
                    sx={{
                      backgroundColor: "gray",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "32px",
                      padding: "6px",
                    }}
                  >
                    <Edit sx={{ fontSize: 18 }} />
                  </Button>
                  <Button
                    className="p-1.5 bg-red-500 text-white rounded-full cursor-pointer min-w-0 w-8 h-8"
                    onClick={() => onDelete(e.id)}
                    sx={{
                      backgroundColor: "red",
                      color: "white",
                      minWidth: "32px",
                      borderRadius: "50%",
                      padding: "6px",
                    }}
                  >
                    <Delete sx={{ fontSize: 18 }} />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(VacancyList);
