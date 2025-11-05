import type { NewsItem } from "@/types/News.ts";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

interface NewsListProps {
    newsItems: NewsItem[];
    itemsPerPage?: number;
}

export const NewsList = ({ newsItems, itemsPerPage = 3 }: NewsListProps) => {
    const [startIndex, setStartIndex] = useState(0);
    const { t } = useLanguage();

    if (newsItems.length === 0) {
        return <p className="text-[#213659]">{t('no_data')}</p>;
    }

    const visibleItems = newsItems.slice(startIndex, startIndex + itemsPerPage);

    const canScrollUp = startIndex > 0;
    const canScrollDown = startIndex + itemsPerPage < newsItems.length;

    const scrollDown = () => {
        if (canScrollDown) setStartIndex((prev) => prev + 1);
    };

    const scrollUp = () => {
        if (canScrollUp) setStartIndex((prev) => prev - 1);
    };

    const scrollToTop = () => {
        setStartIndex(0);
    };

    return (
        <div className="relative space-y-2 flex-1 flex flex-col">
            {/* Новости */}
            <div className="relative overflow-hidden flex-1 pt-2 pb-10 space-y-6">
                {visibleItems.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === visibleItems.length - 1;

                    return (
                        <AnimatePresence key={item.id} mode="popLayout">
                            <motion.div
                                initial={
                                    isLast
                                        ? { opacity: 0, y: 40 } // нижняя новость прилетает снизу
                                        : isFirst
                                            ? { opacity: 0, y: -40 } // верхняя новость прилетает сверху
                                            : false // средняя без анимации
                                }
                                animate={{ opacity: 1, y: 0 }}
                                exit={
                                    isFirst
                                        ? { opacity: 0, y: -40 } // верхняя улетает вверх
                                        : isLast
                                            ? { opacity: 0, y: 40 } // нижняя уходит вниз
                                            : {}
                                }
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                <NewsCard news={item} />
                            </motion.div>
                        </AnimatePresence>
                    );
                })}
            </div>

            {/* Кнопки "вверх/вниз" поверх новостей */}
            {canScrollUp && (
                <button
                    onClick={scrollUp}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-md  rounded-full p-2 hover:bg-gray-100 transition"
                >
                    <ChevronUp className="h-6 w-6 text-[#213659]" />
                </button>
            )}
            {canScrollDown && (
                <button
                    onClick={scrollDown}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-md  rounded-full p-2 hover:bg-gray-100 transition"
                >
                    <ChevronDown className="h-6 w-6 text-[#213659]" />
                </button>
            )}

            {/* Кнопка "К началу списка" */}
            {startIndex > 0 && (
                <div className="flex justify-center">
                    <Button
                        onClick={scrollToTop}
                        className="bg-[#213659] hover:bg-[#1a2a4a] text-white px-6 py-3 rounded-xl"
                    >
                        <ArrowUp className="h-5 w-5 mr-2" />
                        {t('to_top')}
                    </Button>
                </div>
            )}
        </div>
    );
};
