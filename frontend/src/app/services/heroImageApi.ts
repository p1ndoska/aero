import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQueryWithAuth';

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin);

export const heroImageApi = createApi({
  reducerPath: 'heroImageApi',
  baseQuery: createBaseQueryWithAuth(BASE_URL),
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

