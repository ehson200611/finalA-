import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const feedbackApi = createApi({
  reducerPath: "feedbackApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Feedback"],
  endpoints: (builder) => ({
    getFeedbacks: builder.query({
      query: () => "feedback/feedback/",
      providesTags: ["Feedback"],
    }),
    createFeedback: builder.mutation({
      query: (feedbackData) => ({
        url: "feedback/feedback/",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(feedbackData).toString(),
      }),
      invalidatesTags: ["Feedback"],
    }),
    deleteFeedback: builder.mutation({
      query: (id) => ({
        url: `feedback/feedback/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Feedback"],
    }),
    updateFeedback: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `feedback/feedback/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
  }),
});

export const {
  useGetFeedbacksQuery,
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
  useUpdateFeedbackMutation,
} = feedbackApi;
