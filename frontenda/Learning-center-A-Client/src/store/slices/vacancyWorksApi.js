// vacancyApi.js or similar file in your store/slices folder

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

let API = process.env.NEXT_PUBLIC_API_URL

export const vacancyWorkApi = createApi({
  reducerPath: 'vacancyWorkApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API}/vacancy/api/`,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from your auth state
      const token = getState().auth?.token || localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['VacancyWork'],
  endpoints: (builder) => ({
    
    // NEW: Vacancy Works Endpoints
    getVacancyWork: builder.query({
      query: () => 'vacancy-works/',
      providesTags: ['VacancyWork'],
    }),
    
    addVacancyWork: builder.mutation({
      query: (data) => ({
        url: 'vacancy-works/',
        method: 'POST',
        body: data,
        // Note: FormData will be automatically handled by fetchBaseQuery
      }),
      invalidatesTags: ['VacancyWork'],
    }),
    
    deleteVacancyWork: builder.mutation({
      query: (id) => ({
        url: `vacancy-works/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VacancyWork'],
    }),
    
    // Optional: Update vacancy work
    updateVacancyWork: builder.mutation({
      query: ({ id, data }) => ({
        url: `vacancy-works/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['VacancyWork'],
    }),
  }),
});

export const {
  useGetVacancyWorkQuery,
  useAddVacancyWorkMutation,
  useDeleteVacancyWorkMutation,
  useUpdateVacancyWorkMutation,
} = vacancyWorkApi;