export interface Vacancy {
  id: number;
  title: string;
  titleEn?: string | null;
  titleBe?: string | null;
  description: string;
  descriptionEn?: string | null;
  descriptionBe?: string | null;
  requirements?: string | null;
  requirementsEn?: string | null;
  requirementsBe?: string | null;
  conditions?: string | null;
  conditionsEn?: string | null;
  conditionsBe?: string | null;
  salary?: string | null;
  salaryEn?: string | null;
  salaryBe?: string | null;
  location?: string | null;
  locationEn?: string | null;
  locationBe?: string | null;
  employmentType?: string | null;
  employmentTypeEn?: string | null;
  employmentTypeBe?: string | null;
  content?: any | null;
  images: string[];
  files: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applications?: VacancyApplication[];
}

export interface VacancyApplication {
  id: number;
  vacancyId: number;
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  status: 'NEW' | 'VIEWED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  vacancy?: {
    id: number;
    title: string;
  };
}

export interface VacancyFormData {
  title: string;
  titleEn?: string;
  titleBe?: string;
  description: string;
  descriptionEn?: string;
  descriptionBe?: string;
  requirements?: string;
  requirementsEn?: string;
  requirementsBe?: string;
  conditions?: string;
  conditionsEn?: string;
  conditionsBe?: string;
  salary?: string;
  salaryEn?: string;
  salaryBe?: string;
  location?: string;
  locationEn?: string;
  locationBe?: string;
  employmentType?: string;
  employmentTypeEn?: string;
  employmentTypeBe?: string;
  content?: any;
  images?: string[];
  files?: string[];
  isActive?: boolean;
}

export interface ApplicationFormData {
  vacancyId: number;
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  resume?: File;
}

