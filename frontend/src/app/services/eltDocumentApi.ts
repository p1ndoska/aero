import { api } from './api';

export interface ELTDocument {
  documentUrl: string;
  documentName: string;
}

export interface ELTInstruction {
  instructionUrl: string;
  instructionName: string;
}

export interface UploadELTDocumentResponse {
  success: boolean;
  message: string;
  documentUrl: string;
  documentName: string;
  pageContent: any;
}

export const eltDocumentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getELTDocument: builder.query<ELTDocument | null, void>({
      query: () => '/elt-document',
      providesTags: ['ELTDocument'],
    }),
    uploadELTDocument: builder.mutation<UploadELTDocumentResponse, FormData>({
      query: (formData) => ({
        url: '/elt-document/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ELTDocument', 'ServicesPageContent'],
    }),
    deleteELTDocument: builder.mutation<void, void>({
      query: () => ({
        url: '/elt-document',
        method: 'DELETE',
      }),
      invalidatesTags: ['ELTDocument', 'ServicesPageContent'],
    }),
    getELTInstruction: builder.query<ELTInstruction | null, void>({
      query: () => '/elt-instruction',
      providesTags: ['ELTInstruction'],
    }),
    uploadELTInstruction: builder.mutation<UploadELTDocumentResponse, FormData>({
      query: (formData) => ({
        url: '/elt-instruction/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ELTInstruction', 'ServicesPageContent'],
    }),
    deleteELTInstruction: builder.mutation<void, void>({
      query: () => ({
        url: '/elt-instruction',
        method: 'DELETE',
      }),
      invalidatesTags: ['ELTInstruction', 'ServicesPageContent'],
    }),
  }),
});

export const {
  useGetELTDocumentQuery,
  useUploadELTDocumentMutation,
  useDeleteELTDocumentMutation,
  useGetELTInstructionQuery,
  useUploadELTInstructionMutation,
  useDeleteELTInstructionMutation,
} = eltDocumentApi;

