// src/store/slices/vacancyApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const vacancyApi = createApi({
  reducerPath: "vacancyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/vacancy/api/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Vacancy"],
  endpoints: (builder) => ({
    getVacancy: builder.query({
      query: () => "vacancy-users/",
      providesTags: ["Vacancy"],
    }),
    getAnswer: builder.query({
      query: () => "vacancy-questions/",
      providesTags: ["Vacancy"],
    }),
    addVacancy: builder.mutation({
      query: (formData) => ({
        url: "vacancy-users/",
        method: "POST",
        body: formData,
        // Don't set Content-Type header for FormData - browser will set it with boundary
      }),
      invalidatesTags: ["Vacancy"],
    }),
    addQuestion: builder.mutation({
      query: (questionData) => ({
        url: "vacancy-questions/",
        method: "POST",
        body: questionData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Vacancy"],
    }),
    updateVacancy: builder.mutation({
      query: ({ id, data }) => ({
        url: `vacancy-users/${id}/`,
        method: "PUT",
        body: data,
        // Don't set Content-Type header for FormData
      }),
      invalidatesTags: ["Vacancy"],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, data }) => ({
        url: `vacancy-questions/${id}/`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Vacancy"],
    }),
    deleteVacancy: builder.mutation({
      query: (id) => ({
        url: `vacancy-users/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vacancy"],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `vacancy-questions/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vacancy"],
    }),
  }),
});

export const {
  useGetVacancyQuery,
  useGetAnswerQuery,
  useAddVacancyMutation,
  useAddQuestionMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
} = vacancyApi;
