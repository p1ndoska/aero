import { BASE_URL } from '@/constants';

export interface VoluntaryReportData {
  fullName?: string;
  organization?: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  compilationDate: string;
  compilationTime: string;
  recurrenceProbability: string;
  consequences: string;
}

export interface VoluntaryReportResponse {
  success: boolean;
  message: string;
}

class VoluntaryReportService {
  private baseUrl = `${BASE_URL}/api/voluntary-report`;

  async sendVoluntaryReport(data: VoluntaryReportData): Promise<VoluntaryReportResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка при отправке сообщения');
      }

      return result;
    } catch (error) {
      console.error('Ошибка при отправке добровольного сообщения:', error);
      throw error;
    }
  }
}

export const voluntaryReportService = new VoluntaryReportService();
