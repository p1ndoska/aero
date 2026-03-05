import { api } from './api';

interface DynamicFormSubmissionRequest {
  formName?: string;
  pageUrl?: string;
  data: Record<string, any>;
}

interface DynamicFormSubmissionResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const formSubmissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitDynamicForm: builder.mutation<DynamicFormSubmissionResponse, DynamicFormSubmissionRequest>({
      query: (body) => ({
        url: '/dynamic-form-submission',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSubmitDynamicFormMutation } = formSubmissionApi;


