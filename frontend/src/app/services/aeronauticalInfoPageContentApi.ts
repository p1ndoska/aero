import { api } from './api';

export interface AeronauticalInfoPageContent {
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

export interface CreateAeronauticalInfoPageContentRequest {
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

export interface UpdateAeronauticalInfoPageContentRequest {
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

export const aeronauticalInfoPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAeronauticalInfoPageContent: builder.query<AeronauticalInfoPageContent, string>({
      query: (pageType) => `/aeronautical-info-page-content/${pageType}`,
      providesTags: ['AeronauticalInfoPageContent'],
    }),
    createAeronauticalInfoPageContent: builder.mutation<AeronauticalInfoPageContent, CreateAeronauticalInfoPageContentRequest>({
      query: (data) => ({
        url: '/aeronautical-info-page-content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AeronauticalInfoPageContent'],
    }),
    updateAeronauticalInfoPageContent: builder.mutation<AeronauticalInfoPageContent, UpdateAeronauticalInfoPageContentRequest>({
      query: ({ pageType, ...data }) => ({
        url: `/aeronautical-info-page-content/${pageType}`,
        method: 'PUT',
        body: data,
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
  useCreateAeronauticalInfoPageContentMutation,
  useUpdateAeronauticalInfoPageContentMutation,
  useDeleteAeronauticalInfoPageContentMutation,
} = aeronauticalInfoPageContentApi;
