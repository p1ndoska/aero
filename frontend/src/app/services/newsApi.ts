import { api } from "./api";
import type { NewsItem } from "../../types/News.ts";

export const newsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Эндпоинт для получения всех новостей
        getAllNews: builder.query<NewsItem[], void>({
            query: () => "/news",
        }),

        // Эндпоинт для получения новости по ID
        getNewsById: builder.query<NewsItem, number>({
            query: (id) => `/news/detail/${id}`,
        }),

        // Эндпоинт для получения новостей по категории (по id)
        getNewsByCategoryId: builder.query<NewsItem[], number>({
            query: (categoryId) => `/news/category/${categoryId}`,
        }),

        // Эндпоинт для создания новости
        createNews: builder.mutation<NewsItem, FormData>({
            query: (formData) => ({
                url: "/news/create",
                method: "POST",
                body: formData,
                formData: true,
            }),
        }),

        // Эндпоинт для обновления новости
        updateNews: builder.mutation<NewsItem, { id: number; formData: FormData }>({
            query: ({ id, formData }) => ({
                url: `/news/${id}`,
                method: "PUT",
                body: formData,
                formData: true,
            }),
        }),

        // Эндпоинт для удаления новости
        deleteNews: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/news/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetAllNewsQuery,
    useGetNewsByIdQuery,
    useGetNewsByCategoryIdQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApi;