// Типы для элементов конструктора контента
export interface ContentElement {
  id: string;
  type: 'paragraph' | 'heading' | 'link' | 'image' | 'list' | 'table' | 'file' | 'video' | 'page-link';
  content: string;
  isPrivate?: boolean; // Только для авторизованных пользователей
  props?: {
    level?: number; // Для заголовков (1-6)
    color?: string; // Цвет заголовка
    textAlign?: 'left' | 'center' | 'right' | 'justify'; // Выравнивание текста
    textIndent?: boolean; // Красная строка для абзаца
    href?: string; // Для ссылок
    target?: string; // Для ссылок
    pageId?: number; // ID внутренней страницы (для page-link)
    pageSlug?: string; // Slug внутренней страницы (для page-link)
    pageTitle?: string; // Название страницы (для page-link) - заголовок новой страницы
    linkText?: string; // Текст ссылки (для page-link) - что отображается на текущей странице
    alt?: string; // Для изображений
    src?: string; // Для изображений
    items?: string[]; // Для списков
    rows?: TableRow[]; // Для таблиц
    headers?: string[]; // Заголовки таблицы
    fileName?: string; // Для файлов
    fileUrl?: string; // URL файла
    fileSize?: number; // Размер файла
    fileType?: string; // Тип файла
    videoSrc?: string; // Для видео - URL или путь к файлу
    videoTitle?: string; // Заголовок видео
    videoWidth?: number; // Ширина видео
    videoHeight?: number; // Высота видео
    controls?: boolean; // Показывать элементы управления
    autoplay?: boolean; // Автовоспроизведение
    loop?: boolean; // Зацикливание
    muted?: boolean; // Без звука
  };
}

// Тип для строки таблицы
export interface TableRow {
  id: string;
  cells: TableCellContent[];
}

// Основной интерфейс филиала
export interface Branch {
  id: number;
  name: string;
  nameEn?: string;
  nameBe?: string;
  address: string;
  addressEn?: string;
  addressBe?: string;
  phone: string;
  email: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  workHours?: any; // JSON объект для графика работы
  services?: any; // JSON объект для услуг
  coordinates?: any; // JSON объект для координат
  images: string[]; // Массив путей к изображениям
  content?: ContentElement[]; // Массив элементов контента конструктора
  contentEn?: ContentElement[]; // Контент на английском
  contentBe?: ContentElement[]; // Контент на беларуском
  createdAt: string;
  updatedAt: string;
}

// Запрос на создание филиала
export interface CreateBranchRequest {
  name: string;
  nameEn?: string;
  nameBe?: string;
  address: string;
  addressEn?: string;
  addressBe?: string;
  phone: string;
  email: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  workHours?: any;
  services?: any;
  coordinates?: any;
  images?: string[];
  content?: ContentElement[];
  contentEn?: ContentElement[];
  contentBe?: ContentElement[];
}

// Запрос на обновление филиала
export interface UpdateBranchRequest {
  name?: string;
  nameEn?: string;
  nameBe?: string;
  address?: string;
  addressEn?: string;
  addressBe?: string;
  phone?: string;
  email?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBe?: string;
  workHours?: any;
  services?: any;
  coordinates?: any;
  images?: string[];
  content?: ContentElement[];
  contentEn?: ContentElement[];
  contentBe?: ContentElement[];
}

// Ответ API для филиалов
export interface BranchResponse {
  branches: Branch[];
}

export interface SingleBranchResponse {
  branch: Branch;
}

export type TableCellContent =
  | {type: 'text'; value: string}
  | {type: 'link'; text: string; href: string; target?: string}
  | {type: 'image'; src: string; alt?:string}
  | {type: 'file'; fileName: string; fileUrl: string; fileSize: number};


