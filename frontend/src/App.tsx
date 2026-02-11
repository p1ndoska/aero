import { motion } from "framer-motion";
import { useNews } from './hooks/useNews';
import { NewsList } from './components/NewsList';
import { useLanguage } from './contexts/LanguageContext';
import { useGetAllOrganizationLogosQuery } from './app/services/organizationLogoApi';
import { useGetCurrentHeroImageQuery } from './app/services/heroImageApi';
import { useEffect, useState } from 'react';
import { useForceStyles } from './hooks/useForceStyles';
import BranchesCarousel from './components/BranchesCarousel';
import LogosCarousel from './components/LogosCarousel';
import { BASE_URL } from './constants';

const App = () => {
    const { news, loading, error } = useNews();
    const { t, language } = useLanguage();
    const { data: organizationLogos, isLoading: logosLoading } = useGetAllOrganizationLogosQuery();
    const { data: heroImage, refetch: refetchHeroImage } = useGetCurrentHeroImageQuery(undefined, {
        // Принудительно обновляем запрос при монтировании
        refetchOnMountOrArgChange: true,
        // Обновляем каждые 30 секунд (на случай, если изображение изменилось)
        pollingInterval: 30000,
    });
    const [imageKey, setImageKey] = useState(0);
    const [imageTimestamp, setImageTimestamp] = useState(Date.now());
    
    // Принудительно обновляем изображение при изменении heroImage
    useEffect(() => {
        if (heroImage?.hasImage && heroImage.imageUrl) {
            const newTimestamp = Date.now();
            setImageKey(prev => prev + 1);
            setImageTimestamp(newTimestamp);
            console.log('Hero image обновлен в App.tsx:', heroImage.imageUrl);
            console.log('Новый timestamp:', newTimestamp);
        }
    }, [heroImage?.imageUrl, heroImage?.hasImage]);
    
    // Слушаем события обновления изображения (для синхронизации между компонентами)
    useEffect(() => {
        const handleImageUpdate = () => {
            console.log('Событие обновления hero image получено');
            // Принудительно обновляем timestamp и key при получении события
            setImageTimestamp(Date.now());
            setImageKey(prev => prev + 1);
            // Также обновляем данные из API
            setTimeout(() => {
                refetchHeroImage();
            }, 100);
        };
        
        window.addEventListener('heroImageUpdated', handleImageUpdate);
        return () => {
            window.removeEventListener('heroImageUpdated', handleImageUpdate);
        };
    }, [refetchHeroImage]);
    
    // Глобальное применение стилей на всех страницах
    useForceStyles();

    return (
        <div
            className="App min-h-screen flex flex-col md:flex-row md:items-stretch bg-cover bg-center p-4 gap-4"
            style={{ backgroundImage: "url('/bg-sky.jpg')" }}
        >
            {/* Левый блок (2/4) поделен на 3 части */}
            <div className="md:w-2/3 w-full flex flex-col gap-4 md:pr-4 md:h-auto">
                {/* Верхний блок (2/4) */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md overflow-hidden h-[450px] relative"
                >
                    {/* Фоновое изображение */}
                    {heroImage?.hasImage && heroImage.imageUrl ? (
                        <img
                            key={`hero-img-${imageKey}-${imageTimestamp}`}
                            src={`${BASE_URL}${heroImage.imageUrl.startsWith('/') ? '' : '/'}${heroImage.imageUrl}?t=${imageTimestamp}&v=${imageKey}`}
                            alt="Hero background"
                            className="absolute inset-0 w-full h-full object-cover opacity-20"
                            style={{ 
                                imageRendering: 'auto',
                            }}
                            onError={(e) => {
                                console.error('Ошибка загрузки hero image в App.tsx:', heroImage.imageUrl);
                                console.error('Полный URL:', `${BASE_URL}${heroImage.imageUrl.startsWith('/') ? '' : '/'}${heroImage.imageUrl}?t=${imageTimestamp}&v=${imageKey}`);
                            }}
                            onLoad={(e) => {
                                console.log('Hero image загружено в App.tsx:', heroImage.imageUrl);
                                console.log('Timestamp:', imageTimestamp, 'Key:', imageKey);
                            }}
                            onLoadStart={() => {
                                console.log('Начало загрузки hero image');
                            }}
                        />
                    ) : (
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-20"
                            style={{ backgroundImage: "url('/sky-bg.jpg')" }}
                        />
                    )}
                    
                    {/* Контент поверх изображения - карта или hero image */}
                    <div className="relative z-10 flex items-center justify-center h-full p-6 bg-white">
                        {heroImage?.hasImage && heroImage.imageUrl ? (
                            <img 
                                key={`hero-map-${imageKey}-${imageTimestamp}`}
                                src={`${BASE_URL}${heroImage.imageUrl.startsWith('/') ? '' : '/'}${heroImage.imageUrl}?t=${imageTimestamp}&v=${imageKey}`}
                                alt="Map"
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                    console.error('Ошибка загрузки hero image (карта) в App.tsx:', heroImage.imageUrl);
                                    // Fallback на старую карту при ошибке
                                    e.currentTarget.src = '/Group5.png';
                                }}
                                onLoad={() => {
                                    console.log('Hero image (карта) загружено в App.tsx:', heroImage.imageUrl);
                                }}
                            />
                        ) : (
                            <img src='/Group5.png' alt="Map" className="max-w-full max-h-full object-contain"/>
                        )}
                    </div>
                </motion.div>

                {/* Средний блок (1/4) - Карусель филиалов */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                >
                    <BranchesCarousel />
                </motion.div>

                   {/* Нижний блок (1/4) - Логотипы организаций */}
                   <motion.div
                       initial={{ y: 50, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                       className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-6 flex-1 flex flex-col"
                   >
                    <div className="flex justify-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 text-center">
                            {language === 'en' ? 'Social and ideological work' : language === 'be' ? 'Сацыяльная і ідэалагічная праца' : 'Социальная и идеологическая работа'}
                        </h3>
                    </div>
                    
                    <LogosCarousel 
                        logos={organizationLogos || []} 
                        loading={logosLoading} 
                    />
                </motion.div>
            </div>

            {/* Правый блок (1/3 монолитный) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="md:w-1/3 w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 min-h-[200px] flex flex-col h-full"
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('news')}</h2>

                {loading && <p className="text-gray-500">{t('loading')}</p>}
                {error && <p className="text-red-500">{t('error')}: {error}</p>}
                {!loading && !error && <NewsList newsItems={news} baseItemsPerPage={3} />}
            </motion.div>
        </div>
    );
};

export default App;