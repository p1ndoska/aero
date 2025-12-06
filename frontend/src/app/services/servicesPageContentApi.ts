import { api } from './api';

export interface ServicesPageContent {
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
  documentUrl?: string;
  documentName?: string;
  instructionUrl?: string;
  instructionName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicesPageContentRequest {
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

export interface UpdateServicesPageContentRequest {
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
  documentUrl?: string;
  documentName?: string;
  instructionUrl?: string;
  instructionName?: string;
}

export const servicesPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServicesPageContent: builder.query<ServicesPageContent, string>({
      query: (pageType) => `/services-page-content/${pageType}`,
      providesTags: ['ServicesPageContent'],
    }),
    createServicesPageContent: builder.mutation<ServicesPageContent, CreateServicesPageContentRequest>({
      query: (data) => ({
        url: '/services-page-content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ServicesPageContent'],
    }),
    updateServicesPageContent: builder.mutation<ServicesPageContent, UpdateServicesPageContentRequest>({
      query: ({ pageType, ...data }) => ({
        url: `/services-page-content/${pageType}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ServicesPageContent'],
    }),
    deleteServicesPageContent: builder.mutation<void, string>({
      query: (pageType) => ({
        url: `/services-page-content/${pageType}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicesPageContent'],
    }),
  }),
});

export const {
  useGetServicesPageContentQuery,
  useCreateServicesPageContentMutation,
  useUpdateServicesPageContentMutation,
  useDeleteServicesPageContentMutation,
} = servicesPageContentApi;
