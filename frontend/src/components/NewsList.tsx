import type { NewsItem } from "@/types/News.ts";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

interface NewsListProps {
    newsItems: NewsItem[];
    baseItemsPerPage?: number;
}

export const NewsList = ({ newsItems, baseItemsPerPage = 3 }: NewsListProps) => {
    const [startIndex, setStartIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(baseItemsPerPage);
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const newsContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const container = containerRef.current;
            if (!container || newsItems.length === 0) return;

            const containerHeight = container.clientHeight;
            if (containerHeight <= 0) return;

            // Используем минимальную высоту карточки для адаптивности
            const minCardHeight = 200;
            const cardMargin = 16;
            const cardHeightWithMargin = minCardHeight + cardMargin;

            // Вычисляем доступную высоту с учетом отступов
            const arrowHeight = 56;
            const buttonHeight = startIndex > 0 ? 56 : 0;
            const topButtonHeight = canScrollUp ? 48 : 0;

            const availableHeight = containerHeight - arrowHeight - buttonHeight - topButtonHeight - 20;

            // Минимальное количество карточек
            let count = Math.max(3, Math.floor(availableHeight / cardHeightWithMargin));

            // Если контейнер очень высокий, не ограничиваемся 10 карточками
            if (containerHeight > 800) {
                count = Math.min(count + 1, newsItems.length);
            } else {
                count = Math.min(count + 1, 8);
            }

            // Убедимся, что есть место для блюра
            if (containerHeight < 400) {
                count = Math.max(2, count);
            }

            setItemsPerPage(count);

            // Корректируем стартовый индекс
            setStartIndex((prev) => {
                const maxStart = Math.max(0, newsItems.length - count);
                return Math.min(prev, maxStart);
            });
        };

        calculateItemsPerPage();
        const resizeObserver = new ResizeObserver(calculateItemsPerPage);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [baseItemsPerPage, newsItems.length, startIndex]);

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
        <div
            ref={containerRef}
            className="relative flex-1 h-full flex flex-col min-h-0"
        >
            {/* Новости */}
            <div
                ref={newsContainerRef}
                className="relative flex-1 h-full overflow-hidden pt-1 pb-16 min-h-0"
            >
                {visibleItems.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === visibleItems.length - 1;

                    return (
                        <AnimatePresence key={item.id} mode="popLayout">
                            <motion.div
                                className="mb-4 last:mb-0"
                                ref={(el) => { cardRefs.current[idx] = el; }}
                                initial={
                                    isLast
                                        ? { opacity: 0, y: 40 }
                                        : isFirst
                                            ? { opacity: 0, y: -40 }
                                            : false
                                }
                                animate={{ opacity: 1, y: 0 }}
                                exit={
                                    isFirst
                                        ? { opacity: 0, y: -40 }
                                        : isLast
                                            ? { opacity: 0, y: 40 }
                                            : {}
                                }
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                <NewsCard news={item} />
                            </motion.div>
                        </AnimatePresence>
                    );
                })}

                {/* Блюр на обрезанном краю - работает на всех экранах */}
                {canScrollDown && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-24 z-20"
                        style={{
                            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 60%, transparent 100%)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </div>

            {/* Кнопки "вверх/вниз" - всегда видимы */}
            {canScrollUp && (
                <button
                    onClick={scrollUp}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg rounded-full p-2 hover:bg-gray-100 transition z-30 border border-gray-200"
                >
                    <ChevronUp className="h-6 w-6 text-[#213659]" />
                </button>
            )}
            {canScrollDown && (
                <button
                    onClick={scrollDown}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg rounded-full p-2 hover:bg-gray-100 transition z-30 border border-gray-200"
                >
                    <ChevronDown className="h-6 w-6 text-[#213659]" />
                </button>
            )}

            {/* Кнопка "К началу списка" */}
            {startIndex > 0 && (
                <div className="absolute bottom-16 left-0 right-0 flex justify-center z-20">
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