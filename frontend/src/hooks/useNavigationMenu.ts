import { useGetCategoriesQuery } from '@/app/services/categoryApi';
import { useGetAllSocialWorkCategoriesQuery } from '@/app/services/socialWorkCategoryApi';
import { useGetAllAboutCompanyCategoriesQuery } from '@/app/services/aboutCompanyCategoryApi';
import { useGetAeronauticalInfoCategoriesQuery } from '@/app/services/aeronauticalInfoCategoryApi';
import { useGetAppealsCategoriesQuery } from '@/app/services/appealsCategoryApi';
import { useGetAllServicesCategoriesQuery } from '@/app/services/servicesCategoryApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedField } from '@/utils/translationHelpers';

export interface SubMenuItem {
  name: string;
  href: string;
  external?: boolean;
  id?: number;
  hasChildren?: boolean;
  children?: SubMenuItem[];
}

export interface MenuItem {
  name: string;
  href: string;
  submenu: SubMenuItem[] | null;
}

const buildCategoryTree = (categories: any[]) => {
  if (!categories || !Array.isArray(categories)) return [];

  const activeCategories = categories.filter((c: any) => c.isActive);
  const categoryMap = new Map<number, any>();
  const rootCategories: any[] = [];

  activeCategories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  activeCategories.forEach((cat) => {
    const category = categoryMap.get(cat.id);
    if (!category) return;

    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId);
      if (parent && !parent.children.some((c: any) => c.id === category.id)) {
        parent.children.push(category);
      }
    } else if (!cat.parentId) {
      if (!rootCategories.some((c: any) => c.id === category.id)) {
        rootCategories.push(category);
      }
    }
  });

  const sortCategories = (cats: any[]) => {
    cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    cats.forEach((cat) => {
      if (cat.children?.length > 0) sortCategories(cat.children);
    });
  };

  sortCategories(rootCategories);
  return rootCategories;
};

const mapCategoryTreeToSubmenu = (
  categories: any[],
  language: string,
  basePath: string,
): SubMenuItem[] =>
  categories.map((cat) => ({
    name: getTranslatedField(cat, 'name', language),
    href: `${basePath}/${cat.pageType}`,
    id: cat.id,
    hasChildren: cat.children?.length > 0,
    children:
      cat.children?.length > 0
        ? mapCategoryTreeToSubmenu(cat.children, language, basePath)
        : undefined,
  }));

export function useNavigationMenu() {
  const { t, language } = useLanguage();

  const { data: categories } = useGetCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: socialWorkCategories } = useGetAllSocialWorkCategoriesQuery();
  const { data: aboutCompanyCategories } = useGetAllAboutCompanyCategoriesQuery();
  const { data: aeronauticalInfoCategories } = useGetAeronauticalInfoCategoriesQuery();
  const { data: appealsCategories } = useGetAppealsCategoriesQuery();
  const { data: servicesCategories } = useGetAllServicesCategoriesQuery();

  const newsSubmenu: SubMenuItem[] =
    categories && Array.isArray(categories) && categories.length > 0
      ? [
          { name: t('all_news') || 'Все новости', href: '/news' },
          ...categories.map((c: any) => ({
            name: getTranslatedField(c, 'name', language),
            href: `/news/category/${c.id}`,
          })),
        ]
      : [
          { name: t('all_news') || 'Все новости', href: '/news' },
          { name: t('news_company') || 'Новости предприятия', href: '/news/company' },
          { name: t('flight_safety') || 'Безопасность полетов', href: '/news/flight-safety' },
          { name: t('information_security') || 'Информационная безопасность', href: '/news/information-security' },
          { name: t('mchs_informs') || 'МЧС информирует', href: '/news/emergency' },
          { name: t('mvd_informs') || 'МВД информирует', href: '/news/police' },
          { name: t('energy_saving') || 'Энергосбережение', href: '/news/energy-saving' },
        ];

  const socialWorkTree = buildCategoryTree(socialWorkCategories ?? []);
  const socialWorkSubmenu: SubMenuItem[] =
    socialWorkTree.length > 0
      ? mapCategoryTreeToSubmenu(socialWorkTree, language, '/social')
      : [
          {
            name: t('ideological_work'),
            href: '/social/ideological-work',
            children: [
              { name: t('directive_12'), href: '/social/directive-12' },
              { name: t('information_day'), href: '/social/information-day' },
              { name: t('belarusian_woman_year'), href: '/social/belarusian-woman-year' },
              { name: t('memory_pain'), href: '/social/memory' },
            ],
          },
          { name: t('united_trade_union'), href: '/social/trade-union' },
          {
            name: t('public_associations'),
            href: '/social/public-associations',
            children: [
              { name: t('white_rus'), href: '/social/belaya-rus' },
              { name: t('brsm'), href: '/social/brsm' },
              { name: t('belarusian_women_union'), href: '/social/women-union' },
            ],
          },
          { name: t('healthy_lifestyle'), href: '/social/healthy-lifestyle' },
        ];

  const servicesSubmenu: SubMenuItem[] | null =
    servicesCategories && Array.isArray(servicesCategories) && servicesCategories.length > 0
      ? servicesCategories
          .filter((c: any) => c.isActive)
          .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((category: any) => ({
            name: getTranslatedField(category, 'name', language),
            href: `/services/${category.pageType}`,
          }))
      : null;

  const aboutSubmenu: SubMenuItem[] =
    aboutCompanyCategories && Array.isArray(aboutCompanyCategories) && aboutCompanyCategories.length > 0
      ? aboutCompanyCategories
          .filter((c: any) => c.isActive)
          .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((category: any) => ({
            name: getTranslatedField(category, 'name', language),
            href: `/about/${category.pageType}`,
          }))
      : [];

  const airNavTree = buildCategoryTree(aeronauticalInfoCategories ?? []);
  const airNavSubmenu = mapCategoryTreeToSubmenu(airNavTree, language, '/air-navigation');

  const appealsSubmenu: SubMenuItem[] =
    appealsCategories && Array.isArray(appealsCategories) && appealsCategories.length > 0
      ? appealsCategories
          .filter((c: any) => c.isActive)
          .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((category: any) => ({
            name: getTranslatedField(category, 'name', language),
            href:
              category.pageType === 'e-appeals'
                ? 'https://xn--80abnmycp7evc.xn--90ais/'
                : `/appeals/${category.pageType}`,
            external: category.pageType === 'e-appeals',
          }))
      : [];

  const menuItems: MenuItem[] = [
    { name: t('about'), href: '/about', submenu: aboutSubmenu },
    { name: t('news'), href: '/news', submenu: newsSubmenu },
    { name: t('services'), href: '/services', submenu: servicesSubmenu },
    { name: t('air_navigation'), href: '/air-navigation', submenu: airNavSubmenu },
    { name: t('appeals'), href: '/appeals', submenu: appealsSubmenu },
    { name: t('social_ideological_work'), href: '/social', submenu: socialWorkSubmenu },
  ];

  return { menuItems, airNavTree };
}
