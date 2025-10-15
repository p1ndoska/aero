import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any) => {
        // Если URL уже содержит полный путь, используем его как есть
        const finalUrl = response.url.startsWith('http') ? response.url : `${BASE_URL}${response.url}`;
        console.log('Upload response:', response);
        console.log('Final URL:', finalUrl);
        return { url: finalUrl };
      },
    }),
    uploadFile: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/upload-file',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any) => {
        // Если URL уже содержит полный путь, используем его как есть
        const finalUrl = response.url.startsWith('http') ? response.url : `${BASE_URL}${response.url}`;
        console.log('File upload response:', response);
        console.log('Final URL:', finalUrl);
        return { url: finalUrl };
      },
    }),
  }),
});

export const { useUploadImageMutation, useUploadFileMutation } = uploadApi;
