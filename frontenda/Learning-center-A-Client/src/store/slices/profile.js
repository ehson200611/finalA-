import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/admin-app/`,

    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Profile"],

  endpoints: (builder) => ({
    getMeProfile: builder.query({
      query: () => "me/profile/",
      providesTags: ["Profile"],
    }),
  }),
});

export const { useGetMeProfileQuery } = profileApi;
