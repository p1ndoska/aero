import { motion } from "framer-motion";
import { useNews } from './hooks/useNews';
import { NewsList } from './components/NewsList';
import { useLanguage } from './contexts/LanguageContext';
import { useGetAllOrganizationLogosQuery } from './app/services/organizationLogoApi';
import { useGetCurrentHeroImageQuery } from './app/services/heroImageApi';
import { useForceStyles } from './hooks/useForceStyles';
import BranchesCarousel from './components/BranchesCarousel';
import LogosCarousel from './components/LogosCarousel';
import { BASE_URL } from './constants';

const App = () => {
    const { news, loading, error } = useNews();
    const { t, language } = useLanguage();
    const { data: organizationLogos, isLoading: logosLoading } = useGetAllOrganizationLogosQuery();
    const { data: heroImage } = useGetCurrentHeroImageQuery();
    
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
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-20"
                            style={{ backgroundImage: `url('${BASE_URL}${heroImage.imageUrl}')` }}
                        />
                    ) : (
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-20"
                            style={{ backgroundImage: "url('/sky-bg.jpg')" }}
                        />
                    )}
                    
                    {/* Контент поверх изображения */}
                    <div className="relative z-10 flex items-center justify-center h-full p-6 bg-white">
                        <img src='/Group5.png'/>
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
                className="md:w-1/3 w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 min-h-[200px] flex flex-col"
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('news')}</h2>

                {loading && <p className="text-gray-500">{t('loading')}</p>}
                {error && <p className="text-red-500">{t('error')}: {error}</p>}
                {!loading && !error && <NewsList newsItems={news} />}
            </motion.div>
        </div>
    );
};

export default App;