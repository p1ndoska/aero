import { api } from "./api";
import type { LoginRequest, LoginResponse, User } from "../types";

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Эндпоинт для входа
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (userData) => ({
                url: "/login",
                method: "POST",
                body: userData,
            }),
        }),

        // Эндпоинт для регистрации (только SUPER_ADMIN)
        register: builder.mutation<User, { firstName: string; lastName: string; email: string; password: string; role: string }>(
            {
                query: (userData) => ({
                    url: "/register",
                    method: "POST",
                    body: userData,
                }),
            }
        ),

        // Эндпоинт для получения пользователя по ID
        getUserById: builder.query<{ user: User }, number>({
            query: (id) => `/users/${id}`,
        }),

        // Эндпоинт для получения всех пользователей
        getAllUsers: builder.query<{ users: User[] }, void>({
            query: () => "/users",
        }),

        // Эндпоинт для обновления пользователя
        updateUser: builder.mutation<User, { id: number; userData: Partial<User> }>({
            query: ({ id, userData }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body: userData,
            }),
        }),

        // Эндпоинт для удаления пользователя
        deleteUser: builder.mutation<void, number>({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetUserByIdQuery,
    useGetAllUsersQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi;