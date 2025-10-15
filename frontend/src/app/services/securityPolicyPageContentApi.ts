import { api } from './api';
import type { ContentElement } from '@/types/branch';

interface SecurityPolicyPageContent {
  id: number;
  title: string;
  titleEn?: string;
  titleBe?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleBe?: string;
  content?: ContentElement[];
  contentEn?: ContentElement[];
  contentBe?: ContentElement[];
  createdAt: string;
  updatedAt: string;
}

interface UpdateSecurityPolicyPageContentRequest {
  title: string;
  subtitle?: string;
  content?: ContentElement[];
  titleEn?: string;
  titleBe?: string;
  subtitleEn?: string;
  subtitleBe?: string;
  contentEn?: ContentElement[];
  contentBe?: ContentElement[];
}

export const securityPolicyPageContentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSecurityPolicyPageContent: builder.query<SecurityPolicyPageContent, void>({
      query: () => '/security-policy-page-content',
      providesTags: ['SecurityPolicyPageContent'],
    }),
    updateSecurityPolicyPageContent: builder.mutation<SecurityPolicyPageContent, UpdateSecurityPolicyPageContentRequest>({
      query: (body) => ({
        url: '/security-policy-page-content',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SecurityPolicyPageContent'],
    }),
  }),
});

export const { useGetSecurityPolicyPageContentQuery, useUpdateSecurityPolicyPageContentMutation } = securityPolicyPageContentApi;
