export const HOME_SERVICE_CARDS = [
    { titleKey: 'home_card_air_navigation', href: '/services/air-navigation' },
    { titleKey: 'home_card_airport_services', href: '/services/airport' },
    { titleKey: 'home_card_kpts', href: '/services/kpts' },
    { titleKey: 'home_card_other_services', href: '/services/other' },
] as const;

export const getHomeServiceCardByPath = (pathname: string) =>
    HOME_SERVICE_CARDS.find(
        (card) => pathname === card.href || pathname.startsWith(`${card.href}/`),
    );

export const isHomeServiceCardPath = (pathname: string) =>
    Boolean(getHomeServiceCardByPath(pathname));

export const isServicesPath = (pathname: string) =>
    pathname === '/services' || pathname.startsWith('/services/');
