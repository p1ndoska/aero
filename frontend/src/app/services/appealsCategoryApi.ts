import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AppealsCategory {
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

export interface CreateAppealsCategoryRequest {
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

export interface UpdateAppealsCategoryRequest extends CreateAppealsCategoryRequest {
  id: number;
}

export interface UpdateCategoriesOrderRequest {
  categories: Array<{ id: number; sortOrder: number }>;
}

export const appealsCategoryApi = createApi({
  reducerPath: 'appealsCategoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['AppealsCategory'],
  endpoints: (builder) => ({
    getAppealsCategories: builder.query<AppealsCategory[], void>({
      query: () => '/appeals-categories',
      providesTags: ['AppealsCategory'],
    }),
    createAppealsCategory: builder.mutation<AppealsCategory, CreateAppealsCategoryRequest>({
      query: (body) => ({ url: '/appeals-categories', method: 'POST', body }),
      invalidatesTags: ['AppealsCategory'],
    }),
    updateAppealsCategory: builder.mutation<AppealsCategory, UpdateAppealsCategoryRequest>({
      query: ({ id, ...body }) => ({ url: `/appeals-categories/${id}`, method: 'PUT', body }),
      invalidatesTags: ['AppealsCategory'],
    }),
    deleteAppealsCategory: builder.mutation<void, number>({
      query: (id) => ({ url: `/appeals-categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AppealsCategory'],
    }),
    updateCategoriesOrder: builder.mutation<void, UpdateCategoriesOrderRequest>({
      query: (body) => ({ url: '/appeals-categories/order', method: 'PUT', body }),
      invalidatesTags: ['AppealsCategory'],
    })
  })
});

export const {
  useGetAppealsCategoriesQuery,
  useCreateAppealsCategoryMutation,
  useUpdateAppealsCategoryMutation,
  useDeleteAppealsCategoryMutation,
  useUpdateCategoriesOrderMutation,
} = appealsCategoryApi;


