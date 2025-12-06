// @ts-nocheck
import { api } from "./api";

export interface Role { id: number; name: string }

export const roleApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getRoles: builder.query<Role[], void>({
            query: () => "/role",
            providesTags: ['Roles'],
        }),
        createRole: builder.mutation<any, { name: string }>({
            query: (body) => ({ url: "/role/create", method: "POST", body }),
            invalidatesTags: ['Roles'],
        }),
        updateRole: builder.mutation<any, { id: number; name: string }>({
            query: ({ id, name }) => ({ url: `/role/${id}`, method: "PUT", body: { name } }),
            invalidatesTags: ['Roles'],
        }),
        deleteRole: builder.mutation<any, number>({
            query: (id) => ({ url: `/role/${id}`, method: "DELETE" }),
            invalidatesTags: ['Roles'],
        }),
    }),
});

export const { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = roleApi; 