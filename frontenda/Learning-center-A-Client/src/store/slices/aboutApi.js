import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const aboutApi = createApi({
  reducerPath: "aboutApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/homepage/api/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["About"],
  endpoints: (builder) => ({
    getAbout: builder.query({
      query: () => "stats/",
      providesTags: ["About"],
    }),
    getByIdAbout: builder.query({
      query: (id) => `stats/${id}/`,
      providesTags: ["About"],
    }),
    updateAbout: builder.mutation({
      query: (updatedAbout) => ({
        url: `stats/${updatedAbout.order}/`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: updatedAbout,
      }),
      invalidatesTags: ["About"],
    }),
  }),
});

export const {
  useGetAboutQuery,
  useGetByIdAboutQuery,
  useUpdateAboutMutation,
} = aboutApi;
