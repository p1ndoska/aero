import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQueryWithAuth';

export const heroImageApi = createApi({
  reducerPath: 'heroImageApi',
  baseQuery: createBaseQueryWithAuth(),
  tagTypes: ['HeroImage'],
  endpoints: (builder) => ({
    getCurrentHeroMedia: builder.query<{
      success: boolean;
      videoUrl: string | null;
      hasVideo: boolean;
      fallbackImageUrl: string | null;
      hasFallbackImage: boolean;
    }, void>({
      query: () => '/hero-image/media/current',
      providesTags: ['HeroImage'],
    }),
    uploadHeroVideo: builder.mutation<{
      success: boolean;
      message: string;
      videoUrl: string;
    }, FormData>({
      query: (formData) => ({
        url: '/hero-image/media/video',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['HeroImage'],
    }),
    uploadHeroFallbackImage: builder.mutation<{
      success: boolean;
      message: string;
      fallbackImageUrl: string;
    }, FormData>({
      query: (formData) => ({
        url: '/hero-image/media/fallback-image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['HeroImage'],
    }),
    getCurrentHeroImage: builder.query<{
      success: boolean;
      imageUrl: string | null;
      hasImage: boolean;
    }, void>({
      query: () => '/hero-image/current',
      providesTags: ['HeroImage'],
    }),
    uploadHeroImage: builder.mutation<{
      success: boolean;
      message: string;
      imageUrl: string;
    }, FormData>({
      query: (formData) => ({
        url: '/hero-image/upload',
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
        url: '/hero-image/remove',
        method: 'DELETE',
      }),
      invalidatesTags: ['HeroImage'],
    }),
  }),
});

export const {
  useGetCurrentHeroMediaQuery,
  useUploadHeroVideoMutation,
  useUploadHeroFallbackImageMutation,
  useGetCurrentHeroImageQuery,
  useUploadHeroImageMutation,
  useRemoveHeroImageMutation,
} = heroImageApi;
