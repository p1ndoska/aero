import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQueryWithAuth';

export const servicesCategoryApi = createApi({
  reducerPath: 'servicesCategoryApi',
  baseQuery: createBaseQueryWithAuth(),
  tagTypes: ['ServicesCategory'],
  endpoints: (builder) => ({
    getAllServicesCategories: builder.query({
      query: () => 'services-categories',
      providesTags: ['ServicesCategory'],
    }),
    getServicesCategoryById: builder.query({
      query: (id) => `services-categories/${id}`,
      providesTags: ['ServicesCategory'],
    }),
    createServicesCategory: builder.mutation({
      query: (category) => ({
        url: 'services-categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['ServicesCategory'],
    }),
    updateServicesCategory: builder.mutation({
      query: ({ id, ...category }) => ({
        url: `services-categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: ['ServicesCategory'],
    }),
    deleteServicesCategory: builder.mutation({
      query: (id) => ({
        url: `services-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServicesCategory'],
    }),
    updateServicesCategoriesOrder: builder.mutation({
      query: (categories) => ({
        url: 'services-categories/order',
        method: 'PUT',
        body: { categories },
      }),
      invalidatesTags: ['ServicesCategory'],
    }),
  }),
});

export const {
  useGetAllServicesCategoriesQuery,
  useGetServicesCategoryByIdQuery,
  useCreateServicesCategoryMutation,
  useUpdateServicesCategoryMutation,
  useDeleteServicesCategoryMutation,
  useUpdateServicesCategoriesOrderMutation,
} = servicesCategoryApi;
