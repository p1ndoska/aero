import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface SearchResult {
  id: number;
  type: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
  category: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  message?: string;
}

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://localhost:8443')}/api/search`,
  }),
  endpoints: (builder) => ({
    searchAll: builder.query<SearchResponse, { query: string; language?: string }>({
      query: ({ query, language = 'ru' }) => ({
        url: '/all',
        params: { query, language },
      }),
    }),
  }),
});

export const { useSearchAllQuery, useLazySearchAllQuery } = searchApi;





