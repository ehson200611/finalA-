"use client";

import React, { useState, useEffect, memo } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  useGetCoursesQuery,
  useUpdateCourseMutation,
} from "@/store/slices/home";
import Linkto from "../linkto";
import { useLocale, useTranslations } from "next-intl";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardMedia,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import PublicIcon from "@mui/icons-material/Public";
import toast from "react-hot-toast";
import Loading from "../loading/loading";

const Courses = ({ isAdmin }) => {
  const { theme } = useTheme();
  const t = useTranslations("homePage");
  const {
    data: courses,
    isLoading,
    refetch,
  } = useGetCoursesQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    pollingInterval: 0,
  });
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();

  const [mounted, setMounted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const locale = useLocale();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (courses?.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  const handleSave = async () => {
    if (!selectedCourse) return;

    const formData = new FormData();
    formData.append("title_ru", selectedCourse.title_ru);
    formData.append("title_en", selectedCourse.title_en);
    formData.append("title_tj", selectedCourse.title_tj);
    formData.append("description_ru", selectedCourse.description_ru || "");
    formData.append("description_en", selectedCourse.description_en || "");
    formData.append("description_tj", selectedCourse.description_tj || "");
    formData.append("order", selectedCourse.order);

    if (selectedCourse.imageFile instanceof File) {
      formData.append("image", selectedCourse.imageFile);
    }

    try {
      await updateCourse({ id: selectedCourse.id, data: formData }).unwrap();
      toast.success(t("courseDownload"));
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(t("errorToLoad"));
    }
  };

  if (!mounted) return null;

  if (isLoading) return <Loading />;

  if (!courses || courses.length === 0)
    return (
      <div className="text-center py-8 text-gray-500">{t("noCourses")}</div>
    );

  return (
    <div className="my-[50px]">
      <div className="text-center space-y-5 py-5">
        <h2 className="w-full  mx-auto md:text-5xl text-2xl leading-tight font-bold">
          {t("coursesTitle")}
        </h2>
        <p className="text-sm md:text-xl font-medium  mx-auto">
          {t("coursesDesc")}
        </p>
      </div>

      {/* Десктоп */}
      <div
        className={`md:block hidden overflow-hidden py-5 ${
          theme === "dark"
            ? "bg-[#02202B] text-white"
            : "bg-[#F5F7FA] text-black"
        } transition-colors duration-400`}
      >
        <div className="flex gap-5 w-full">
          {/* Список курсов */}
          <div className="w-2/4 flex flex-col gap-4 justify-between">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-xl text-left p-4  rounded-lg transition-all duration-300 shadow-lg ${
                  selectedCourse?.id === course.id
                    ? theme === "dark"
                      ? "bg-gray-500 text-white"
                      : "bg-gray-500 text-white"
                    : theme === "dark"
                    ? "bg-[#042834] hover:bg-gray-700 text-white"
                    : "bg-white hover:bg-gray-300 text-black"
                }`}
              >
                {locale === "en"
                  ? course.title_en
                  : locale === "tj"
                  ? course.title_tj
                  : course.title_ru}
              </button>
            ))}
          </div>

          {selectedCourse && (
            <div className="w-2/3 relative rounded-lg overflow-hidden">
              {isAdmin && (
                <Box
                  sx={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}
                >
                  <Tooltip title={t("update")}>
                    <button
                      className=" bg-white/50 w-10 h-10 rounded-full hover:bg-white/10 transition"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                  </Tooltip>
                </Box>
              )}
              <Image
                src={selectedCourse.image}
                alt={"slide image"}
                fill
                sizes="100vw"
                className="object-cover object-center lg:object-cover"
              />
              <div className="absolute z-10 w-full h-full bg-black/50 text-white space-y-4 pt-28">
                <div className="space-y-5 p-10">
                  <h3
                    className={`lg:text-3xl text-2xl font-bold lg:w-[400px] w-[380px] font-serif`}
                  >
                    {locale === "en"
                      ? selectedCourse.title_en
                      : locale === "tj"
                      ? selectedCourse.title_tj
                      : selectedCourse.title_ru}
                  </h3>
                  <p
                    className={`text-sm md:text-[16px] font-medium w-[350px] `}
                  >
                    {locale === "en"
                      ? selectedCourse.description_en
                      : locale === "tj"
                      ? selectedCourse.description_tj
                      : selectedCourse.description_ru}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Мобильная версия */}
      <div className="relative lg:hidden md:hidden flex gap-5 py-5 overflow-x-scroll scrollbar-hide">
        {courses?.map((course) => (
          <div
            className="w-[300px] h-[50vh] relative rounded-lg overflow-hidden shrink-0"
            key={course.id}
          >
            {isAdmin && (
              <Box
                sx={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}
              >
                <Tooltip title={t("update")}>
                  <button
                    className=" bg-white/50 w-10 h-10 rounded-full hover:bg-white/10 transition"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <EditIcon fontSize="small" />
                  </button>
                </Tooltip>
              </Box>
            )}
            <Image
              src={course.image}
              alt={"slide image"}
              fill
              sizes="100vw"
              className="object-cover object-center lg:object-cover"
            />
            <div className="absolute z-10 w-full h-full bg-black/50 text-white space-y-4 ">
              <div className="space-y-5 px-2 pt-28 text-center">
                <h3 className={`text-xl font-extrabold font-serif`}>
                  {locale === "en"
                    ? course.title_en
                    : locale === "tj"
                    ? course.title_tj
                    : course.title_ru}
                </h3>
                <p className={`text-base font-medium `}>
                  {locale === "en"
                    ? course.description_en
                    : locale === "tj"
                    ? course.description_tj
                    : course.description_ru}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модалка для редактирования курса */}
      {selectedCourse && (
        <CourseDialog
          open={editModalOpen}
          slide={selectedCourse}
          setSlide={setSelectedCourse}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleSave}
          loading={updating}
        />
      )}
    </div>
  );
};

export default React.memo(Courses);

// ---------------- CourseDialog ----------------
function CourseDialog({ open, slide, setSlide, onClose, onSubmit, loading }) {
  const [lang, setLang] = useState("ru");
  if (!slide) return null;
  const t = useTranslations("homePage");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlide((prev) => ({
      ...prev,
      imageFile: file,
      image: URL.createObjectURL(file),
    }));
  };

  useEffect(() => {
    return () => {
      if (slide?.image) {
        URL.revokeObjectURL(slide.image);
      }
    };
  }, [slide?.image]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>{t("editCourseText")}</DialogTitle>

      <DialogContent dividers>
        <ToggleButtonGroup
          value={lang}
          exclusive
          onChange={(_, val) => val && setLang(val)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {["ru", "en", "tj"].map((code) => (
            <ToggleButton
              key={code}
              value={code}
              sx={{ textTransform: "none" }}
            >
              <PublicIcon sx={{ mr: 1 }} /> {code.toUpperCase()}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
          <TextField
            label={`${t("nameText")} (${lang.toUpperCase()})`}
            value={
              lang === "ru"
                ? slide.title_ru
                : lang === "en"
                ? slide.title_en
                : slide.title_tj
            }
            onChange={(e) => {
              const val = e.target.value;
              setSlide((prev) => ({
                ...prev,
                title_ru: lang === "ru" ? val : prev.title_ru,
                title_en: lang === "en" ? val : prev.title_en,
                title_tj: lang === "tj" ? val : prev.title_tj,
              }));
            }}
            fullWidth
            size="small"
          />

          <TextField
            label={`${t("descriptionText")} (${lang.toUpperCase()})`}
            value={
              lang === "ru"
                ? slide.description_ru
                : lang === "en"
                ? slide.description_en
                : slide.description_tj
            }
            onChange={(e) => {
              const val = e.target.value;
              setSlide((prev) => ({
                ...prev,
                description_ru: lang === "ru" ? val : prev.description_ru,
                description_en: lang === "en" ? val : prev.description_en,
                description_tj: lang === "tj" ? val : prev.description_tj,
              }));
            }}
            fullWidth
            size="small"
          />

          <TextField
            label={t("link")}
            value={slide.href ?? ""}
            onChange={(e) =>
              setSlide((prev) => ({ ...prev, href: e.target.value }))
            }
            fullWidth
            size="small"
          />
        </Box>

        <Box sx={{ mb: 1 }}>
          <Button
            variant="outlined"
            component="label"
            sx={{ textTransform: "none" }}
          >
            {t("chooseFile")}
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageChange}
            />
          </Button>
        </Box>

        {slide.image && (
          <Card sx={{ mt: 2, borderRadius: 1 }}>
            <CardMedia
              component="img"
              width="50"
              height="50"
              image={slide.image}
              alt="preview"
              sx={{
                objectFit: "cover",
                maxHeight: 200,
                maxWidth: 200,
                margin: "auto",
              }}
            />
          </Card>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CloseIcon />}
          sx={{ textTransform: "none", fontSize: 12 }}
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={loading}
          sx={{ textTransform: "none", fontSize: 12 }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            t("save")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
