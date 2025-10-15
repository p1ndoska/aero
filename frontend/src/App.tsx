import { motion } from "framer-motion";
import { useNews } from './hooks/useNews';
import { NewsList } from './components/NewsList';
import { useLanguage } from './contexts/LanguageContext';
import { useGetAllOrganizationLogosQuery } from './app/services/organizationLogoApi';
import { getTranslatedField } from './utils/translationHelpers';
import { Link } from 'react-router-dom';

const App = () => {
    const { news, loading, error } = useNews();
    const { t, language } = useLanguage();
    const { data: organizationLogos, isLoading: logosLoading } = useGetAllOrganizationLogosQuery();

    return (
        <div
            className="App min-h-screen flex flex-col md:flex-row bg-cover bg-center p-4 gap-4"
            style={{ backgroundImage: "url('/bg-sky.jpg')" }}
        >
            {/* Левый блок (2/3) поделен на 3 части */}
            <div className="md:w-2/3 w-full flex flex-col gap-4 md:pr-4">
                {/* Верхний блок (2/4) */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex-[2] bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md overflow-hidden min-h-[150px] relative"
                >
                    {/* Фоновое изображение */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: "url('/sky-bg.jpg')" }}
                    />
                    
                    {/* Контент поверх изображения */}
                    <div className="relative z-10 flex items-center justify-center h-full p-6 bg-white">
                        <img src='/Group5.png'/>
                    </div>
                </motion.div>

                {/* Средний блок (1/4) */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                    className="flex-1 bg-gray-200 rounded-2xl shadow-md flex items-center justify-center min-h-[100px]"
                >
                    <p className="text-gray-700 text-center">{t('left_middle_block')} (1/4)</p>
                </motion.div>

                {/* Нижний блок (1/4) - Логотипы организаций */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                    className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-6 min-h-[150px]"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                        {language === 'en' ? 'Social and ideological work' : language === 'be' ? 'Сацыяльная і ідэалагічная праца' : 'Социальная и идеологическая работа'}
                    </h3>
                    
                    {logosLoading ? (
                        <div className="flex items-center justify-center h-16">
                            <p className="text-gray-500">{t('loading')}</p>
                        </div>
                    ) : organizationLogos && organizationLogos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {organizationLogos.slice(0, 8).map((logo) => (
                                <div key={logo.id} className="flex flex-col items-center">
                                    {logo.internalPath && logo.internalPath !== "" ? (
                                        <Link
                                            to={logo.internalPath}
                                            className="flex flex-col items-center hover:opacity-80 transition-opacity w-full"
                                        >
                                            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm mb-2 p-2">
                                                <img
                                                    src={logo.logoUrl}
                                                    alt={getTranslatedField(logo, 'name', language)}
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-600 text-center break-words leading-tight">
                                                {getTranslatedField(logo, 'name', language)}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="flex flex-col items-center w-full">
                                            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm mb-2 p-2">
                                                <img
                                                    src={logo.logoUrl}
                                                    alt={getTranslatedField(logo, 'name', language)}
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-600 text-center break-words leading-tight">
                                                {getTranslatedField(logo, 'name', language)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-16">
                            <p className="text-gray-500 text-center">
                                {language === 'en' ? 'No organizations yet' :
                                 language === 'be' ? ' арганізацый пакуль няма' :
                                 'организации пока не добавлены'}
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Правый блок (1/3 монолитный) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="md:w-1/3 w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 min-h-[200px]"
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