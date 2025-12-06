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
  passwordChangedAt?: string;
  mustChangePassword?: boolean;
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

export interface ForceChangePasswordRequest {
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
      // Принудительно обновляем при монтировании и изменении аргументов
      refetchOnMountOrArgChange: true,
    }),

    // Обновить профиль
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['UserProfile'],
      // Оптимистично обновляем кеш сразу после успешного обновления
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data: updatedProfile } = await queryFulfilled;
          // Обновляем кеш запроса профиля оптимистично
          dispatch(
            userProfileApi.util.updateQueryData('getProfile', undefined, (draft) => {
              if (draft && updatedProfile) {
                // Обновляем все поля из ответа сервера
                draft.id = updatedProfile.id;
                draft.email = updatedProfile.email;
                draft.firstName = updatedProfile.firstName;
                draft.lastName = updatedProfile.lastName;
                draft.middleName = updatedProfile.middleName;
                draft.phone = updatedProfile.phone;
                draft.avatar = updatedProfile.avatar;
                draft.birthDate = updatedProfile.birthDate;
                draft.gender = updatedProfile.gender;
                draft.address = updatedProfile.address;
                draft.position = updatedProfile.position;
                draft.department = updatedProfile.department;
                draft.bio = updatedProfile.bio;
                draft.preferences = updatedProfile.preferences;
                draft.isEmailVerified = updatedProfile.isEmailVerified;
                draft.isActive = updatedProfile.isActive;
                draft.lastLoginAt = updatedProfile.lastLoginAt;
                draft.createdAt = updatedProfile.createdAt;
                draft.updatedAt = updatedProfile.updatedAt;
                if (updatedProfile.role) {
                  draft.role = updatedProfile.role;
                }
              }
            })
          );
        } catch {}
      },
    }),

    // Изменить пароль
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/profile/password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Принудительная смена пароля (без текущего пароля)
    forceChangePassword: builder.mutation<{ message: string }, ForceChangePasswordRequest>({
      query: (passwordData) => ({
        url: '/profile/force-change-password',
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
  useChangePasswordMutation,
  useForceChangePasswordMutation,
  useGetUserStatsQuery,
  useDeleteAccountMutation,
} = userProfileApi;
