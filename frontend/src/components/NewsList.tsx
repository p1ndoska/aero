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

    // Динамически подстраиваем количество новостей под высоту экрана,
    // чтобы карточки занимали всю доступную высоту (от первой до нижней стрелки).
    useEffect(() => {
        const calculateItemsPerPage = () => {
            if (typeof window === "undefined") return;

            const container = listContainerRef.current;
            const firstCard = firstCardRef.current;

            if (!container || !firstCard) return;

            const containerRect = container.getBoundingClientRect();
            const cardRect = firstCard.getBoundingClientRect();

            const cardHeight = cardRect.height;

            if (!cardHeight) return;

            // Высота экрана
            const viewportHeight = window.innerHeight;

            // Оставляем немного места под нижнюю стрелку и паддинги
            const bottomReserve = 56; // px

            // Доступная высота от верхней границы контейнера до низа экрана
            const availableHeight = viewportHeight - containerRect.top - bottomReserve;

            if (availableHeight <= 0) return;

            const dynamicCount = Math.max(
                baseItemsPerPage,
                Math.ceil(availableHeight / cardHeight)
            );

            setItemsPerPage(dynamicCount);

            // Если мы в конце списка и новое количество меньше, чем было,
            // подвинем стартовый индекс, чтобы не было пустоты.
            setStartIndex((prev) => {
                const maxStart = Math.max(0, newsItems.length - dynamicCount);
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

    const maxStartIndex = Math.max(0, newsItems.length - itemsPerPage);
    const clampedStartIndex = Math.min(startIndex, maxStartIndex);
    const visibleItems = newsItems.slice(clampedStartIndex, clampedStartIndex + itemsPerPage);

    const canScrollUp = clampedStartIndex > 0;
    const canScrollDown = clampedStartIndex < maxStartIndex;

    const scrollDown = () => {
        if (canScrollDown) {
            setStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
        }
    };

    const scrollUp = () => {
        if (canScrollUp) setStartIndex((prev) => Math.max(prev - 1, 0));
    };

    const scrollToTop = () => {
        setStartIndex(0);
    };

    return (
        <div className="relative space-y-2 flex-1 h-full flex flex-col">
            {/* Новости */}
            <div
                ref={listContainerRef}
                className="relative overflow-hidden flex-1 h-full pt-1 pb-1 space-y-4"
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
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-white shadow-md  rounded-full p-2 hover:bg-gray-100 transition"
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
