import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQueryWithAuth';

export interface AeronauticalInfoCategory {
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
  parentId?: number | null;
  parent?: AeronauticalInfoCategory | null;
  children?: AeronauticalInfoCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAeronauticalInfoCategoryRequest {
  name: string;
  nameEn?: string;
  nameBe?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  pageType: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: number | null;
}

export interface UpdateAeronauticalInfoCategoryRequest extends CreateAeronauticalInfoCategoryRequest {
  id: number;
}

export interface UpdateCategoriesOrderRequest {
  categories: Array<{ id: number; sortOrder: number }>;
}

export const aeronauticalInfoCategoryApi = createApi({
  reducerPath: 'aeronauticalInfoCategoryApi',
  baseQuery: createBaseQueryWithAuth(),
  tagTypes: ['AeronauticalInfoCategory'],
  endpoints: (builder) => ({
    getAeronauticalInfoCategories: builder.query<AeronauticalInfoCategory[], void>({
      query: () => '/aeronautical-info-categories',
      providesTags: ['AeronauticalInfoCategory'],
    }),
    getAeronauticalInfoCategory: builder.query<AeronauticalInfoCategory, number>({
      query: (id) => `/aeronautical-info-categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'AeronauticalInfoCategory', id }],
    }),
    createAeronauticalInfoCategory: builder.mutation<AeronauticalInfoCategory, CreateAeronauticalInfoCategoryRequest>({
      query: (category) => ({
        url: '/aeronautical-info-categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['AeronauticalInfoCategory'],
    }),
    updateAeronauticalInfoCategory: builder.mutation<AeronauticalInfoCategory, UpdateAeronauticalInfoCategoryRequest>({
      query: ({ id, ...category }) => ({
        url: `/aeronautical-info-categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'AeronauticalInfoCategory', id }],
    }),
    deleteAeronauticalInfoCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/aeronautical-info-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AeronauticalInfoCategory'],
    }),
    updateCategoriesOrder: builder.mutation<void, UpdateCategoriesOrderRequest>({
      query: (data) => ({
        url: '/aeronautical-info-categories/order',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AeronauticalInfoCategory'],
    }),
  }),
});

export const {
  useGetAeronauticalInfoCategoriesQuery,
  useGetAeronauticalInfoCategoryQuery,
  useCreateAeronauticalInfoCategoryMutation,
  useUpdateAeronauticalInfoCategoryMutation,
  useDeleteAeronauticalInfoCategoryMutation,
  useUpdateCategoriesOrderMutation,
} = aeronauticalInfoCategoryApi;
