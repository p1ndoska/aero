import { BASE_URL } from '@/constants';

export interface QuestionnaireData {
  userAddress: string;
  userName?: string;
  phone: string;
  email: string;
  phraseologyQuality: string;
  informationTimeliness: string;
  equipmentQuality: string;
  proceduresQuality: string;
  satisfactionReasons?: string;
  suggestions?: string;
  completionDate: string;
  antispamCode: string;
}

export const questionnaireService = {
  async sendQuestionnaire(data: QuestionnaireData) {
    const response = await fetch(`${BASE_URL}/api/questionnaire/send-questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при отправке анкеты');
    }

    return response.json();
  },
};
