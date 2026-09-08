import { Link } from 'react-router-dom';

type HeroFeatureCardProps = {
    href: string;
    title: string;
    imageSrc?: string;
    imageAlt?: string;
    badge?: string;
};

export const HeroFeatureCard = ({
    href,
    title,
    imageSrc,
    imageAlt,
    badge,
}: HeroFeatureCardProps) => (
    <Link to={href} className="hero-feature-card">
        <div className="hero-feature-card__media">
            {imageSrc ? (
                <img className="hero-feature-card__image" src={imageSrc} alt={imageAlt || title} />
            ) : (
                <div className="hero-feature-card__media-fallback" aria-hidden="true" />
            )}
            {badge && (
                <div className="hero-feature-card__badge" aria-hidden="true">
                    <svg className="hero-feature-card__badge-mark" viewBox="0 0 42 28" fill="none">
                        <path
                            d="M3 14 L21 4 L39 14 L21 24 Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                        />
                        <path d="M13 11 H29 M13 14 H29 M13 17 H29" stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
                    </svg>
                    <span className="hero-feature-card__badge-text">{badge}</span>
                </div>
            )}
        </div>
        <p className="hero-feature-card__title">{title}</p>
    </Link>
);
