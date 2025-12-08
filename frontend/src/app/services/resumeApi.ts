import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants';
import type { RootState } from '../store';

export interface Resume {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  fileUrl: string;
  fileName: string;
  status: 'NEW' | 'VIEWED' | 'CONTACTED' | 'ARCHIVED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeStats {
  total: number;
  byStatus: {
    new: number;
    viewed: number;
    contacted: number;
    archived: number;
  };
}

export interface ResumeListResponse {
  resumes: Resume[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateResumeStatusRequest {
  status: 'NEW' | 'VIEWED' | 'CONTACTED' | 'ARCHIVED';
  notes?: string;
}

export const resumeApi = createApi({
  reducerPath: 'resumeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Resume'],
  endpoints: (builder) => ({
    getAllResumes: builder.query<ResumeListResponse, { page?: number; limit?: number; status?: string; search?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.status) searchParams.append('status', params.status);
        if (params.search) searchParams.append('search', params.search);
        return `resumes?${searchParams.toString()}`;
      },
      providesTags: ['Resume'],
    }),
    getResumeById: builder.query<Resume, number>({
      query: (id) => `resumes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Resume', id }],
    }),
    getResumeStats: builder.query<ResumeStats, void>({
      query: () => 'resumes/stats',
      providesTags: ['Resume'],
    }),
    updateResumeStatus: builder.mutation<Resume, { id: number; data: UpdateResumeStatusRequest }>({
      query: ({ id, data }) => ({
        url: `resumes/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Resume', id }, 'Resume'],
    }),
    deleteResume: builder.mutation<void, number>({
      query: (id) => ({
        url: `resumes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Resume'],
    }),
  }),
});

export const {
  useGetAllResumesQuery,
  useGetResumeByIdQuery,
  useGetResumeStatsQuery,
  useUpdateResumeStatusMutation,
  useDeleteResumeMutation,
} = resumeApi;

