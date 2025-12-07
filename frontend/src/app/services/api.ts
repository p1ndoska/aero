//@ts-nocheck
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../store"
import { BASE_URL } from "../../constants"

const baseQuery = fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
        // Сначала пытаемся получить токен из state, затем из localStorage
        const state = getState() as RootState;
        let token = state?.auth?.token;
        
        // Если токена нет в state, пытаемся получить из localStorage
        if (!token) {
            try {
                token = localStorage.getItem("token");
            } catch (e) {
                // localStorage недоступен
            }
        }

        if (token) {
            // Убеждаемся, что заголовок устанавливается правильно
            // Удаляем пробелы и лишние символы из токена
            const cleanToken = token.trim();
            headers.set("authorization", `Bearer ${cleanToken}`);
        }
        return headers;
    },
})

// Обработка ошибок авторизации
const baseQueryWithAuth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Если получили 401, токен невалидный или истек
    if (result.error && result.error.status === 401) {
        console.error('API: Unauthorized (401) - Token may be invalid or expired');
        // Можно добавить логику для автоматического выхода пользователя
        // Например: dispatch(logout()) или window.location.href = '/login'
    }
    
    return result;
};

const baseQueryWithRetry = retry(baseQueryWithAuth, { maxRetries: 0 })

export const api = createApi({
    reducerPath: "splitApi",
    baseQuery: baseQueryWithRetry,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
           tagTypes: ['HistoryPageContent', 'News', 'Category', 'User', 'Management', 'Branch', 'Vacancy', 'SocialWorkCategory', 'AboutCompanyCategory', 'AeronauticalInfoCategory', 'AppealsCategory', 'ServicesCategory', 'SocialWorkPageContent', 'AboutCompanyPageContent', 'SecurityPolicyPageContent', 'VacancyPageContent', 'OrganizationLogo', 'ReceptionSlot', 'Role', 'Roles', 'UserProfile', 'IncidentReport', 'AeronauticalInfoPageContent', 'AppealsPageContent', 'ServicesPageContent', 'ELTDocument', 'ELTInstruction', 'Statistics'],
    endpoints: () => ({}),
})
