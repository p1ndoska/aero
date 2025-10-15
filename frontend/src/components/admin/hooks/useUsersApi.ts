// @ts-nocheck
import { api } from "@/app/services/api";

export const usersAdminApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllUsers: builder.query<any[], void>({
            query: () => "/users",
        }),
        updateUser: builder.mutation<any, { id: number; roleName: string }>({
            query: ({ id, roleName }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body: { roleName },
            }),
        }),
    }),
});

export const { useGetAllUsersQuery, useUpdateUserMutation } = usersAdminApi; 