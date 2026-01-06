import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let API = process.env.NEXT_PUBLIC_API_URL;

export const contactApi = createApi({
  reducerPath: "contactApi",
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
  tagTypes: ["Contacts"],

  endpoints: (builder) => ({
    // ✅ GET all contacts
    getContacts: builder.query({
      async queryFn(_, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const response = await fetchWithBQ("contact/contacts/");
          if (response.error) throw response.error;
          return { data: response.data };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Contacts"],
    }),

    addContact: builder.mutation({
      async queryFn(newContact, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const response = await fetchWithBQ({
            url: "contact/contacts/",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: newContact,
          });
          if (response.error) throw response.error;
          return { data: response.data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Contacts"],
    }),

    updateContact: builder.mutation({
      query: ({ id, updatedContact }) => ({
        url: `contact/contacts/${id}/`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: updatedContact,
      }),
      invalidatesTags: ["Contacts"],
    }),

    // ✅ DELETE contact
    deleteContact: builder.mutation({
      async queryFn(id, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const response = await fetchWithBQ({
            url: `contact/contacts/${id}/`,
            method: "DELETE",
          });
          if (response.error) throw response.error;
          return { data: response.data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Contacts"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
