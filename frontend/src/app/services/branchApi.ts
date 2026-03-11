import { api } from "./api";
import type { 
  Branch, 
  CreateBranchRequest, 
  UpdateBranchRequest, 
  BranchResponse, 
  SingleBranchResponse 
} from "@/types/branch";

export const branchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получить все филиалы
    getAllBranches: builder.query<BranchResponse, void>({
      query: () => "/branch",
      providesTags: ['Branch'],
    }),

    // Получить филиал по ID
    getBranchById: builder.query<SingleBranchResponse, number>({
      query: (id) => `/branch/${id}`,
      providesTags: (result, error, id) => [{ type: 'Branch', id }],
    }),

    // Создать новый филиал
    createBranch: builder.mutation<SingleBranchResponse, CreateBranchRequest>({
      query: (branchData) => ({
        url: "/branch",
        method: "POST",
        body: branchData,
      }),
      invalidatesTags: ['Branch'],
    }),

    // Обновить филиал
    updateBranch: builder.mutation<SingleBranchResponse, { id: number; branchData: UpdateBranchRequest }>({
      query: ({ id, branchData }) => ({
        url: `/branch/${id}`,
        method: "PUT",
        body: branchData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Branch', id },
        'Branch',
      ],
    }),

    // Удалить филиал
    deleteBranch: builder.mutation<void, number>({
      query: (id) => ({
        url: `/branch/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Branch', id },
        'Branch',
      ],
    }),
  }),
});

export const {
  useGetAllBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;
