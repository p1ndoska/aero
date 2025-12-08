import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQueryWithAuth';

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
  baseQuery: createBaseQueryWithAuth(),
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


