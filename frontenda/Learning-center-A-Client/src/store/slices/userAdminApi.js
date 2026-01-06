// store/slices/userAdminApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const userAdminApi = createApi({
  reducerPath: "userAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/admin-app/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsersAdmin: builder.query({
      query: () => "users/",
      providesTags: ["Users"],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `users/${id}/`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "users/",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),

    getUsersById: builder.query({
      query: (id) => `users/${id}`,
      providesTags: ["Users"],
    }),

    toggleIsPdf: builder.mutation({
      query: ({ body, id }) => ({
        url: `/profiles/toggle-pdf-by-user/${id}/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersAdminQuery,
  useUpdateUserRoleMutation,
  useCreateUserMutation,
  useGetUsersByIdQuery,
  useToggleIsPdfMutation,
} = userAdminApi;
