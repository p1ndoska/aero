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
    const arrowDownRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const container = containerRef.current;

            if (!container || newsItems.length === 0) return;

            const containerHeight = container.clientHeight;

            if (containerHeight <= 0) return;

            let totalCardHeight = 0;
            let cardCount = 0;

            for (let i = 0; i < Math.min(3, cardRefs.current.length); i++) {
                const card = cardRefs.current[i];
                if (card) {
                    totalCardHeight += card.clientHeight;
                    cardCount++;
                }
            }

            const avgCardHeight = cardCount > 0 ? totalCardHeight / cardCount : 200;
            const cardMargin = 16;
            const cardHeightWithMargin = avgCardHeight + cardMargin;

            // Резерв под стрелку вниз и блюр (примерно 80px)
            // Учитываем максимальный резерв для кнопок (на случай, если они появятся)
            const bottomReserve = 80;
            const maxTopReserve = 48;
            const maxButtonReserve = 56;

            const availableHeight = containerHeight - bottomReserve - maxTopReserve - maxButtonReserve;

            if (availableHeight <= 0) return;

            // Считаем сколько карточек помещается полностью
            let count = Math.floor(availableHeight / cardHeightWithMargin);
            
            // Добавляем одну карточку, чтобы последняя обрезалась
            count = count + 1;
            
            // Минимум baseItemsPerPage
            count = Math.max(count, baseItemsPerPage);
            
            // ВАЖНО: всегда оставляем хотя бы одну новость "за кадром", чтобы стрелка была видна
            // Гарантируем, что count всегда меньше newsItems.length (если новостей больше baseItemsPerPage)
            if (newsItems.length > baseItemsPerPage) {
                count = Math.min(count, newsItems.length - 1);
            } else {
                count = Math.min(count, newsItems.length);
            }

            setItemsPerPage((prev) => {
                // Обновляем только если значение действительно изменилось
                if (prev !== count) {
                    return count;
                }
                return prev;
            });
        };

        // Небольшая задержка для первого рендера
        const timeoutId = setTimeout(calculateItemsPerPage, 100);
        const observer = new ResizeObserver(calculateItemsPerPage);

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [baseItemsPerPage, newsItems.length]);

    if (newsItems.length === 0) {
        return <p className="text-[#213659]">{t('no_data')}</p>;
    }

    const maxStartIndex = Math.max(0, newsItems.length - itemsPerPage);
    const clampedStartIndex = Math.min(startIndex, maxStartIndex);
    const visibleItems = newsItems.slice(clampedStartIndex, clampedStartIndex + itemsPerPage);

    const hasOverflow = newsItems.length > itemsPerPage;
    const canScrollUp = clampedStartIndex > 0;
    // Стрелка вниз и блюр должны быть, пока есть скрытые новости (список больше, чем влезает за раз)
    const canScrollDown = hasOverflow;

    const scrollDown = () => {
        if (!canScrollDown) return;

        setStartIndex((prev) => {
            const maxStart = Math.max(0, newsItems.length - itemsPerPage);
            const next = prev + 1;
            // Делаем циклическую прокрутку: после последней позиции возвращаемся к началу
            if (next > maxStart) {
                return 0;
            }
            return next;
        });
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
            <div className="relative flex-1 h-full overflow-hidden pt-1 min-h-0">
                {visibleItems.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === visibleItems.length - 1;

                    return (
                        <AnimatePresence key={item.id} mode="popLayout">
                            <motion.div
                                className="mb-4"
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

                {/* Блюр поверх последней обрезанной новости с градиентным переходом */}
                {canScrollDown && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-40 z-10"
                        style={{
                            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 8%, rgba(255, 255, 255, 0.82) 18%, rgba(255, 255, 255, 0.68) 30%, rgba(255, 255, 255, 0.5) 45%, rgba(255, 255, 255, 0.32) 60%, rgba(255, 255, 255, 0.18) 75%, rgba(255, 255, 255, 0.08) 88%, rgba(255, 255, 255, 0.02) 96%, transparent 100%)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            maskImage: 'linear-gradient(to top, black 0%, black 20%, rgba(0, 0, 0, 0.9) 40%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.3) 80%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to top, black 0%, black 20%, rgba(0, 0, 0, 0.9) 40%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.3) 80%, transparent 100%)',
                            pointerEvents: 'none',
                            transition: 'opacity 0.3s ease-in-out'
                        }}
                    />
                )}
            </div>

            {/* Кнопки "вверх/вниз" */}
            {canScrollUp && (
                <button
                    onClick={scrollUp}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition z-20"
                >
                    <ChevronUp className="h-6 w-6 text-[#213659]" />
                </button>
            )}
            {canScrollDown && (
                <button
                    ref={arrowDownRef}
                    onClick={scrollDown}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition z-50"
                >
                    <ChevronDown className="h-6 w-6 text-[#213659]" />
                </button>
            )}

            {/* Кнопка "К началу списка" */}
            {startIndex > 0 && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
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