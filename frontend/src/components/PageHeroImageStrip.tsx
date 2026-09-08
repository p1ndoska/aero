import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ContentContainer } from '@/components/ContentContainer';
import { getHomeServiceCardByPath } from '@/constants/homeServiceCards';
import { useNavigationMenu } from '@/hooks/useNavigationMenu';

type PageHeroImageStripProps = {
    src: string;
    alt?: string;
};

export const PageHeroImageStrip = ({ src, alt = '' }: PageHeroImageStripProps) => {
    const { pathname } = useLocation();
    const { t } = useLanguage();
    const { menuItems } = useNavigationMenu();
    const card = getHomeServiceCardByPath(pathname);
    const servicesMenu = menuItems.find((item) => item.href === '/services');
    const currentService = [...(servicesMenu?.submenu ?? [])]
        .sort((a, b) => b.href.length - a.href.length)
        .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    const isServicesRoot = pathname === '/services' || pathname === '/services/';
    const title = card
        ? t(card.titleKey)
        : currentService?.name ?? (isServicesRoot ? t('services') : '');

    return (
        <div className="page-hero-image-strip">
            <img className="page-hero-image-strip__image" src={src} alt={alt} />
            <ContentContainer className="page-hero-image-strip__content">
                {title && <h1 className="page-hero-image-strip__title">{title}</h1>}
                <nav className="page-hero-image-strip__nav" aria-label={t('home')}>
                    <Link to="/" className="page-hero-image-strip__nav-link">
                        {t('home')}
                    </Link>
                    <span className="page-hero-image-strip__nav-sep" aria-hidden="true">
                        /
                    </span>
                    {isServicesRoot ? (
                        <span className="page-hero-image-strip__nav-current">{t('services')}</span>
                    ) : (
                        <Link to="/services" className="page-hero-image-strip__nav-link">
                            {t('services')}
                        </Link>
                    )}
                    {!isServicesRoot && title && (
                        <>
                            <span className="page-hero-image-strip__nav-sep" aria-hidden="true">
                                /
                            </span>
                            <span className="page-hero-image-strip__nav-current">{title}</span>
                        </>
                    )}
                </nav>
            </ContentContainer>
        </div>
    );
};
