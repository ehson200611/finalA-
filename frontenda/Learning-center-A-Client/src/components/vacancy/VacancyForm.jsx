"use client";
import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useAddVacancyWorkMutation } from "@/store/slices/vacancyWorksApi";
import { toast } from "react-hot-toast";

const VacancyForm = () => {
  const { theme } = useTheme();
  const t = useTranslations("vacancy");
  const locale = useLocale();
  const [addVacancyWork] = useAddVacancyWorkMutation();

  const [formVacancyData, setFormVacancyData] = useState({
    name: "",
    surname: "",
    email: "",
    date: "",
    phone: "",
    resume: null,
  });

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resumefile") {
      setFormVacancyData((prev) => ({
        ...prev,
        resume: files[0],
      }));
    } else {
      const stateProperty =
        name === "phonenumber"
          ? "phone"
          : name === "date_of_birth"
          ? "date"
          : name;

      setFormVacancyData((prev) => ({
        ...prev,
        [stateProperty]: value,
      }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (
        !formVacancyData.name ||
        !formVacancyData.surname ||
        !formVacancyData.email ||
        !formVacancyData.phone ||
        !formVacancyData.date ||
        !formVacancyData.resume
      ) {
        toast.error(t("pleasePol"));
        return;
      }

      const loadingToast = toast.loading(t("sending") || "Отправка...");

      const formDataToSend = new FormData();
      formDataToSend.append("name", formVacancyData.name);
      formDataToSend.append("surname", formVacancyData.surname);
      formDataToSend.append("email", formVacancyData.email);
      formDataToSend.append("phonenumber", formVacancyData.phone);
      formDataToSend.append("date_of_birth", formVacancyData.date);
      formDataToSend.append("resumefile", formVacancyData.resume);

      await addVacancyWork(formDataToSend).unwrap();

      toast.dismiss(loadingToast);
      toast.success(t("application"));

      setFormVacancyData({
        name: "",
        surname: "",
        email: "",
        date: "",
        phone: "",
        resume: null,
      });

      const fileInput = document.querySelector('input[name="resumefile"]');
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      toast.dismiss();
      console.error("Error submitting vacancy application:", err);

      if (err?.data) {
        if (err.data?.errors) {
          const errorMessages = [];
          if (err.data.errors.name)
            errorMessages.push(
              `${t("name")}: ${err.data.errors.name.join(", ")}`
            );
          if (err.data.errors.surname)
            errorMessages.push(
              `Surname: ${err.data.errors.surname.join(", ")}`
            );
          if (err.data.errors.email)
            errorMessages.push(
              `${t("email")}: ${err.data.errors.email.join(", ")}`
            );
          if (err.data.errors.phonenumber)
            errorMessages.push(
              `Phone: ${err.data.errors.phonenumber.join(", ")}`
            );
          if (err.data.errors.date_of_birth)
            errorMessages.push(
              `${t("date")}: ${err.data.errors.date_of_birth.join(", ")}`
            );
          if (err.data.errors.resumefile)
            errorMessages.push(
              `${t("resume")}: ${err.data.errors.resumefile.join(", ")}`
            );

          if (errorMessages.length > 0) {
            toast.error(`${t("fixFollowing")}:\n\n${errorMessages.join("\n")}`);
            return;
          }
        }
      }

      toast.error(t("errorSubmit"));
    }
  };

  return (
    <div
      className={`mt-[50px] h-[600px] rounded-2xl mb-[70px] flex items-center justify-around relative overflow-hidden box ${
        theme === "dark"
          ? "border border-gray-700"
          : "border border-gray-200"
      } max-lg:flex-col max-lg:h-auto max-md:p-5 max-lg:p-10 max-lg:gap-8`}
      style={{
        background:
          theme === "dark"
            ? "radial-gradient(ellipse at 70% 10%, rgba(64,224,208,0.3) 0%, rgba(0,206,209,0.2) 60%, transparent 100%), linear-gradient(135deg, #181f28 80%, #263544 100%)"
            : "radial-gradient(ellipse at 70% 10%, #e0fbf7 0%, #aefaf2 40%, transparent 70%), linear-gradient(90deg, #40e0d0 10%, #00ced1 100%)",
        boxShadow:
          theme === "dark"
            ? "0 2px 30px 0 rgba(0, 206, 209, 0.15)"
            : "0 2px 40px 0 rgba(64,224,208,0.15)",
      }}
    >
      <span
        className="absolute left-[-120px] top-[-60px] w-[340px] h-[340px] rounded-full opacity-30 pointer-events-none"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(circle, #40e0d080 65%, #181f2800)"
              : "radial-gradient(circle, #40e0d0bb 60%, #aefaf230 100%)",
          zIndex: 1,
        }}
      />
      <span
        className="absolute right-[-90px] bottom-[-80px] w-[290px] h-[290px] rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(circle, #00ced180 65%, #181f2800)"
              : "radial-gradient(circle, #00ced1a0 60%, #e0fbf710 100%)",
          zIndex: 1,
        }}
      />

      <div className="p-[25px] w-[650px] flex flex-col gap-[11px] box1 max-lg:w-full max-lg:p-[10px] z-10 relative">
        <h2 className="text-[60px] font-medium leading-[50px] max-md:text-[28px] max-lg:text-[35px] max-lg:leading-tight drop-shadow-lg mb-5">
          {t("letDo")}
        </h2>
        <ul className="list-disc z-10 text-[20px] flex flex-col gap-[15px] py-5 px-10 max-md:text-[16px] max-lg:items-start max-lg:px-[25px] bg-white/60 dark:bg-gray-900/60 rounded-xl shadow max-w-xl backdrop-blur-sm">
          <li className="w-[50%] max-lg:w-full">{t("englishVlad")}</li>
          <li>{t("opt")}</li>
          <li className="w-[50%] max-lg:w-full">{t("ready")}</li>
        </ul>
      </div>

      <div
        className={`p-[15px] w-[420px] rounded-xl shadow-lg z-10 relative 
            ${theme === "dark" ? "bg-gray-800/80 border-[#00CED1]" : "bg-white/80 border border-[#c0f5f5]"} 
              max-lg:w-full max-lg:p-[20px] backdrop-blur-sm`}
      >
        <form
          className="flex flex-col items-start gap-[15px] max-md:gap-[10px]"
          onSubmit={handleFormSubmit}
        >
          <input
            required
            name="name"
            value={formVacancyData.name}
            onChange={handleFormChange}
            className={`${
              theme === "dark"
                ? "bg-gray-700/90 text-white border-2 border-[#00CED1]"
                : "bg-gray-100/80 text-black border-2 border-[#aefaf2]"
            } font-[500] rounded-md w-full p-[15px] outline-none max-md:p-[12px] max-md:text-[14px]`}
            type="text"
            placeholder={t("name")}
          />
          <input
            required
            name="surname"
            value={formVacancyData.surname}
            onChange={handleFormChange}
            className={`${
              theme === "dark"
                ? "bg-gray-700/90 text-white border-2 border-[#00CED1]"
                : "bg-gray-100/80 text-black border-2 border-[#aefaf2]"
            } font-[500] rounded-md w-full p-[15px] outline-none max-md:p-[12px] max-md:text-[14px]`}
            type="text"
            placeholder={t("sureName")}
          />
          <input
            required
            name="email"
            value={formVacancyData.email}
            onChange={handleFormChange}
            className={`${
              theme === "dark"
                ? "bg-gray-700/90 text-white border-2 border-[#00CED1]"
                : "bg-gray-100/80 text-black border-2 border-[#aefaf2]"
            } font-[500] rounded-md w-full p-[15px] outline-none max-md:p-[12px] max-md:text-[14px]`}
            type="email"
            placeholder={t("email")}
          />
          <input
            required
            name="date_of_birth"
            value={formVacancyData.date}
            onChange={handleFormChange}
            className={`${
              theme === "dark"
                ? "bg-gray-700/90 text-white border-2 border-[#00CED1]"
                : "bg-gray-100/80 text-black border-2 border-[#aefaf2]"
            } font-[500] rounded-md w-full p-[15px] outline-none max-md:p-[12px] max-md:text-[14px]`}
            type="date"
            placeholder={t("date")}
          />
          <input
            required
            name="phonenumber"
            value={formVacancyData.phone}
            onChange={handleFormChange}
            className={`${
              theme === "dark"
                ? "bg-gray-700/90 text-white border-2 border-[#00CED1]"
                : "bg-gray-100/80 text-black border-2 border-[#aefaf2]"
            } font-[500] rounded-md w-full p-[15px] outline-none max-md:p-[12px] max-md:text-[14px]`}
            type="tel"
            placeholder="+992 00 000-00-00"
          />

          <div className="cursor-pointer w-full">
            <input
              required
              name="resumefile"
              onChange={handleFormChange}
              className="border p-2 w-full rounded-md bg-white dark:bg-gray-700/80 border-[#40e0d0]"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
            />
            {formVacancyData.resume && (
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                {formVacancyData.resume.name}{" "}
                {formVacancyData.resume.size !== undefined && (
                  <span>
                    ({(formVacancyData.resume.size / 1024 / 1024).toFixed(2)}{" "}
                    MB)
                  </span>
                )}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`bg-gradient-to-r from-[#40E0D0] to-[#00CED1] text-white py-[10px] cursor-pointer rounded-md font-[500] w-[95%] m-auto transition-all shadow-md hover:from-[#00ced1] hover:to-[#40e0d0] ${
              theme === "dark"
                ? "border-double border-4 border-[#00CED1] hover:border-[#40E0D0]"
                : ""
            } max-md:w-full max-md:text-[15px]`}
          >
            {t("interview")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VacancyForm;

