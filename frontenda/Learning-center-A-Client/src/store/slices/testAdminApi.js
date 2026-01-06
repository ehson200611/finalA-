import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const testAdminApi = createApi({
  reducerPath: "testAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Tests"],
  endpoints: (builder) => ({
    getTestAdmin: builder.query({
      query: () => "admin-app/tests-admin/",
      providesTags: ["Tests"],
    }),
  }),
});

export const { useGetTestAdminQuery } = testAdminApi;
