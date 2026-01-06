import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const notificationAdminApi = createApi({
  reducerPath: "notificationAdminApi",
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
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotificationAdmin: builder.query({
      query: () => "admin-app/notifications/",
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `admin-app/notifications/${id}/`,
        method: "PATCH",
        body: { status: "read" },
      }),
      invalidatesTags: ["Notification"],
    }),
    markAsUnread: builder.mutation({
      query: (id) => ({
        url: `admin-app/notifications/${id}/`,
        method: "PATCH",
        body: { status: "unread" },
      }),
      invalidatesTags: ["Notification"],
    }),
    addNotification: builder.mutation({
      query: (notificationData) => ({
        url: 'admin-app/notifications/',
        method: "POST",
        body: notificationData,
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `admin-app/notifications/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationAdminQuery,
  useMarkAsReadMutation,
  useMarkAsUnreadMutation,
  useDeleteNotificationMutation,
  useAddNotificationMutation
} = notificationAdminApi;
