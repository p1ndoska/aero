import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { HeroFeatureCard } from '@/components/HeroFeatureCard';
import { ContentContainer } from '@/components/ContentContainer';
import { HOME_SERVICE_CARDS } from '@/constants/homeServiceCards';

const HERO_VIDEO_SRC = `${import.meta.env.BASE_URL}openvideo.mp4`;

const STRIP_PATHS = [
    'M -30 36 Q 110 8, 250 92 T 520 28 T 790 168 T 1060 48 T 1330 142 T 1500 64',
    'M -20 188 C 160 40, 340 176, 520 62 S 860 196, 1060 74 S 1320 18, 1500 118',
    'M 40 118 Q 220 12, 400 156 T 740 34 T 1080 178 T 1420 52 T 1560 130',
    'M 80 22 C 260 170, 440 8, 620 148 S 980 16, 1160 162 S 1400 44, 1540 96',
    'M -10 74 Q 180 198, 360 58 T 680 186 T 980 42 T 1280 154 T 1520 70',
    'M 120 164 C 300 18, 490 190, 670 46 S 1020 178, 1200 38 S 1410 186, 1560 88',
    'M 20 52 Q 210 140, 390 24 T 720 172 T 1040 18 T 1360 148 T 1540 40',
    'M 60 198 C 250 70, 430 210, 610 82 S 960 6, 1140 190 S 1380 28, 1520 156',
    'M -40 132 Q 150 16, 330 176 T 640 54 T 940 198 T 1240 22 T 1500 164',
    'M 200 8 C 380 154, 560 12, 740 128 S 1100 196, 1280 58 S 1460 172, 1580 36',
];

function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const STRIP_ARROWS = (() => {
    const rand = mulberry32(20260828);
    return Array.from({ length: 32 }, () => ({
        x: 16 + rand() * 1408,
        y: 18 + rand() * 172,
        rotate: rand() * 360,
        scale: 0.85 + rand() * 0.7,
        opacity: 0.78 + rand() * 0.22,
    }));
})();

const HeroArrow = ({
    x,
    y,
    rotate,
    scale,
    opacity,
}: {
    x: number;
    y: number;
    rotate: number;
    scale: number;
    opacity: number;
}) => (
    <g
        className="hero-video-banner__strip-arrow"
        opacity={opacity}
        transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
    >
        <path className="hero-video-banner__strip-arrow-shaft" d="M 0 0 L 22 0" />
        <path className="hero-video-banner__strip-arrow-head" d="M 16 -5.2 L 28 0 L 16 5.2 Z" />
    </g>
);

const HeroArrowsStrip = () => (
    <div className="hero-video-banner__strip" aria-hidden="true">
        <svg
            className="hero-video-banner__strip-svg"
            viewBox="0 0 1440 208"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <marker
                    id="hero-strip-arrowhead"
                    className="hero-video-banner__strip-marker"
                    viewBox="0 0 12 12"
                    markerWidth="9"
                    markerHeight="9"
                    refX="10"
                    refY="6"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                >
                    <path d="M 0 1.2 L 12 6 L 0 10.8 Z" fill="currentColor" />
                </marker>
            </defs>
            {STRIP_PATHS.map((d) => (
                <path
                    key={d}
                    className="hero-video-banner__strip-path"
                    d={d}
                    markerEnd="url(#hero-strip-arrowhead)"
                />
            ))}
            {STRIP_ARROWS.map((arrow, index) => (
                <HeroArrow key={index} {...arrow} />
            ))}
        </svg>
    </div>
);

export const HeroVideoBanner = () => {
    const { pathname } = useLocation();
    const videoRef = useRef<HTMLVideoElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = true;
        video.play().catch(() => {});
    }, [pathname]);

    if (pathname !== '/') {
        return null;
    }

    return (
        <div className="hero-video-banner">
            <div className="hero-video-banner__media" aria-hidden="true">
                <video
                    ref={videoRef}
                    className="hero-video-banner__video"
                    src={HERO_VIDEO_SRC}
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    controls={false}
                    preload="auto"
                />
            </div>
            <div className="hero-home-overlap">
                <HeroArrowsStrip />
                <ContentContainer className="hero-home-overlap__heading">
                    <h2 className="hero-home-overlap__title">{t('services')}</h2>
                </ContentContainer>
                <div className="hero-home-overlap__body a11y-content">
                    <ContentContainer className="hero-home-overlap__cards">
                        {HOME_SERVICE_CARDS.map((card) => {
                            const title = t(card.titleKey);
                            return (
                                <HeroFeatureCard
                                    key={card.href}
                                    href={card.href}
                                    title={title}
                                />
                            );
                        })}
                    </ContentContainer>
                </div>
            </div>
        </div>
    );
};
