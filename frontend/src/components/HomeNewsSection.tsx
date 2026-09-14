import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetAllNewsQuery } from '@/app/services/newsApi';
import type { NewsItem } from '@/types/News';
import { getTranslatedField } from '@/utils/translationHelpers';
import { BASE_URL } from '@/constants';
import { ContentContainer } from '@/components/ContentContainer';

const NEWS_PER_VIEW = 3;

const getImageUrl = (photo: string | null) => {
    if (!photo) return undefined;
    return `${BASE_URL}${photo.startsWith('/') ? photo : `/${photo}`}`;
};

const getExcerpt = (content: string | null) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 150 ? `${text.slice(0, 150).trim()}…` : text;
};

const NewsCard = ({ news, language }: { news: NewsItem; language: string }) => {
    const title = getTranslatedField(news, 'name', language) || news.name;
    const excerpt = getTranslatedField(news, 'content', language) || news.content;
    const imageUrl = getImageUrl(news.photo);

    return (
        <article className="home-news-card">
            <Link to={`/news/${news.id}`} className="home-news-card__image-link">
                {imageUrl ? (
                    <img className="home-news-card__image" src={imageUrl} alt={title} />
                ) : (
                    <div className="home-news-card__image-fallback" aria-hidden="true" />
                )}
            </Link>
            <div className="home-news-card__content">
                <h3 className="home-news-card__title">
                    <Link to={`/news/${news.id}`}>{title}</Link>
                </h3>
                <time className="home-news-card__date" dateTime={news.createdAt}>
                    {new Date(news.createdAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'be' ? 'be-BY' : 'en-US')}
                </time>
                <p className="home-news-card__excerpt">{getExcerpt(excerpt)}</p>
                <Link to={`/news/${news.id}`} className="home-news-card__link">
                    {language === 'en' ? 'Read more' : language === 'be' ? 'Чытаць далей' : 'Подробнее'} <span aria-hidden="true">›</span>
                </Link>
            </div>
        </article>
    );
};

export const HomeNewsSection = () => {
    const { language, t } = useLanguage();
    const { data: news = [], isLoading } = useGetAllNewsQuery();
    const [startIndex, setStartIndex] = useState(0);
    const maxStartIndex = Math.max(0, news.length - NEWS_PER_VIEW);

    if (!isLoading && news.length === 0) return null;

    return (
        <section className="home-news" aria-labelledby="home-news-title">
            <ContentContainer>
                <div className="home-news__header">
                    <h2 id="home-news-title" className="home-news__title">{t('news')}</h2>
                    <Link to="/news" className="home-news__all-link">
                        {t('all_news')} <span aria-hidden="true">›</span>
                    </Link>
                </div>
                {isLoading ? (
                    <div className="home-news__loading">{language === 'en' ? 'Loading news…' : language === 'be' ? 'Загрузка навін…' : 'Загрузка новостей…'}</div>
                ) : (
                    <div className="home-news__carousel">
                        <button
                            type="button"
                            className="home-news__arrow"
                            onClick={() => setStartIndex((index) => Math.max(0, index - 1))}
                            disabled={startIndex === 0}
                            aria-label={language === 'en' ? 'Previous news' : 'Предыдущие новости'}
                        >
                            <ChevronLeft aria-hidden="true" />
                        </button>
                        <div className="home-news__cards">
                            {news.slice(startIndex, startIndex + NEWS_PER_VIEW).map((item) => (
                                <NewsCard key={item.id} news={item} language={language} />
                            ))}
                        </div>
                        <button
                            type="button"
                            className="home-news__arrow"
                            onClick={() => setStartIndex((index) => Math.min(maxStartIndex, index + 1))}
                            disabled={startIndex >= maxStartIndex}
                            aria-label={language === 'en' ? 'Next news' : 'Следующие новости'}
                        >
                            <ChevronRight aria-hidden="true" />
                        </button>
                    </div>
                )}
            </ContentContainer>
        </section>
    );
};
