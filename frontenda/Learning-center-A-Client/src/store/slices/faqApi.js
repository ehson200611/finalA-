import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const faqApi = createApi({
  reducerPath: "faqApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/faq/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getFaqs: builder.query({
      query: () => "faq-page/",
    }),

    addFaq: builder.mutation({
      query: (newFaq) => ({
        url: "faq-page/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: newFaq,
      }),
    }),

    updateFaq: builder.mutation({
      query: ({ id, updatedFaq }) => ({
        url: `faq-page/${id}/`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: updatedFaq, // only the question/answer object
      }),
    }),

    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `faq-page/${id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
