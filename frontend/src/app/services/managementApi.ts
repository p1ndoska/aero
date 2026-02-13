import { api } from "./api";
import type { 
  Management, 
  CreateManagementRequest, 
  UpdateManagementRequest, 
  ManagementResponse, 
  SingleManagementResponse,
  AvailableSlotsResponse,
  UpdateManagersOrderRequest
} from "@/types/management";

export const managementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получить всех руководителей
    getAllManagers: builder.query<ManagementResponse, void>({
      query: () => "/management",
    }),

    // Получить руководителя по ID
    getManagerById: builder.query<SingleManagementResponse, number>({
      query: (id) => `/management/${id}`,
    }),

    // Создать нового руководителя
    createManager: builder.mutation<SingleManagementResponse, CreateManagementRequest>({
      query: (managerData) => ({
        url: "/management/create",
        method: "POST",
        body: managerData,
      }),
    }),

    // Обновить руководителя
    updateManager: builder.mutation<SingleManagementResponse, { id: number; managerData: UpdateManagementRequest }>({
      query: ({ id, managerData }) => ({
        url: `/management/${id}`,
        method: "PUT",
        body: managerData,
      }),
    }),

    // Удалить руководителя
    deleteManager: builder.mutation<void, number>({
      query: (id) => ({
        url: `/management/${id}`,
        method: "DELETE",
      }),
    }),

    // Получить доступные слоты для записи на прием
    getAvailableSlots: builder.query<AvailableSlotsResponse, { id: number; startDate?: string; endDate?: string }>({
      query: ({ id, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const queryString = params.toString();
        return `/management/${id}/available-slots${queryString ? `?${queryString}` : ''}`;
      },
    }),

    // Обновить порядок сортировки руководителей
    updateManagersOrder: builder.mutation<{ message: string; updated: number }, UpdateManagersOrderRequest>({
      query: (orderData) => ({
        url: "/management/order",
        method: "PUT",
        body: orderData,
      }),
    }),
  }),
});

export const {
  useGetAllManagersQuery,
  useGetManagerByIdQuery,
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
  useGetAvailableSlotsQuery,
  useUpdateManagersOrderMutation,
} = managementApi;


