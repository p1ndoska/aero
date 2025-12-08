import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithAuth } from './baseQueryWithAuth';
import { BASE_URL } from '../../constants';

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: createBaseQueryWithAuth(),
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
