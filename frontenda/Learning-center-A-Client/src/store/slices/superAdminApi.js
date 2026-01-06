import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const superAdminApi = createApi({
  reducerPath: "superAdminApi",
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
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: () => "admin-app/admins/",
      providesTags: ["Admin"],
    })
  }),
});

export const { useGetAdminsQuery, useDeleteAdminMutation } = superAdminApi;
