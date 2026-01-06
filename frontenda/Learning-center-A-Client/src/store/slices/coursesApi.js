// src/store/slices/coursesApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const coursesApi = createApi({
  reducerPath: "coursesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/coursepage/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["EnglishCourses", "RussianCourses", "PreSchoolCourses"],
  endpoints: (builder) => ({
    // Get all courses by category
    getEnglishCourses: builder.query({
      query: () => "english/",
      providesTags: ["EnglishCourses"],
    }),

    getRussianCourses: builder.query({
      query: () => "russian/",
      providesTags: ["RussianCourses"],
    }),

    getPreSchoolCourses: builder.query({
      query: () => "preschool/", // This is correct
      providesTags: ["PreSchoolCourses"],
    }),

    // Add course to specific category
    addCourse: builder.mutation({
      query: ({ category, courseData }) => {
        // Map frontend category names to backend endpoints
        const backendCategory =
          category === "preschools" ? "preschool" : category;
        return {
          url: `${backendCategory}/`,
          method: "POST",
          body: courseData,
        };
      },
      invalidatesTags: (result, error, { category }) => [
        category === "english"
          ? "EnglishCourses"
          : category === "russian"
          ? "RussianCourses"
          : "PreSchoolCourses",
      ],
    }),

    // Update course in specific category
    updateCourse: builder.mutation({
      query: ({ category, courseId, updatedCourseData }) => {
        // Map frontend category names to backend endpoints
        const backendCategory =
          category === "preschools" ? "preschool" : category;
        return {
          url: `${backendCategory}/${courseId}/`,
          method: "PUT",
          body: updatedCourseData,
        };
      },
      invalidatesTags: (result, error, { category }) => [
        category === "english"
          ? "EnglishCourses"
          : category === "russian"
          ? "RussianCourses"
          : "PreSchoolCourses",
      ],
    }),

    // Delete course from specific category
    deleteCourse: builder.mutation({
      query: ({ category, courseId }) => {
        // Map frontend category names to backend endpoints
        const backendCategory =
          category === "preschools" ? "preschool" : category;
        return {
          url: `${backendCategory}/${courseId}/`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result, error, { category }) => [
        category === "english"
          ? "EnglishCourses"
          : category === "russian"
          ? "RussianCourses"
          : "PreSchoolCourses",
      ],
    }),
  }),
});

export const {
  useGetEnglishCoursesQuery,
  useGetRussianCoursesQuery,
  useGetPreSchoolCoursesQuery,
  useAddCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} = coursesApi;
