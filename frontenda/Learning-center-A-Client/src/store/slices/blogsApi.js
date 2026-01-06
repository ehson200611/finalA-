// src/store/slices/blogsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const blogsApi = createApi({
  reducerPath: "blogsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Blogs"],

  endpoints: (builder) => ({
    // GET ALL BLOGS
    getBlogs: builder.query({
      query: () => "blogs/blogs/",
      providesTags: ["Blogs"],
    }),

    // CREATE
    addBlog: builder.mutation({
      query: (formData) => ({
        url: "blogs/blogs/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Blogs"],
    }),

    // UPDATE
    updateBlog: builder.mutation({
      query: ({ id, formData }) => ({
        url: `blogs/blogs/${id}/`,
        method: "PUT", // must be PUT
        body: formData,
      }),
      invalidatesTags: ["Blogs"],
    }),

    // DELETE
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `blogs/blogs/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useAddBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogsApi;
