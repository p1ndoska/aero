import { api } from "./api";
import type { Vacancy, VacancyApplication } from "../../types/vacancy";

export const vacancyApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Получение всех вакансий
        getAllVacancies: builder.query<Vacancy[], { active?: boolean }>({
            query: (params) => ({
                url: "/vacancies",
                params,
            }),
        }),

        // Получение вакансии по ID
        getVacancyById: builder.query<Vacancy, number>({
            query: (id) => `/vacancies/${id}`,
        }),

        // Создание вакансии
        createVacancy: builder.mutation<Vacancy, any>({
            query: (data) => ({
                url: "/vacancies",
                method: "POST",
                body: data,
            }),
        }),

        // Обновление вакансии
        updateVacancy: builder.mutation<Vacancy, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/vacancies/${id}`,
                method: "PUT",
                body: data,
            }),
        }),

        // Удаление вакансии
        deleteVacancy: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/vacancies/${id}`,
                method: "DELETE",
            }),
        }),

        // Создание отклика на вакансию
        createApplication: builder.mutation<VacancyApplication, FormData>({
            query: (formData) => ({
                url: "/vacancy-applications",
                method: "POST",
                body: formData,
            }),
        }),

        // Получение всех откликов
        getAllApplications: builder.query<VacancyApplication[], { vacancyId?: number; status?: string }>({
            query: (params) => ({
                url: "/vacancy-applications",
                params,
            }),
        }),

        // Получение отклика по ID
        getApplicationById: builder.query<VacancyApplication, number>({
            query: (id) => `/vacancy-applications/${id}`,
        }),

        // Обновление статуса отклика
        updateApplicationStatus: builder.mutation<VacancyApplication, { id: number; status: string }>({
            query: ({ id, status }) => ({
                url: `/vacancy-applications/${id}/status`,
                method: "PUT",
                body: { status },
            }),
        }),

        // Удаление отклика
        deleteApplication: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/vacancy-applications/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetAllVacanciesQuery,
    useGetVacancyByIdQuery,
    useCreateVacancyMutation,
    useUpdateVacancyMutation,
    useDeleteVacancyMutation,
    useCreateApplicationMutation,
    useGetAllApplicationsQuery,
    useGetApplicationByIdQuery,
    useUpdateApplicationStatusMutation,
    useDeleteApplicationMutation,
} = vacancyApi;

