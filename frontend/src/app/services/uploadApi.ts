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
        // Возвращаем относительный путь как есть (например, /uploads/image.jpg)
        // BASE_URL будет добавляться при отображении изображений
        console.log('Upload response:', response);
        return { url: response.url };
      },
    }),
    uploadFile: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: '/upload-file',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any) => {
        // Возвращаем относительный путь как есть (например, /uploads/file.pdf)
        // BASE_URL будет добавляться при отображении файлов
        console.log('File upload response:', response);
        return { url: response.url };
      },
    }),
  }),
});

export const { useUploadImageMutation, useUploadFileMutation } = uploadApi;
