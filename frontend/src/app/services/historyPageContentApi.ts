import { api } from './api';

export interface HistoryPageContent {
  id: number;
  title: string;
  subtitle: string;
  content: any[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateHistoryPageContentRequest {
  title?: string;
  subtitle?: string;
  content?: any[];
}

export const historyPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHistoryPageContent: builder.query<HistoryPageContent, void>({
      query: () => '/history-page-content',
      providesTags: [{ type: 'HistoryPageContent', id: 'LIST' }],
    }),
    updateHistoryPageContent: builder.mutation<HistoryPageContent, UpdateHistoryPageContentRequest>({
      query: (data) => ({
        url: '/history-page-content',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'HistoryPageContent', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetHistoryPageContentQuery,
  useUpdateHistoryPageContentMutation,
} = historyPageContentApi;
