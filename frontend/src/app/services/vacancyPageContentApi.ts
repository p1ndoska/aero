import { api } from "./api";

export interface VacancyPageContent {
    id: number;
    title: string;
    subtitle?: string | null;
    content?: any;
    createdAt: string;
    updatedAt: string;
}

export const vacancyPageContentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Получение контента страницы вакансий
        getVacancyPageContent: builder.query<VacancyPageContent, void>({
            query: () => "/vacancy-page-content",
        }),

        // Обновление контента страницы вакансий
        updateVacancyPageContent: builder.mutation<VacancyPageContent, Partial<VacancyPageContent>>({
            query: (data) => ({
                url: "/vacancy-page-content",
                method: "PUT",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetVacancyPageContentQuery,
    useUpdateVacancyPageContentMutation,
} = vacancyPageContentApi;

