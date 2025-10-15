export interface NewsCategory {
    id: number;
    name: string;
    nameEn?: string;
    nameBe?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NewsItem {
    id: number;
    name: string;
    nameEn?: string;
    nameBe?: string;
    content: string | null;
    contentEn?: string | null;
    contentBe?: string | null;
    photo: string | null;
    images: string[]; // Массив путей к дополнительным изображениям
    createdAt: string;
    updatedAt: string;
    categoryId: number;
    newsCategory: NewsCategory;
}

