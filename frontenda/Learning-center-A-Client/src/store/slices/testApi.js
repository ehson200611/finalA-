// src/services/testApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const testApi = createApi({
  reducerPath: "testApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/tests/`,

    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Question"],
  endpoints: (builder) => ({
    getQuestion: builder.query({
      query: () => `questions/`,
      providesTags: ["Question"],
    }),
    getQuestionA1: builder.query({
      query: () => "questions/a1/",
      providesTags: ["Question"],
    }),
    getQuestionA2: builder.query({
      query: () => "questions/a2/",
      providesTags: ["Question"],
    }),
    getQuestionB1: builder.query({
      query: () => "questions/b1/",
      providesTags: ["Question"],
    }),
    getQuestionB2: builder.query({
      query: () => "questions/b2/",
      providesTags: ["Question"],
    }),
    getQuestionC1: builder.query({
      query: () => "questions/c1/",
      providesTags: ["Question"],
    }),
    getQuestionC2: builder.query({
      query: () => "questions/c2/",
      providesTags: ["Question"],
    }),

    updateQuestion: builder.mutation({
      query: ({ id, data }) => ({
        url: `questions/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Question"],
    }),

    addTestResults: builder.mutation({
      query: (body) => ({
        url: `testresults/`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetQuestionQuery,
  useGetQuestionA1Query,
  useGetQuestionA2Query,
  useGetQuestionB1Query,
  useGetQuestionB2Query,
  useGetQuestionC1Query,
  useGetQuestionC2Query,
  useUpdateQuestionMutation,
  useAddTestResultsMutation
} = testApi;
