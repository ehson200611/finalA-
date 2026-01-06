// src/store/slices/teacherApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/teachers/api/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Teachers"],
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: () => "teachers/", // Full endpoint path
      providesTags: ["Teachers"],
    }),

    addTeacher: builder.mutation({
      query: (formData) => ({
        url: "teachers/", // Full endpoint path
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Teachers"],
    }),

    updateTeacher: builder.mutation({
      query: ({ id, formData }) => ({
        // Changed to formData
        url: `teachers/${id}/`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Teachers"],
    }),

    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `teachers/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teachers"],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useAddTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;
