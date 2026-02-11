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
    const listContainerRef = useRef<HTMLDivElement | null>(null);
    const firstCardRef = useRef<HTMLDivElement | null>(null);
    const arrowDownRef = useRef<HTMLButtonElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const container = containerRef.current;
            const firstCard = firstCardRef.current;
            const arrowDown = arrowDownRef.current;

            if (!container || !firstCard) return;

            // Получаем полную высоту контейнера
            const containerRect = container.getBoundingClientRect();
            const containerHeight = containerRect.height;

            // Получаем высоту карточки с учетом всех отступов
            const cardRect = firstCard.getBoundingClientRect();
            const cardHeight = cardRect.height;

            // Получаем высоту стрелки
            const arrowHeight = arrowDown ? arrowDown.getBoundingClientRect().height : 40;

            // Дополнительные отступы (можно настроить)
            const topPadding = 16; // padding-top контейнера
            const bottomPadding = 8; // padding-bottom контейнера
            const buttonHeight = startIndex > 0 ? 48 : 0; // высота кнопки "К началу списка"

            // Высота, доступная только под карточки
            const availableHeight = Math.max(0,
                containerHeight - arrowHeight - topPadding - bottomPadding - buttonHeight
            );

            if (availableHeight <= 0 || cardHeight <= 0) return;

            // Рассчитываем количество карточек
            let dynamicCount = Math.max(
                baseItemsPerPage,
                Math.floor(availableHeight / cardHeight)
            );

            // Убедимся, что последняя карточка немного выходит за пределы видимой области
            if (dynamicCount * cardHeight < availableHeight) {
                dynamicCount += 1;
            }

            dynamicCount = Math.min(dynamicCount, newsItems.length || dynamicCount);
            dynamicCount = Math.min(dynamicCount, 10); // Максимальный лимит

            setItemsPerPage(dynamicCount);

            setStartIndex((prev) => {
                const maxStart = Math.max(0, newsItems.length - dynamicCount);
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
            className="relative space-y-2 flex-1 h-full flex flex-col min-h-0"
        >
            {/* Новости */}
            <div
                ref={listContainerRef}
                className="relative overflow-hidden flex-1 h-full pt-1 pb-0 min-h-0"
                style={{
                    maskImage: canScrollDown ? 'linear-gradient(to bottom, black 80%, transparent 100%)' : 'none',
                    WebkitMaskImage: canScrollDown ? 'linear-gradient(to bottom, black 80%, transparent 100%)' : 'none'
                }}
            >
                {visibleItems.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === visibleItems.length - 1;

                    return (
                        <AnimatePresence key={item.id} mode="popLayout">
                            <motion.div
                                className="mb-4 last:mb-0"
                                ref={isFirst ? firstCardRef : undefined}
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
            </div>

            {/* Кнопки "вверх/вниз" */}
            {canScrollUp && (
                <button
                    onClick={scrollUp}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition z-10"
                >
                    <ChevronUp className="h-6 w-6 text-[#213659]" />
                </button>
            )}
            {canScrollDown && (
                <button
                    ref={arrowDownRef}
                    onClick={scrollDown}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition z-10"
                >
                    <ChevronDown className="h-6 w-6 text-[#213659]" />
                </button>
            )}

            {/* Кнопка "К началу списка" */}
            {startIndex > 0 && (
                <div className="flex justify-center mt-2">
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