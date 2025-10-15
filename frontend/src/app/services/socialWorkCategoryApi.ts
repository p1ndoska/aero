import { api } from './api';

interface SocialWorkCategory {
  id: number;
  name: string;
  nameEn?: string;
  nameBe?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  pageType: string; // Уникальный тип страницы
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateSocialWorkCategoryRequest {
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

interface UpdateSocialWorkCategoryRequest extends CreateSocialWorkCategoryRequest {}

interface UpdateCategoriesOrderRequest {
  categories: Array<{ id: number; sortOrder: number }>;
}

export const socialWorkCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllSocialWorkCategories: builder.query<SocialWorkCategory[], void>({
      query: () => '/social-work-categories',
      providesTags: ['SocialWorkCategory'],
    }),
    getSocialWorkCategory: builder.query<SocialWorkCategory, number>({
      query: (id) => `/social-work-categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'SocialWorkCategory', id }],
    }),
    createSocialWorkCategory: builder.mutation<SocialWorkCategory, CreateSocialWorkCategoryRequest>({
      query: (body) => ({
        url: '/social-work-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialWorkCategory'],
    }),
    updateSocialWorkCategory: builder.mutation<SocialWorkCategory, { id: number; body: UpdateSocialWorkCategoryRequest }>({
      query: ({ id, body }) => ({
        url: `/social-work-categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SocialWorkCategory', id }],
    }),
    deleteSocialWorkCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/social-work-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialWorkCategory'],
    }),
    updateCategoriesOrder: builder.mutation<void, UpdateCategoriesOrderRequest>({
      query: (body) => ({
        url: '/social-work-categories/order',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SocialWorkCategory'],
    }),
  }),
});

export const {
  useGetAllSocialWorkCategoriesQuery,
  useGetSocialWorkCategoryQuery,
  useCreateSocialWorkCategoryMutation,
  useUpdateSocialWorkCategoryMutation,
  useDeleteSocialWorkCategoryMutation,
  useUpdateCategoriesOrderMutation,
} = socialWorkCategoryApi;

