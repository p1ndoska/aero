import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQueryWithAuth';

export type HomeServiceCard = {
    id: number;
    title: string;
    titleEn?: string | null;
    titleBe?: string | null;
    href: string;
    imageUrl?: string | null;
    sortOrder: number;
    isActive: boolean;
};

export type HomeServiceCardInput = {
    title: string;
    titleEn?: string;
    titleBe?: string;
    href: string;
    imageUrl?: string;
    sortOrder: number;
    isActive: boolean;
};

export const homeServiceCardApi = createApi({
    reducerPath: 'homeServiceCardApi',
    baseQuery: createBaseQueryWithAuth(),
    tagTypes: ['HomeServiceCard'],
    endpoints: (builder) => ({
        getHomeServiceCards: builder.query<HomeServiceCard[], void>({
            query: () => 'home-service-cards',
            providesTags: ['HomeServiceCard'],
        }),
        getAdminHomeServiceCards: builder.query<HomeServiceCard[], void>({
            query: () => 'home-service-cards/admin',
            providesTags: ['HomeServiceCard'],
        }),
        createHomeServiceCard: builder.mutation<HomeServiceCard, FormData>({
            query: (body) => ({
                url: 'home-service-cards',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['HomeServiceCard'],
        }),
        updateHomeServiceCard: builder.mutation<HomeServiceCard, { id: number; body: FormData }>({
            query: ({ id, body }) => ({
                url: `home-service-cards/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['HomeServiceCard'],
        }),
        deleteHomeServiceCard: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `home-service-cards/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['HomeServiceCard'],
        }),
    }),
});

export const {
    useGetHomeServiceCardsQuery,
    useGetAdminHomeServiceCardsQuery,
    useCreateHomeServiceCardMutation,
    useUpdateHomeServiceCardMutation,
    useDeleteHomeServiceCardMutation,
} = homeServiceCardApi;
