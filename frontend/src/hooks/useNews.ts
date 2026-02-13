import { useState, useEffect } from "react";
import type { NewsItem } from "@/types/News.ts";
import { BASE_URL } from "@/constants";

export const useNews = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/news`);
                if (!response.ok) throw new Error("Не удалось загрузить новости");

                const data: NewsItem[] = await response.json();
                console.log('API Response:', data); // Логируем ответ API
                console.log('Data type:', typeof data);
                console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
                if (Array.isArray(data) && data.length > 0) {
                    console.log('First item:', data[0]);
                }
                setNews(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Ошибка");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return { news, loading, error };
};