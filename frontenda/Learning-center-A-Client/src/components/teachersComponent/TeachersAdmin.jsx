"use client";
import React, { useState } from "react";
import {
  useAddTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeachersQuery,
  useUpdateTeacherMutation,
} from "@/store/slices/teacherApi";
import TeacherModal from "./TeacherModal";
import TeacherCard from "../../../components/teachersComponent/TeacherCard";

export default function TeachersAdmin({ isAdmin = false }) {
  const { data, isLoading } = useGetTeachersQuery();
  const [addTeacher] = useAddTeacherMutation();
  const [deleteTeacher] = useDeleteTeacherMutation();
  const [updateTeacher] = useUpdateTeacherMutation();

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;

  const teachers = data?.teachersData || [];

  const handleAdd = () => {
    setSelectedTeacher(null);
    setModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this teacher?")) {
      await deleteTeacher(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🎓 Teachers</h1>

      {isAdmin && (
        <button
          onClick={handleAdd}
          className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ➕ Add Teacher
        </button>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {teachers.map((t) => (
          <TeacherCard
            key={t.id}
            teacher={t}
            isAdmin={isAdmin}
            onEdit={isAdmin ? () => handleEdit(t) : undefined}
            onDelete={isAdmin ? () => handleDelete(t.id) : undefined}
          />
        ))}
      </div>

      {isAdmin && modalOpen && (
        <TeacherModal
          teacher={selectedTeacher}
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            if (selectedTeacher) {
              await updateTeacher({ id: selectedTeacher.id, updatedTeacher: data });
            } else {
              await addTeacher(data);
            }
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
