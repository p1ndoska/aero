// @ts-nocheck
import { api } from "./api";
import type { NewsCategory } from "../../types/News";

export const categoryApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<NewsCategory[], void>({
            query: () => "/category",
        }),
        getCategoryById: builder.query<NewsCategory, number>({
            query: (id) => `/category/${id}`,
        }),
        createCategory: builder.mutation<any, { name: string; nameEn?: string; nameBe?: string }>({
            query: (body) => ({
                url: "/category/create",
                method: "POST",
                body,
            }),
        }),
        updateCategory: builder.mutation<any, { id: number; name: string; nameEn?: string; nameBe?: string }>({
            query: ({ id, name, nameEn, nameBe }) => ({
                url: `/category/${id}`,
                method: "PUT",
                body: { name, nameEn, nameBe },
            }),
        }),
        deleteCategory: builder.mutation<any, { id: number; cascade?: boolean }>({
            query: ({ id, cascade }) => ({
                url: `/category/${id}${cascade ? '?cascade=true' : ''}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi; 