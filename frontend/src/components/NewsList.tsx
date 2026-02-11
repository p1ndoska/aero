import type { NewsItem } from "@/types/News.ts";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

interface NewsListProps {
    newsItems: NewsItem[];
    /**
     * Базовое количество новостей, которое хотим показывать минимум.
     * Фактическое количество динамически подстраивается под высоту экрана.
     */
    baseItemsPerPage?: number;
}

export const NewsList = ({ newsItems, baseItemsPerPage = 3 }: NewsListProps) => {
    const [startIndex, setStartIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(baseItemsPerPage);
    const { t } = useLanguage();
    const listContainerRef = useRef<HTMLDivElement | null>(null);
    const firstCardRef = useRef<HTMLDivElement | null>(null);

    // Динамически подстраиваем количество новостей под реальную высоту блока,
    // чтобы карточки ровно заполняли доступное пространство по высоте.
    useEffect(() => {
        const calculateItemsPerPage = () => {
            const container = listContainerRef.current;
            const firstCard = firstCardRef.current;

            if (!container || !firstCard) return;

            const containerHeight = container.clientHeight;
            const cardHeight = firstCard.clientHeight;

            if (!cardHeight || containerHeight <= 0) return;

            // Фактор, позволяющий чуть плотнее упаковать карточки и минимизировать пустое место
            const safetyFactor = 0.97;
            const effectiveCardHeight = cardHeight * safetyFactor;

            const dynamicCount = Math.max(
                baseItemsPerPage,
                Math.ceil(containerHeight / effectiveCardHeight)
            );

            // Ограничиваем сверху на всякий случай
            const clampedCount = Math.min(dynamicCount, 10);

            setItemsPerPage(clampedCount);

            // Если мы в конце списка и новое количество меньше, чем было,
            // подвинем стартовый индекс, чтобы не было пустоты.
            setStartIndex((prev) => {
                const maxStart = Math.max(0, newsItems.length - clampedCount);
                return Math.min(prev, maxStart);
            });
        };

        calculateItemsPerPage();
        window.addEventListener("resize", calculateItemsPerPage);

        return () => {
            window.removeEventListener("resize", calculateItemsPerPage);
        };
    }, [baseItemsPerPage, newsItems.length]);

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
            <div
                ref={listContainerRef}
                className="relative overflow-hidden flex-1 pt-2 pb-4 space-y-6"
            >
                {visibleItems.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === visibleItems.length - 1;

                    return (
                        <AnimatePresence key={item.id} mode="popLayout">
                            <motion.div
                                ref={isFirst ? firstCardRef : undefined}
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
