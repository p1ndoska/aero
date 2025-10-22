import { api } from './api';
import type { ContentElement } from '@/types/branch';

interface SocialWorkPageContent {
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

interface UpdateSocialWorkPageContentRequest {
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

export const socialWorkPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSocialWorkPageContent: builder.query<SocialWorkPageContent, string>({
      query: (pageType) => `/social-work-page-content/${pageType}`,
      providesTags: (result, error, pageType) => [{ type: 'SocialWorkPageContent', id: pageType }],
    }),
    updateSocialWorkPageContent: builder.mutation<SocialWorkPageContent, { pageType: string; body: UpdateSocialWorkPageContentRequest }>({
      query: ({ pageType, body }) => ({
        url: `/social-work-page-content/${pageType}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { pageType }) => [{ type: 'SocialWorkPageContent', id: pageType }],
    }),
    getAllSocialWorkPages: builder.query<SocialWorkPageContent[], void>({
      query: () => '/social-work-pages',
      providesTags: ['SocialWorkPageContent'],
    }),
  }),
});

export const { 
  useGetSocialWorkPageContentQuery, 
  useUpdateSocialWorkPageContentMutation,
  useGetAllSocialWorkPagesQuery 
} = socialWorkPageContentApi;



