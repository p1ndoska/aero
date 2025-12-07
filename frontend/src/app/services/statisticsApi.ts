import { api } from './api';

interface Statistics {
  overview: {
    totalUsers: number;
    totalNews: number;
    totalVacancies: number;
    activeVacancies: number;
    totalBranches: number;
    totalManagement: number;
    totalServiceRequests: number;
    totalCategories: number;
    totalRoles: number;
  };
  usersByRole: Record<string, number>;
  requestsByStatus: Record<string, number>;
  newsByCategory: Array<{
    categoryName: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    role: {
      name: string;
    };
  }>;
  recentNews: Array<{
    id: number;
    title: string;
    createdAt: string;
    category: {
      name: string;
    };
  }>;
}

export const statisticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStatistics: builder.query<Statistics, void>({
      query: () => '/statistics',
      providesTags: ['Statistics'],
    }),
  }),
});

export const { useGetStatisticsQuery } = statisticsApi;

