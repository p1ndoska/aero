import { api } from './api';

export interface AboutCompanyCategory {
  id: number;
  name: string;
  nameEn?: string;
  nameBe?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  pageType: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAboutCompanyCategoryRequest {
  name: string;
  nameEn?: string;
  nameBe?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  pageType: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateAboutCompanyCategoryRequest {
  name?: string;
  nameEn?: string;
  nameBe?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  pageType?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const aboutCompanyCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllAboutCompanyCategories: builder.query<AboutCompanyCategory[], void>({
      query: () => '/about-company-categories',
      providesTags: [{ type: 'AboutCompanyCategory', id: 'LIST' }],
    }),
    getAboutCompanyCategoryById: builder.query<AboutCompanyCategory, number>({
      query: (id) => `/about-company-categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'AboutCompanyCategory', id }],
    }),
    createAboutCompanyCategory: builder.mutation<AboutCompanyCategory, CreateAboutCompanyCategoryRequest>({
      query: (data) => ({
        url: '/about-company-categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'AboutCompanyCategory', id: 'LIST' }],
    }),
    updateAboutCompanyCategory: builder.mutation<AboutCompanyCategory, { id: number; data: UpdateAboutCompanyCategoryRequest }>({
      query: ({ id, data }) => ({
        url: `/about-company-categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AboutCompanyCategory', id },
        { type: 'AboutCompanyCategory', id: 'LIST' },
      ],
    }),
    deleteAboutCompanyCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/about-company-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AboutCompanyCategory', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAllAboutCompanyCategoriesQuery,
  useGetAboutCompanyCategoryByIdQuery,
  useCreateAboutCompanyCategoryMutation,
  useUpdateAboutCompanyCategoryMutation,
  useDeleteAboutCompanyCategoryMutation,
} = aboutCompanyCategoryApi;
