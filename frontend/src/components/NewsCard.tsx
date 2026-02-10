import type { NewsItem } from "@/types/News.ts";
import {BASE_URL} from "@/constants";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslatedField } from "../utils/translationHelpers";
import { Link } from "react-router-dom";

export const NewsCard = ({news}:{news:NewsItem})=>{
    const { language, t } = useLanguage();
    
    // Проверяем, что news существует и имеет нужные свойства
    if (!news) {
        console.error('NewsCard: news is undefined');
        return <div>{t('error')}: {t('no_data')}</div>;
    }

    if (!news.name) {
        console.error('NewsCard: news.name is undefined', news);
        return <div>{t('error')}: {t('no_data')}</div>;
    }

    // Получаем переведенные поля
    const translatedName = getTranslatedField(news, 'name', language);
    const translatedContent = getTranslatedField(news, 'content', language);

    return(
        <Link to={`/news/${news.id}`} className="block hover:shadow-lg transition-shadow duration-300">
            <div className='bg-white rounded-lg shadow-md overflow-hidden border border-[#213659] cursor-pointer hover:border-[#1a2a4a] transition-colors duration-300'>
                {news.photo &&(
                    <img
                        src={`${BASE_URL}${news.photo.startsWith('/') ? '' : '/'}${news.photo}`}
                        alt={translatedName}
                        className='w-full h-40 object-cover'
                        onError={(e) => {
                            console.error(' Ошибка загрузки изображения новости:', news.photo);
                            console.error(' Полный URL:', `${BASE_URL}${news.photo.startsWith('/') ? '' : '/'}${news.photo}`);
                            e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                            console.log(' Изображение новости загружено:', news.photo);
                        }}
                    />
                )}

                <div className='p-4'>
                    <h3 className='text-lg font-semibold text-[#213659] mt-2 mb-2 line-clamp-2 hover:text-[#1a2a4a] transition-colors duration-300'>
                        {translatedName}
                    </h3>
                    <p className='text-[#213659] text-sm mb-3 line-clamp-2'>
                        {translatedContent || t('no_data')}
                    </p>
                </div>
            </div>
        </Link>
    )
}