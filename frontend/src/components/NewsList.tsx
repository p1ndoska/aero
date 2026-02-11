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

            const arrowHeight = arrowDownRef.current?.clientHeight || 40;
            const buttonHeight = startIndex > 0 ? 56 : 0;
            const topButtonHeight = canScrollUp ? 48 : 0;

            const availableHeight = containerHeight - arrowHeight - buttonHeight - topButtonHeight - 20;

            if (availableHeight <= 0) return;

            let count = Math.floor(availableHeight / cardHeightWithMargin);

            count = Math.min(count + 1, newsItems.length);
            count = Math.max(count, baseItemsPerPage);
            count = Math.min(count, 10);

            setItemsPerPage(count);

            setStartIndex((prev) => {
                const maxStart = Math.max(0, newsItems.length - count);
                return Math.min(prev, maxStart);
            });
        };

        calculateItemsPerPage();
        const observer = new ResizeObserver(calculateItemsPerPage);

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
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
            <div className="relative flex-1 h-full overflow-hidden pt-1 pb-16 min-h-0">
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

                {/* 🔥 БЛЮР ВНИЗУ КОНТЕЙНЕРА — добавлено здесь */}
                {canScrollDown && (
                    <div
                        className="absolute bottom-0 left-0 right-0 h-20 z-10"
                        style={{
                            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            pointerEvents: 'none'
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
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition z-[30]"
                    // ↑↑↑ ПОВЫШЕННЫЙ Z-INDEX ЧЕРЕЗ TAILWIND UTIL CLASS
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