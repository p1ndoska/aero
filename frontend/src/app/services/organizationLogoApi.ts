import { api } from './api';

interface OrganizationLogo {
  id: number;
  name: string;
  nameEn?: string;
  nameBe?: string;
  logoUrl: string;
  internalPath?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateOrganizationLogoRequest {
  name: string;
  nameEn?: string;
  nameBe?: string;
  logoUrl: string;
  internalPath?: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface UpdateOrganizationLogoRequest extends CreateOrganizationLogoRequest {}

interface UpdateLogosOrderRequest {
  logos: Array<{ id: number; sortOrder: number }>;
}

export const organizationLogoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrganizationLogos: builder.query<OrganizationLogo[], void>({
      query: () => '/organization-logos',
      providesTags: ['OrganizationLogo'],
      refetchOnMountOrArgChange: true,
    }),
    getOrganizationLogo: builder.query<OrganizationLogo, number>({
      query: (id) => `/organization-logos/${id}`,
      providesTags: (result, error, id) => [{ type: 'OrganizationLogo', id }],
    }),
    createOrganizationLogo: builder.mutation<OrganizationLogo, CreateOrganizationLogoRequest>({
      query: (body) => ({
        url: '/organization-logos',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OrganizationLogo'],
    }),
    updateOrganizationLogo: builder.mutation<OrganizationLogo, { id: number; body: UpdateOrganizationLogoRequest }>({
      query: ({ id, body }) => ({
        url: `/organization-logos/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'OrganizationLogo', id }, 'OrganizationLogo'],
    }),
    deleteOrganizationLogo: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/organization-logos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrganizationLogo'],
    }),
    updateLogosOrder: builder.mutation<{ message: string }, UpdateLogosOrderRequest>({
      query: (body) => ({
        url: '/organization-logos/order',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['OrganizationLogo'],
    }),
  }),
});

export const { 
  useGetAllOrganizationLogosQuery,
  useGetOrganizationLogoQuery,
  useCreateOrganizationLogoMutation,
  useUpdateOrganizationLogoMutation,
  useDeleteOrganizationLogoMutation,
  useUpdateLogosOrderMutation
} = organizationLogoApi;
