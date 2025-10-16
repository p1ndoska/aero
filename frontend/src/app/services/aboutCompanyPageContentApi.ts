import { api } from './api';
import type { ContentElement } from '@/types/branch';

interface AboutCompanyPageContent {
  id: number;
  pageType?: string;
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

interface UpdateAboutCompanyPageContentRequest {
  pageType?: string;
  title: string;
  subtitle?: string;
  content?: ContentElement[];
  titleEn?: string;
  titleBe?: string;
  subtitleEn?: string;
  subtitleBe?: string;
  contentEn?: ContentElement[];
  contentBe?: ContentElement[];
}

export const aboutCompanyPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAboutCompanyPageContent: builder.query<AboutCompanyPageContent, void>({
      query: () => '/about-company-page-content',
      providesTags: ['AboutCompanyPageContent'],
    }),
    getAboutCompanyPageContentByPageType: builder.query<AboutCompanyPageContent, string>({
      query: (pageType) => `/about-company-page-content/${pageType}`,
      providesTags: ['AboutCompanyPageContent'],
    }),
    updateAboutCompanyPageContent: builder.mutation<AboutCompanyPageContent, UpdateAboutCompanyPageContentRequest>({
      query: (body) => ({
        url: '/about-company-page-content',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AboutCompanyPageContent'],
    }),
    updateAboutCompanyPageContentByPageType: builder.mutation<AboutCompanyPageContent, UpdateAboutCompanyPageContentRequest>({
      query: ({ pageType, ...body }) => ({
        url: `/about-company-page-content/${pageType}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AboutCompanyPageContent'],
    }),
    createAboutCompanyPageContent: builder.mutation<AboutCompanyPageContent, UpdateAboutCompanyPageContentRequest>({
      query: (body) => ({
        url: '/about-company-page-content',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AboutCompanyPageContent'],
    }),
  }),
});

export const { 
  useGetAboutCompanyPageContentQuery, 
  useGetAboutCompanyPageContentByPageTypeQuery,
  useUpdateAboutCompanyPageContentMutation,
  useUpdateAboutCompanyPageContentByPageTypeMutation,
  useCreateAboutCompanyPageContentMutation
} = aboutCompanyPageContentApi;
