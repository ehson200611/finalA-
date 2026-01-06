import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = process.env.NEXT_PUBLIC_API_URL;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API}/admin-app/`,
  }),

  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ phoneNumber, password }) => ({
        url: "login/",
        method: "POST",
        body: { phoneNumber, password },
      }),
    }),

    register: builder.mutation({
      query: (user) => ({
        url: "register/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }),
    }),
    
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "auth/forgot-password/",
        method: "POST",
        body,
      }),
    }),

    sendSms: builder.mutation({
      query: (body) => ({
        url: "auth/send-code/",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation({
      query: (body) => ({
        url: "auth/reset-password/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useSendSmsMutation,
  useResetPasswordMutation,
} = authApi;
