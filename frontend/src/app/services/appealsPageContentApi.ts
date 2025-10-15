import { api } from './api';

export interface AppealsPageContent {
  id: number;
  pageType: string;
  title: string;
  titleEn?: string;
  titleBe?: string;
  subtitle: string;
  subtitleEn?: string;
  subtitleBe?: string;
  content: any[];
  contentEn?: any[];
  contentBe?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppealsPageContentRequest {
  pageType: string;
  title: string;
  titleEn?: string;
  titleBe?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleBe?: string;
  content?: any[];
  contentEn?: any[];
  contentBe?: any[];
}

export interface UpdateAppealsPageContentRequest {
  pageType: string;
  title?: string;
  titleEn?: string;
  titleBe?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleBe?: string;
  content?: any[];
  contentEn?: any[];
  contentBe?: any[];
}

export const appealsPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAppealsPageContent: builder.query<AppealsPageContent, string>({
      query: (pageType) => `/appeals-page-content/${pageType}`,
      providesTags: ['AppealsPageContent'],
    }),
    createAppealsPageContent: builder.mutation<AppealsPageContent, CreateAppealsPageContentRequest>({
      query: (data) => ({
        url: '/appeals-page-content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AppealsPageContent'],
    }),
    updateAppealsPageContent: builder.mutation<AppealsPageContent, UpdateAppealsPageContentRequest>({
      query: ({ pageType, ...data }) => ({
        url: `/appeals-page-content/${pageType}`,
        method: 'PUT',
        body: data,
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
  useCreateAppealsPageContentMutation,
  useUpdateAppealsPageContentMutation,
  useDeleteAppealsPageContentMutation,
} = appealsPageContentApi;
