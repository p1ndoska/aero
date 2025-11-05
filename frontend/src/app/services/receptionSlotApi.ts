import { api } from "./api";
import type { 
  ReceptionSlot, 
  CreateSlotsRequest, 
  BookSlotRequest, 
  ReceptionSlotsResponse,
  RecurringScheduleTemplate,
  CreateRecurringScheduleRequest,
  CreateRecurringScheduleResponse
} from "@/types/management";

export const receptionSlotApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Получить слоты для руководителя
    getSlotsByManager: builder.query<ReceptionSlot[], { managementId: number; startDate?: string; endDate?: string }>({
      query: ({ managementId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const queryString = params.toString();
        return `/reception-slots/${managementId}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { managementId }) => [
        { type: 'ReceptionSlot', id: managementId },
        { type: 'ReceptionSlot', id: 'LIST' }
      ],
    }),

    // Создать слоты для руководителя
    createSlots: builder.mutation<ReceptionSlotsResponse, { managementId: number; data: CreateSlotsRequest }>({
      query: ({ managementId, data }) => ({
        url: `/reception-slots/${managementId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { managementId }) => [
        { type: 'ReceptionSlot', id: managementId },
        { type: 'ReceptionSlot', id: 'LIST' }
      ],
    }),

    // Забронировать слот
    bookSlot: builder.mutation<{ message: string; slot: ReceptionSlot }, { slotId: number; data: BookSlotRequest }>({
      query: ({ slotId, data }) => ({
        url: `/reception-slots/${slotId}/book`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { slotId }) => {
        // Инвалидируем только при успешном бронировании, чтобы избежать лишних refetch
        if (!error && result && result.slot) {
          const managementId = result.slot.managementId;
          return [
            { type: 'ReceptionSlot', id: slotId },
            { type: 'ReceptionSlot', id: managementId }, // Инвалидируем кеш для конкретного руководителя
            { type: 'ReceptionSlot', id: 'LIST' },
            { type: 'ReceptionSlot', id: 'ALL_BOOKED' }
          ];
        }
        return [];
      },
    }),

    // Отменить бронирование
    cancelBooking: builder.mutation<{ message: string; slot: ReceptionSlot }, number>({
      query: (slotId) => ({
        url: `/reception-slots/${slotId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, slotId) => [
        { type: 'ReceptionSlot', id: slotId },
        { type: 'ReceptionSlot', id: 'LIST' },
        { type: 'ReceptionSlot', id: 'ALL_BOOKED' }
      ],
    }),

    // Удалить слоты
    deleteSlots: builder.mutation<{ message: string; deletedCount: number }, { managementId: number; data: { date: string; startTime?: string; endTime?: string } }>({
      query: ({ managementId, data }) => ({
        url: `/reception-slots/${managementId}`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: (result, error, { managementId }) => [
        { type: 'ReceptionSlot', id: managementId },
        { type: 'ReceptionSlot', id: 'LIST' }
      ],
    }),

    // Получить забронированные слоты (для администратора)
    getBookedSlots: builder.query<ReceptionSlot[], { managementId: number; startDate?: string; endDate?: string }>({
      query: ({ managementId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const queryString = params.toString();
        return `/reception-slots/${managementId}/booked${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { managementId }) => [
        { type: 'ReceptionSlot', id: managementId },
        { type: 'ReceptionSlot', id: 'BOOKED' }
      ],
    }),

    // Создать повторяющееся расписание
    createRecurringSchedule: builder.mutation<CreateRecurringScheduleResponse, { managementId: number; data: CreateRecurringScheduleRequest }>({
      query: ({ managementId, data }) => ({
        url: `/reception-slots/${managementId}/recurring`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { managementId }) => [
        { type: 'ReceptionSlot', id: managementId },
        { type: 'ReceptionSlot', id: 'LIST' },
        { type: 'RecurringTemplate', id: managementId }
      ],
    }),

    // Получить шаблоны повторяющегося расписания
    getRecurringTemplates: builder.query<RecurringScheduleTemplate[], number>({
      query: (managementId) => `/reception-slots/${managementId}/recurring-templates`,
      providesTags: (result, error, managementId) => [
        { type: 'RecurringTemplate', id: managementId }
      ],
    }),

    // Получить все забронированные слоты (для админ панели)
    getAllBookedSlots: builder.query<ReceptionSlot[], { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const queryString = params.toString();
        return `/reception-slots/all/booked${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: [{ type: 'ReceptionSlot', id: 'ALL_BOOKED' }],
    }),

    // Удалить шаблон повторяющегося расписания
    deleteRecurringTemplate: builder.mutation<{ message: string }, string>({
      query: (templateId) => ({
        url: `/reception-slots/recurring-templates/${templateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, templateId) => [
        { type: 'RecurringTemplate', id: templateId },
        { type: 'ReceptionSlot', id: 'LIST' }
      ],
    }),

    // Обновить шаблон повторяющегося расписания
    updateRecurringTemplate: builder.mutation<{ message: string; template: RecurringScheduleTemplate }, { templateId: string; data: Partial<CreateRecurringScheduleRequest> & { isActive?: boolean } }>({
      query: ({ templateId, data }) => ({
        url: `/reception-slots/recurring-templates/${templateId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { templateId }) => [
        { type: 'RecurringTemplate', id: templateId },
        { type: 'ReceptionSlot', id: 'LIST' }
      ],
    }),
  }),
});

export const {
  useGetSlotsByManagerQuery,
  useCreateSlotsMutation,
  useBookSlotMutation,
  useCancelBookingMutation,
  useDeleteSlotsMutation,
  useGetBookedSlotsQuery,
  useCreateRecurringScheduleMutation,
  useGetRecurringTemplatesQuery,
  useDeleteRecurringTemplateMutation,
  useUpdateRecurringTemplateMutation,
  useGetAllBookedSlotsQuery,
} = receptionSlotApi;
