import { api } from './api';
import type { ContentElement } from '@/types/branch';

export interface AeronauticalInfoPageContent {
  id: number;
  pageType: string;
  title: string;
  titleEn?: string;
  titleBe?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleBe?: string;
  content?: ContentElement[];
  contentEn?: ContentElement[];
  contentBe?: ContentElement[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAeronauticalInfoPageContentRequest {
  pageType: string;
  title?: string;
  titleEn?: string;
  titleBe?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleBe?: string;
  content?: ContentElement[];
  contentEn?: ContentElement[];
  contentBe?: ContentElement[];
}

export const aeronauticalInfoPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAeronauticalInfoPageContent: builder.query<AeronauticalInfoPageContent[], void>({
      query: () => '/aeronautical-info-page-content',
      providesTags: ['AeronauticalInfoPageContent'],
    }),
    getAeronauticalInfoPageContentByPageType: builder.query<AeronauticalInfoPageContent, string>({
      query: (pageType) => `/aeronautical-info-page-content/${pageType}`,
      providesTags: (result, error, pageType) => [{ type: 'AeronauticalInfoPageContent', id: pageType }],
    }),
    updateAeronauticalInfoPageContent: builder.mutation<AeronauticalInfoPageContent, UpdateAeronauticalInfoPageContentRequest>({
      query: (body) => ({
        url: '/aeronautical-info-page-content',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AeronauticalInfoPageContent'],
    }),
    updateAeronauticalInfoPageContentByPageType: builder.mutation<AeronauticalInfoPageContent, { pageType: string; body: UpdateAeronauticalInfoPageContentRequest }>({
      query: ({ pageType, body }) => ({
        url: `/aeronautical-info-page-content/${pageType}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { pageType }) => [
        { type: 'AeronauticalInfoPageContent', id: pageType },
        { type: 'AeronauticalInfoPageContent', id: 'LIST' }
      ],
    }),
    createAeronauticalInfoPageContent: builder.mutation<AeronauticalInfoPageContent, UpdateAeronauticalInfoPageContentRequest>({
      query: (body) => ({
        url: '/aeronautical-info-page-content',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AeronauticalInfoPageContent'],
    }),
    deleteAeronauticalInfoPageContent: builder.mutation<void, string>({
      query: (pageType) => ({
        url: `/aeronautical-info-page-content/${pageType}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AeronauticalInfoPageContent'],
    }),
  }),
});

export const {
  useGetAeronauticalInfoPageContentQuery,
  useGetAeronauticalInfoPageContentByPageTypeQuery,
  useUpdateAeronauticalInfoPageContentMutation,
  useUpdateAeronauticalInfoPageContentByPageTypeMutation,
  useCreateAeronauticalInfoPageContentMutation,
  useDeleteAeronauticalInfoPageContentMutation,
} = aeronauticalInfoPageContentApi;