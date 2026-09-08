// Список всех внутренних страниц сайта для выбора в админ панели
export const INTERNAL_PAGES = [
  // О компании
  { value: '/about/company', label: 'О предприятии' },
  { value: '/about/management', label: 'Руководство' },
  { value: '/about/structure', label: 'Структура' },
  { value: '/about/branches', label: 'Филиалы' },
  { value: '/about/security-policy', label: 'Политика безопасности' },
  { value: '/about/history', label: 'История предприятия' },
  { value: '/about/contacts', label: 'Контакты' },
  { value: '/about/vacancies', label: 'Вакансии' },
  
  // Социальная сфера
  { value: '/social/ideological-work', label: 'Идеологическая работа' },
  { value: '/social/directive-12', label: 'Директива № 12' },
  { value: '/social/information-day', label: 'Единый день информирования' },
  { value: '/social/belarusian-woman-year', label: 'Год белорусской женщины' },
  { value: '/social/memory', label: 'Память и боль белорусской земли' },
  { value: '/social/trade-union', label: 'Объединенная профсоюзная организация' },
  { value: '/social/public-associations', label: 'Общественные объединения' },
  { value: '/social/belaya-rus', label: 'Белая Русь' },
  { value: '/social/brsm', label: 'БРСМ' },
  { value: '/social/women-union', label: 'Белорусский союз женщин' },
  { value: '/social/healthy-lifestyle', label: 'За здоровый образ жизни' },
  
  // Новости
  { value: '/news', label: 'Все новости' },
  { value: '/news/energy-saving', label: 'Энергосбережение' },
  
  // Пользовательские страницы
  { value: '/profile', label: 'Личный кабинет' },
  
  // Политика
  { value: '/cookie-policy', label: 'Политика cookie' },
];

// Функция для получения страниц по категории
export const getPagesByCategory = () => {
  return {
    about: INTERNAL_PAGES.filter(page => page.value.startsWith('/about')),
    social: INTERNAL_PAGES.filter(page => page.value.startsWith('/social')),
    news: INTERNAL_PAGES.filter(page => page.value.startsWith('/news')),
    other: INTERNAL_PAGES.filter(page => 
      !page.value.startsWith('/about') && 
      !page.value.startsWith('/social') && 
      !page.value.startsWith('/news')
    )
  };
};




