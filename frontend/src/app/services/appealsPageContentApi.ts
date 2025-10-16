import { api } from './api';
import type { ContentElement } from '@/types/branch';

export interface AppealsPageContent {
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

export interface UpdateAppealsPageContentRequest {
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

export const appealsPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppealsPageContent: builder.query<AppealsPageContent[], void>({
      query: () => '/appeals-page-content',
      providesTags: ['AppealsPageContent'],
    }),
    getAppealsPageContentByPageType: builder.query<AppealsPageContent, string>({
      query: (pageType) => `/appeals-page-content/${pageType}`,
      providesTags: (result, error, pageType) => [{ type: 'AppealsPageContent', id: pageType }],
    }),
    updateAppealsPageContent: builder.mutation<AppealsPageContent, UpdateAppealsPageContentRequest>({
      query: (body) => ({
        url: '/appeals-page-content',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AppealsPageContent'],
    }),
    updateAppealsPageContentByPageType: builder.mutation<AppealsPageContent, { pageType: string; body: UpdateAppealsPageContentRequest }>({
      query: ({ pageType, body }) => ({
        url: `/appeals-page-content/${pageType}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { pageType }) => [
        { type: 'AppealsPageContent', id: pageType },
        { type: 'AppealsPageContent', id: 'LIST' }
      ],
    }),
    createAppealsPageContent: builder.mutation<AppealsPageContent, UpdateAppealsPageContentRequest>({
      query: (body) => ({
        url: '/appeals-page-content',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AppealsPageContent'],
    }),
    deleteAppealsPageContent: builder.mutation<void, string>({
      query: (pageType) => ({
        url: `/appeals-page-content/${pageType}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AppealsPageContent'],
    }),
  }),
});

export const {
  useGetAppealsPageContentQuery,
  useGetAppealsPageContentByPageTypeQuery,
  useUpdateAppealsPageContentMutation,
  useUpdateAppealsPageContentByPageTypeMutation,
  useCreateAppealsPageContentMutation,
  useDeleteAppealsPageContentMutation,
} = appealsPageContentApi;