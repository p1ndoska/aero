import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';
import { BASE_URL } from '../../constants';

export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  avatar?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  position?: string;
  department?: string;
  bio?: string;
  preferences?: any;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  position?: string;
  department?: string;
  bio?: string;
  preferences?: any;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface UserStats {
  totalLogins: number;
  lastLogin?: string;
  accountCreated?: string;
  profileCompleteness: number;
}

export const userProfileApi = createApi({
  reducerPath: 'userProfileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token || localStorage.getItem("token");
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['UserProfile'],
  endpoints: (builder) => ({
    // Получить профиль пользователя
    getProfile: builder.query<UserProfile, void>({
      query: () => '/profile',
      providesTags: ['UserProfile'],
    }),

    // Обновить профиль
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Обновить аватар
    updateAvatar: builder.mutation<{ id: number; avatar: string }, FormData>({
      query: (formData) => ({
        url: '/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Изменить пароль
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/profile/password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Получить статистику пользователя
    getUserStats: builder.query<UserStats, void>({
      query: () => '/profile/stats',
      providesTags: ['UserProfile'],
    }),

    // Удалить аккаунт
    deleteAccount: builder.mutation<{ message: string }, DeleteAccountRequest>({
      query: (deleteData) => ({
        url: '/profile',
        method: 'DELETE',
        body: deleteData,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useChangePasswordMutation,
  useGetUserStatsQuery,
  useDeleteAccountMutation,
} = userProfileApi;
