// src/store/home.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const homePageApi = createApi({
  reducerPath: "homePageApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/homepage/api`,
    prepareHeaders: (headers) => {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    "Swiper",
    "Features",
    "WhyUs",
    "Stats",
    "Partners",
    "Testimonial",
    "Gallery",
    "Courses",
    "InfoSwiper",
    "Otzivi",
  ],
  endpoints: (builder) => ({
    /** ------- SWIPER CRUD ------- */
    getSwiper: builder.query({
      query: () => "/swiper-items",
      providesTags: ["Swiper"],
    }),
    addSwiper: builder.mutation({
      query: (body) => ({
        url: "/swiper-items/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Swiper"],
    }),
    updateSwiper: builder.mutation({
      query: ({ id, data }) => ({
        url: `/swiper-items/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Swiper"],
    }),
    deleteSwiper: builder.mutation({
      query: (id) => ({ url: `/swiper-items/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Swiper"],
    }),

    /** ------- WHY US ------- */
    getWhyUs: builder.query({
      query: () => "/why-us/",
      providesTags: ["WhyUs"],
    }),
    updateWhyUs: builder.mutation({
      query: ({ id, data }) => ({
        url: `/why-us/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["WhyUs"],
    }),

    /** ------- PARTNERS ------- */
    getPartners: builder.query({
      query: () => "/partners",
      providesTags: ["Partners"],
    }),
    addPartner: builder.mutation({
      query: (body) => ({ url: "/partners/", method: "POST", body }),
      invalidatesTags: ["Partners"],
    }),
    deletePartner: builder.mutation({
      query: (id) => ({ url: `/partners/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Partners"],
    }),

    /** ------- TESTIMONIALS (legacy) ------- */
    getTestimonials: builder.query({
      query: () => "/testimonials/",
      providesTags: ["Testimonial"],
    }),
    addTestimonial: builder.mutation({
      query: (formData) => ({
        url: "/testimonials/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Testimonial"],
    }),
    updateTestimonial: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/testimonials/${id}/`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Testimonial"],
    }),
    deleteTestimonial: builder.mutation({
      query: (id) => ({ url: `/testimonials/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Testimonial"],
    }),

    /** ------- GALLERY ------- */
    getGallery: builder.query({
      query: () => "/gallery-items",
      providesTags: ["Gallery"],
    }),
    addGalleryImage: builder.mutation({
      query: (body) => ({ url: "/gallery-items/", method: "POST", body }),
      invalidatesTags: ["Gallery"],
    }),
    deleteGalleryImage: builder.mutation({
      query: (id) => ({ url: `/gallery-items/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Gallery"],
    }),

    /** ------- COURSES ------- */
    getCourses: builder.query({
      query: () => "/courses",
      providesTags: ["Courses"],
    }),

    updateCourse: builder.mutation({
      query: ({ id, data }) => ({
        url: `/courses/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Courses"],
    }),

    /** ------- INFO SWIPER ------- */
    getInfoSwiper: builder.query({
      query: () => "/info-swiper",
      providesTags: ["InfoSwiper"],
    }),

    updateInfoSwiper: builder.mutation({
      query: ({ id, data }) => ({
        url: `/info-swiper/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["InfoSwiper"],
    }),
  }),
});

export const {
  // swiper
  useGetSwiperQuery,
  useAddSwiperMutation,
  useUpdateSwiperMutation,
  useDeleteSwiperMutation,

  // whyUs
  useGetWhyUsQuery,
  useUpdateWhyUsMutation,

  // partners
  useGetPartnersQuery,
  useAddPartnerMutation,
  useDeletePartnerMutation,

  // testimonials (legacy)
  useGetTestimonialsQuery,
  useAddTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,

  // gallery
  useGetGalleryQuery,
  useAddGalleryImageMutation,
  useDeleteGalleryImageMutation,

  // courses
  useGetCoursesQuery,
  useUpdateCourseMutation,

  // infoSwiper
  useGetInfoSwiperQuery,
  useUpdateInfoSwiperMutation, // <-- requested
} = homePageApi;
