import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const heroImageApi = createApi({
  reducerPath: 'heroImageApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['HeroImage'],
  endpoints: (builder) => ({
    getCurrentHeroImage: builder.query<{
      success: boolean;
      imageUrl: string | null;
      hasImage: boolean;
    }, void>({
      query: () => '/api/hero-image/current',
      providesTags: ['HeroImage'],
    }),
    uploadHeroImage: builder.mutation<{
      success: boolean;
      message: string;
      imageUrl: string;
    }, FormData>({
      query: (formData) => ({
        url: '/api/hero-image/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['HeroImage'],
    }),
    removeHeroImage: builder.mutation<{
      success: boolean;
      message: string;
    }, void>({
      query: () => ({
        url: '/api/hero-image/remove',
        method: 'DELETE',
      }),
      invalidatesTags: ['HeroImage'],
    }),
  }),
});

export const {
  useGetCurrentHeroImageQuery,
  useUploadHeroImageMutation,
  useRemoveHeroImageMutation,
} = heroImageApi;

