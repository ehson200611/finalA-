"use client";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import {
  useGetTeachersQuery,
  useAddTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} from "@/store/slices/teacherApi";
import AddTeacherModal from "../../../components/teachersComponent/AddTeacherModal";
import EditTeacherModal from "../../../components/teachersComponent/EditTeacherModal";
import TeacherCard from "../../../components/teachersComponent/TeacherCard";
import SectionOne from "@/components/SectionOne";
import { PlusCircle } from "lucide-react";
import { useGetMeProfileQuery } from "@/store/slices/profile";
import Errors from "@/components/error/errors";
import Loading from "@/components/loading/loading";
import { toast, Toaster } from "react-hot-toast";

const DEFAULT_TEACHER_IMAGE = "/default-teacher.png";

const Teacher = () => {
  const { data: meProfile } = useGetMeProfileQuery();
  const isAdmin = meProfile?.role === "superadmin";

  // const isAdmin = true

  const { theme } = useTheme();
  const t = useTranslations("teachers");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  const {
    data: teachersData,
    isLoading,
    error,
    refetch,
  } = useGetTeachersQuery();

  const [addTeacher, { isLoading: isAdding }] = useAddTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const [teachersList, setTeachersList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (teachersData) {
      let teachers = [];

      if (Array.isArray(teachersData)) {
        teachers = teachersData;
      } else if (teachersData.results) {
        teachers = teachersData.results;
      } else if (teachersData.data) {
        teachers = teachersData.data;
      } else if (teachersData.teachers) {
        teachers = teachersData.teachers;
      } else {
        teachers = [teachersData];
      }

      setTeachersList(teachers);
    } else {
      setTeachersList([]);
    }
  }, [teachersData]);

  if (!mounted) return null;

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

  const handleAddTeacher = async (formData) => {
    try {
      await addTeacher(formData).unwrap();
      refetch();
      setShowAddModal(false);
      toast.success(`${t("addTeacher")}`);
    } catch (err) {
      console.error("Full error details:", err);
      let errorMessage = `${t("errorToAdd")}`;

      if (err.data) {
        const errorDetails = Object.entries(err.data)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("\n");

        if (errorDetails) {
          errorMessage += "\n" + errorDetails;
        }
      } else if (err.error) {
        errorMessage += ": " + err.error;
      }

      toast.error(errorMessage, {
        autoClose: 10000,
        closeOnClick: false,
      });
    }
  };

  const handleEditTeacher = async (formData) => {
    if (!selectedTeacher) return;
    try {
      await updateTeacher({
        id: selectedTeacher.id,
        formData: formData,
      }).unwrap();

      refetch();
      setShowEditModal(false);
      setSelectedTeacher(null);
      toast.success(`${t("updateTeacher")}`);
    } catch (err) {
      console.error("Error updating teacher:", err);
      toast.error(t("errorToUpdate") + (err.data?.message || err.error));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTeacher(id).unwrap();
      setTeachersList((prev) => prev.filter((t) => t.id !== id));
      toast.success(`${t("delete")}`);
    } catch (err) {
      console.error("Error deleting teacher:", err);
      toast.error(t("errorToDelete") + (err.data?.message || err.error));
      refetch();
    }
  };

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-[#0a1a23] text-white"
          : "bg-linear-to-br from-[#e6f9ff] via-[#f4fbfc] to-[#e8f7f9] text-[#02202B]"
      } font-sans`}
    >
      <Toaster />
      <div className="lg:max-w-7xl mx-5 py-5 lg:mx-auto">
        <SectionOne title={t("repitate")} description={t("online")} />

        {isAdmin && (
          <div className="mt-10 flex justify-end max-w-7xl mx-auto px-4">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isAdding}
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              <PlusCircle size={18} />{" "}
              {isAdding ? t("saving") : t("AddTeacher")}
            </button>
          </div>
        )}

        <div className="w-full mx-auto px-4 py-12">
          {teachersList && teachersList.length > 0 ? (
            teachersList.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={{
                  ...teacher,
                  imageUrl:
                    teacher.image || teacher.imageUrl || DEFAULT_TEACHER_IMAGE,
                }}
                theme={theme}
                lang={locale}
                isAdmin={isAdmin}
                onEdit={() => {
                  setSelectedTeacher(teacher);
                  setShowEditModal(true);
                }}
                onDelete={() => handleDelete(teacher.id)}
                isDeleting={isDeleting}
              />
            ))
          ) : (
            <div className="text-center text-gray-500">
              <p>{t("haveNot")}</p>
              <button
                onClick={refetch}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAdmin && showAddModal && (
        <AddTeacherModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTeacher}
          loading={isAdding}
        />
      )}

      {isAdmin && showEditModal && selectedTeacher && (
        <EditTeacherModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTeacher(null);
          }}
          onSave={handleEditTeacher}
          loading={isUpdating}
        />
      )}
    </div>
  );
};

export default Teacher;
