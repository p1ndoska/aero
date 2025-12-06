import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, MoveUp, MoveDown, Type, Heading, Link, Image, Upload, List, Table, FileText, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadImageMutation, useUploadFileMutation } from '@/app/services/uploadApi';
import type { ContentElement } from '@/types/branch';

interface ContentConstructorProps {
  content: ContentElement[];
  onChange: (content: ContentElement[]) => void;
}

export default function ContentConstructor({ content, onChange }: ContentConstructorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage] = useUploadImageMutation();
  const [uploadFile] = useUploadFileMutation();

  // Принудительное применение стилей выравнивания и цветов после рендеринга
  useEffect(() => {
    const applyStyles = () => {
      // Применяем стили ко всем элементам с data-align
      const elements = document.querySelectorAll('[data-align]');
      elements.forEach((element) => {
        const align = element.getAttribute('data-align');
        if (align) {
          (element as HTMLElement).style.setProperty('text-align', align, 'important');
        }
      });

      // Применяем стили ко всем заголовкам и абзацам в контейнере
      const container = document.querySelector('.content-constructor-container');
      if (container) {
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
        headings.forEach((element) => {
          const htmlElement = element as HTMLElement;
          
          // Принудительно применяем выравнивание
          if (htmlElement.getAttribute('data-align')) {
            const align = htmlElement.getAttribute('data-align');
            htmlElement.style.setProperty('text-align', align!, 'important');
          }
          
          // Принудительно применяем цвет из data-атрибута или inline стиля
          const colorAttr = htmlElement.getAttribute('data-color');
          if (colorAttr) {
            htmlElement.style.setProperty('color', colorAttr, 'important');
          } else if (htmlElement.style.color && htmlElement.style.color !== 'rgb(0, 0, 0)') {
            htmlElement.style.setProperty('color', htmlElement.style.color, 'important');
          }
        });
      }

      // Дополнительно применяем стили ко всем элементам с force-классами
      const forceElements = document.querySelectorAll('[class*="force-text-"]');
      forceElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const className = htmlElement.className;
        
        // Извлекаем выравнивание из класса
        const alignMatch = className.match(/force-text-(center|left|right|justify)/);
        if (alignMatch) {
          htmlElement.style.setProperty('text-align', alignMatch[1], 'important');
        }
      });
    };

    // Применяем стили сразу
    applyStyles();

    // Применяем стили после каждого обновления
    const timeoutId = setTimeout(applyStyles, 100);
    
    return () => clearTimeout(timeoutId);
  }, [content]);


  const addElement = (type: ContentElement['type']) => {
    const newElement: ContentElement = {
      id: Date.now().toString(),
      type,
      content: '',
      props: type === 'heading' ? { level: 2, color: '#000000', textAlign: 'left' } : 
             type === 'link' ? { href: '', target: '_blank' } : 
             type === 'image' ? { alt: '', src: '' } : 
             type === 'list' ? { items: [] } :
             type === 'table' ? { headers: [], rows: [] } :
             type === 'file' ? { fileName: '', fileUrl: '', fileType: '', fileSize: 0 } :
             type === 'paragraph' ? { textIndent: false, textAlign: 'left' } : {}
    };
    
    onChange([...content, newElement]);
    setEditingId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<ContentElement>) => {
    const updatedContent = content.map(el => {
      if (el.id === id) {
        return { ...el, ...updates };
      }
      return el;
    });
    onChange(updatedContent);
  };

  const deleteElement = (id: string) => {
    onChange(content.filter(el => el.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const moveElement = (id: string, direction: 'up' | 'down') => {
    const index = content.findIndex(el => el.id === id);
    if (index === -1) return;

    const newContent = [...content];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < content.length) {
      [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
      onChange(newContent);
    }
  };

  const handleFileUpload = async (elementId: string, file: File) => {
    const element = content.find(el => el.id === elementId);
    if (!element) return;

    // Для изображений
    if (element.type === 'image') {
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите файл изображения');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      setUploadingImages(prev => new Set(prev).add(elementId));

      try {
        const formData = new FormData();
        formData.append('image', file);

        const result = await uploadImage(formData).unwrap();
        
        updateElement(elementId, {
          props: {
            ...element.props,
            src: result.url
          }
        });

        toast.success('Изображение успешно загружено');
      } catch (error: any) {
        toast.error(error.data?.error || 'Ошибка при загрузке изображения');
      } finally {
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(elementId);
          return newSet;
        });
      }
    }
    
    // Для файлов
    if (element.type === 'file') {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit для файлов
        toast.error('Размер файла не должен превышать 10MB');
        return;
      }

      setUploadingImages(prev => new Set(prev).add(elementId));

      try {
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadFile(formData).unwrap();
        
        updateElement(elementId, {
          props: {
            ...element.props,
            fileName: file.name,
            fileUrl: result.url,
            fileSize: file.size,
            fileType: file.type
          }
        });

        toast.success('Файл успешно загружен');
      } catch (error: any) {
        toast.error(error.data?.error || 'Ошибка при загрузке файла');
      } finally {
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(elementId);
          return newSet;
        });
      }
    }
  };

  const triggerFileInput = (elementId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-element-id', elementId);
      fileInputRef.current.click();
    }
  };

  const renderElement = (element: ContentElement) => {
    if (!element || !element.type) {
      return (
        <div className="p-4 border-2 border-dashed border-red-300 rounded bg-red-50">
          <p className="text-red-500 text-sm">Ошибка: некорректный элемент контента</p>
        </div>
      );
    }

    const isEditing = editingId === element.id;

    const renderPreview = () => {
      switch (element.type) {
        case 'heading':
          const headingLevel = element.props?.level || 2;
          const headingColor = element.props?.color || '#000000';
          const headingAlign = element.props?.textAlign || 'left';
          return React.createElement(
            `h${headingLevel}`,
            {
              className: `text-lg font-bold break-words min-w-0 force-break force-text-${headingAlign}`,
              style: { 
                color: headingColor,
                textAlign: headingAlign as any,
                '--text-align': headingAlign
              } as any,
              'data-align': headingAlign,
              'data-color': headingColor
            },
            element.content
          );
        case 'paragraph':
          const paragraphAlign = element.props?.textAlign || 'left';
          return (
            <p 
              className={`text-sm break-words min-w-0 force-break force-text-${paragraphAlign}`}
              style={{ 
                textIndent: element.props?.textIndent ? '1.5em' : '0',
                textAlign: paragraphAlign as any,
                '--text-align': paragraphAlign
              } as any}
              data-align={paragraphAlign}
            >
              {element.content}
            </p>
          );
        case 'link':
          return (
            <a 
              href={element.props?.href} 
              target={element.props?.target}
              className="text-blue-600 underline break-words min-w-0 force-break"
            >
              {element.content}
            </a>
          );
        case 'image':
          if (!element.props?.src) {
            return (
              <div className="flex flex-col gap-2 items-center p-4 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500 text-sm">Изображение не загружено</p>
              </div>
            );
          }
          return (
            <div className="flex flex-col gap-2 items-center">
              <img 
                src={element.props.src} 
                alt={element.props.alt || 'Изображение'}
                className="max-w-full h-auto rounded object-contain"
                style={{ maxHeight: '200px', maxWidth: '400px' }}
                onError={(e) => {
                  console.error('Image failed to load:', element.props?.src);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                }}
              />
              {element.props?.alt && <p className="text-xs text-gray-500 text-center">{element.props.alt}</p>}
            </div>
          );
        case 'list':
          const items = element.props?.items || [];
          if (!Array.isArray(items) || items.length === 0) {
            return (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500 text-sm">Список пуст</p>
              </div>
            );
          }
          return (
            <ul className="list-disc list-inside space-y-1">
              {items.map((item: string, idx: number) => (
                <li key={idx} className="text-sm break-words min-w-0 force-break">
                  {typeof item === 'string' ? item : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          );
      case 'table':
        const headers = element.props?.headers || [];
        const rows = element.props?.rows || [];
        if (!headers.length && !rows.length) {
          return (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500 text-sm">Таблица пуста</p>
            </div>
          );
        }
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              {headers.length > 0 && (
                <thead>
                  <tr>
                    {headers.map((header, idx) => (
                      <th key={idx} className="border border-gray-300 px-2 py-1 bg-gray-100 text-sm font-medium">
                        {header || `Колонка ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx}>
                    {row.cells.map((cell, cellIdx) => (
                      <td key={cellIdx} className="border border-gray-300 px-2 py-1 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        case 'file':
          if (!element.props?.fileUrl) {
            return (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500 text-sm">Файл не загружен</p>
              </div>
            );
          }
          const formatFileSize = (bytes: number) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          };
          return (
            <div className="flex items-center gap-2 p-3 border border-gray-300 rounded bg-gray-50">
              <FileText className="w-5 h-5 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 break-words">
                  {element.props.fileName || 'Неизвестный файл'}
                </p>
                <p className="text-xs text-gray-500">
                  {element.props.fileType && `${element.props.fileType} • `}
                  {element.props.fileSize && formatFileSize(element.props.fileSize)}
                </p>
              </div>
              <a
                href={element.props.fileUrl}
                download={element.props.fileName}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Скачать
              </a>
            </div>
          );
        default:
          return (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500 text-sm">
                Неизвестный тип элемента: {element.type}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Содержимое: {element.content || 'Пусто'}
              </p>
            </div>
          );
      }
    };

    return (
      <Card key={element.id} className="mb-4 min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {element.type === 'heading' && <Heading className="w-4 h-4" />}
              {element.type === 'paragraph' && <Type className="w-4 h-4" />}
              {element.type === 'link' && <Link className="w-4 h-4" />}
              {element.type === 'image' && <Image className="w-4 h-4" />}
              {element.type === 'list' && <List className="w-4 h-4" />}
              {element.type === 'table' && <Table className="w-4 h-4" />}
              {element.type === 'file' && <FileText className="w-4 h-4" />}
              {element.type === 'heading' ? `Заголовок H${element.props?.level || 2}` : 
               element.type === 'paragraph' ? 'Абзац' :
               element.type === 'link' ? 'Ссылка' : 
               element.type === 'image' ? 'Изображение' : 
               element.type === 'list' ? 'Список' :
               element.type === 'table' ? 'Таблица' :
               element.type === 'file' ? 'Файл' : 'Неизвестный'}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveElement(element.id, 'up')}
                disabled={content.indexOf(element) === 0}
              >
                <MoveUp className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveElement(element.id, 'down')}
                disabled={content.indexOf(element) === content.length - 1}
              >
                <MoveDown className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingId(isEditing ? null : element.id)}
              >
                {isEditing ? 'Сохранить' : 'Редактировать'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => deleteElement(element.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              {/* Основной контент */}
              <div>
                <Label htmlFor={`content-${element.id}`}>
                  {element.type === 'heading' ? 'Текст заголовка' :
                   element.type === 'paragraph' ? 'Текст абзаца' :
                   element.type === 'link' ? 'Текст ссылки' : 'Описание изображения'}
                </Label>
                {element.type === 'paragraph' ? (
                  <Textarea
                    id={`content-${element.id}`}
                    value={element.content}
                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                    placeholder="Введите текст абзаца"
                    className="min-h-[100px] resize-none break-words"
                  />
                ) : (
                  <Input
                    id={`content-${element.id}`}
                    value={element.content}
                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                    placeholder={
                      element.type === 'heading' ? 'Введите заголовок' :
                      element.type === 'link' ? 'Введите текст ссылки' : 'Введите описание изображения'
                    }
                    className="break-words min-w-0 force-break"
                  />
                )}
              </div>

              {/* Специфичные настройки для каждого типа */}
              {element.type === 'heading' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`level-${element.id}`}>Уровень заголовка</Label>
                    <Select
                      value={element.props?.level?.toString() || '2'}
                      onValueChange={(value) => updateElement(element.id, { 
                        props: { ...element.props, level: parseInt(value) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[#213659] border border-[#B1D1E0]">
                        <SelectItem value="1" className="focus:bg-[#EFF6FF] focus:text-[#213659]">H1 - Главный заголовок</SelectItem>
                        <SelectItem value="2" className="focus:bg-[#EFF6FF] focus:text-[#213659]">H2 - Подзаголовок</SelectItem>
                        <SelectItem value="3" className="focus:bg-[#EFF6FF] focus:text-[#213659]">H3 - Заголовок секции</SelectItem>
                        <SelectItem value="4" className="focus:bg-[#EFF6FF] focus:text-[#213659]">H4 - Заголовок подсекции</SelectItem>
                        <SelectItem value="5" className="focus:bg-[#EFF6FF] focus:text-[#213659]">H5 - Малый заголовок</SelectItem>
                        <SelectItem value="6" className="focus:bg-[#EFF6FF] focus:text-[#213659]">H6 - Минимальный заголовок</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`color-${element.id}`}>Цвет заголовка</Label>
                    <Input
                      id={`color-${element.id}`}
                      type="color"
                      value={element.props?.color || '#000000'}
                      onChange={(e) => updateElement(element.id, { 
                        props: { ...element.props, color: e.target.value }
                      })}
                      className="w-20 h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`align-${element.id}`}>Выравнивание</Label>
                    <Select
                      value={element.props?.textAlign || 'left'}
                      onValueChange={(value) => {
                        updateElement(element.id, { 
                          props: { ...element.props, textAlign: value as 'left' | 'center' | 'right' | 'justify' }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[#213659] border border-[#B1D1E0]">
                        <SelectItem value="left" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По левому краю</SelectItem>
                        <SelectItem value="center" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По центру</SelectItem>
                        <SelectItem value="right" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По правому краю</SelectItem>
                        <SelectItem value="justify" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По ширине</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {element.type === 'paragraph' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`textIndent-${element.id}`}
                      checked={element.props?.textIndent || false}
                      onChange={(e) => updateElement(element.id, { 
                        props: { ...element.props, textIndent: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <Label htmlFor={`textIndent-${element.id}`}>Красная строка</Label>
                  </div>
                  <div>
                    <Label htmlFor={`paragraph-align-${element.id}`}>Выравнивание</Label>
                    <Select
                      value={element.props?.textAlign || 'left'}
                      onValueChange={(value) => {
                        updateElement(element.id, { 
                          props: { ...element.props, textAlign: value as 'left' | 'center' | 'right' | 'justify' }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[#213659] border border-[#B1D1E0]">
                        <SelectItem value="left" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По левому краю</SelectItem>
                        <SelectItem value="center" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По центру</SelectItem>
                        <SelectItem value="right" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По правому краю</SelectItem>
                        <SelectItem value="justify" className="focus:bg-[#EFF6FF] focus:text-[#213659]">По ширине</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {element.type === 'link' && (
                <div>
                  <Label htmlFor={`href-${element.id}`}>URL ссылки</Label>
                  <Input
                    id={`href-${element.id}`}
                    value={element.props?.href || ''}
                    onChange={(e) => updateElement(element.id, { 
                      props: { ...element.props, href: e.target.value }
                    })}
                    placeholder="https://example.com"
                  />
                  <div className="mt-2">
                    <Label htmlFor={`target-${element.id}`}>Открывать в</Label>
                    <Select
                      value={element.props?.target || '_blank'}
                      onValueChange={(value) => updateElement(element.id, { 
                        props: { ...element.props, target: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[#213659] border border-[#B1D1E0]">
                        <SelectItem value="_blank" className="focus:bg-[#EFF6FF] focus:text-[#213659]">Новой вкладке</SelectItem>
                        <SelectItem value="_self" className="focus:bg-[#EFF6FF] focus:text-[#213659]">Текущей вкладке</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {element.type === 'image' && (
                <div className="space-y-3">
                  <div>
                    <Label>Загрузить изображение из файла</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => triggerFileInput(element.id)}
                        disabled={uploadingImages.has(element.id)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingImages.has(element.id) ? 'Загрузка...' : 'Выбрать файл'}
                      </Button>
                      {element.props?.src && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateElement(element.id, { 
                            props: { ...element.props, src: '' }
                          })}
                        >
                          Удалить
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Поддерживаются: JPG, PNG, GIF (максимум 5MB)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor={`src-${element.id}`}>Или введите URL изображения</Label>
                    <Input
                      id={`src-${element.id}`}
                      value={element.props?.src || ''}
                      onChange={(e) => updateElement(element.id, { 
                        props: { ...element.props, src: e.target.value }
                      })}
                      placeholder="/path/to/image.jpg или https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`alt-${element.id}`}>Альтернативный текст</Label>
                    <Input
                      id={`alt-${element.id}`}
                      value={element.props?.alt || ''}
                      onChange={(e) => updateElement(element.id, { 
                        props: { ...element.props, alt: e.target.value }
                      })}
                      placeholder="Описание изображения для доступности"
                    />
                  </div>
                </div>
              )}

              {element.type === 'list' && (
                <div className="space-y-3">
                  <div>
                    <Label>Элементы списка</Label>
                    <div className="space-y-3">
                      {(element.props?.items || []).map((item: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newItems = [...(element.props?.items || [])];
                              newItems[index] = e.target.value;
                              updateElement(element.id, {
                                props: { ...element.props, items: newItems }
                              });
                            }}
                            placeholder={`Элемент ${index + 1}`}
                            className="break-words min-w-0 force-break"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = (element.props?.items || []).filter((_, i) => i !== index);
                              updateElement(element.id, {
                                props: { ...element.props, items: newItems }
                              });
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...(element.props?.items || []), ''];
                        updateElement(element.id, {
                          props: { ...element.props, items: newItems }
                        });
                      }}
                      className="mt-2 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить элемент
                    </Button>
                  </div>
                </div>
              )}

              {element.type === 'table' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700">Настройки таблицы</Label>
                    <div className="mt-2">
                      <Label htmlFor={`columns-${element.id}`} className="text-xs text-gray-600">Количество колонок</Label>
                      <Select
                        value={(element.props?.headers?.length || 2).toString()}
                        onValueChange={(value) => {
                          const columnsCount = parseInt(value);
                          const currentHeaders = element.props?.headers || [];
                          const currentRows = element.props?.rows || [];
                          
                          let newHeaders = [...currentHeaders];
                          let newRows = [...currentRows];
                          
                          // Добавляем или удаляем заголовки
                          if (columnsCount > currentHeaders.length) {
                            for (let i = currentHeaders.length; i < columnsCount; i++) {
                              newHeaders.push('');
                            }
                          } else if (columnsCount < currentHeaders.length) {
                            newHeaders = newHeaders.slice(0, columnsCount);
                          }
                          
                          // Обновляем строки для соответствия количеству колонок
                          newRows = newRows.map(row => {
                            const newCells = [...(row.cells || [])];
                            if (columnsCount > newCells.length) {
                              for (let i = newCells.length; i < columnsCount; i++) {
                                newCells.push('');
                              }
                            } else if (columnsCount < newCells.length) {
                              newCells.splice(columnsCount);
                            }
                            return { ...row, cells: newCells };
                          });
                          
                          updateElement(element.id, {
                            props: { 
                              ...element.props, 
                              headers: newHeaders,
                              rows: newRows
                            }
                          });
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[#213659] border border-[#B1D1E0]">
                          <SelectItem value="1" className="focus:bg-[#EFF6FF] focus:text-[#213659]">1 колонка</SelectItem>
                          <SelectItem value="2" className="focus:bg-[#EFF6FF] focus:text-[#213659]">2 колонки</SelectItem>
                          <SelectItem value="3" className="focus:bg-[#EFF6FF] focus:text-[#213659]">3 колонки</SelectItem>
                          <SelectItem value="4" className="focus:bg-[#EFF6FF] focus:text-[#213659]">4 колонки</SelectItem>
                          <SelectItem value="5" className="focus:bg-[#EFF6FF] focus:text-[#213659]">5 колонок</SelectItem>
                          <SelectItem value="6" className="focus:bg-[#EFF6FF] focus:text-[#213659]">6 колонок</SelectItem>
                          <SelectItem value="7" className="focus:bg-[#EFF6FF] focus:text-[#213659]">7 колонок</SelectItem>
                          <SelectItem value="8" className="focus:bg-[#EFF6FF] focus:text-[#213659]">8 колонок</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Заголовки таблицы</Label>
                    <div className="space-y-2">
                      {(element.props?.headers || []).map((header: string, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={header}
                            onChange={(e) => {
                              const newHeaders = [...(element.props?.headers || [])];
                              newHeaders[index] = e.target.value;
                              updateElement(element.id, {
                                props: { ...element.props, headers: newHeaders }
                              });
                            }}
                            placeholder={`Заголовок ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Строки таблицы</Label>
                    <div className="space-y-2">
                      {(element.props?.rows || []).map((row, rowIndex) => (
                        <div key={row.id || rowIndex} className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Строка {rowIndex + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newRows = (element.props?.rows || []).filter((_, i) => i !== rowIndex);
                                updateElement(element.id, {
                                  props: { ...element.props, rows: newRows }
                                });
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${element.props?.headers?.length || 2}, 1fr)` }}>
                            {row.cells.map((cell: string, cellIndex: number) => (
                              <Input
                                key={cellIndex}
                                value={cell}
                                onChange={(e) => {
                                  const newRows = [...(element.props?.rows || [])];
                                  newRows[rowIndex].cells[cellIndex] = e.target.value;
                                  updateElement(element.id, {
                                    props: { ...element.props, rows: newRows }
                                  });
                                }}
                                placeholder={`Ячейка ${cellIndex + 1}`}
                                size={1}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const headersCount = element.props?.headers?.length || 2;
                        const newRow = {
                          id: Date.now().toString(),
                          cells: Array(headersCount).fill('')
                        };
                        const newRows = [...(element.props?.rows || []), newRow];
                        updateElement(element.id, {
                          props: { ...element.props, rows: newRows }
                        });
                      }}
                      className="mt-2 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить строку
                    </Button>
                  </div>
                </div>
              )}

              {element.type === 'file' && (
                <div className="space-y-3">
                  <div>
                    <Label>Загрузить файл</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => triggerFileInput(element.id)}
                        disabled={uploadingImages.has(element.id)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingImages.has(element.id) ? 'Загрузка...' : 'Выбрать файл'}
                      </Button>
                      {element.props?.fileUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateElement(element.id, { 
                            props: { ...element.props, fileUrl: '', fileName: '', fileType: '', fileSize: 0 }
                          })}
                        >
                          Удалить
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Поддерживаются любые файлы (максимум 10MB)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor={`fileName-${element.id}`}>Название файла</Label>
                    <Input
                      id={`fileName-${element.id}`}
                      value={element.props?.fileName || ''}
                      onChange={(e) => updateElement(element.id, { 
                        props: { ...element.props, fileName: e.target.value }
                      })}
                      placeholder="Введите название файла"
                    />
                  </div>

                  {element.props?.fileUrl && (
                    <div>
                      <Label htmlFor={`fileUrl-${element.id}`}>URL файла</Label>
                      <Input
                        id={`fileUrl-${element.id}`}
                        value={element.props?.fileUrl || ''}
                        onChange={(e) => updateElement(element.id, { 
                          props: { ...element.props, fileUrl: e.target.value }
                        })}
                        placeholder="URL файла"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Настройка приватности блока */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`isPrivate-${element.id}`}
                    checked={element.isPrivate || false}
                    onCheckedChange={(checked) => updateElement(element.id, { isPrivate: !!checked })}
                  />
                  <Label htmlFor={`isPrivate-${element.id}`} className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4" />
                    Только для авторизованных пользователей
                  </Label>
                </div>
                {element.isPrivate && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Этот блок будет скрыт для неавторизованных пользователей
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-[50px] border rounded p-3 bg-gray-50">
              {element.content || 
               element.props?.src || 
               element.props?.fileUrl ||
               (element.props?.items && element.props.items.length > 0) ||
               (element.props?.headers && element.props.headers.length > 0) ||
               (element.props?.rows && element.props.rows.length > 0) ? 
               renderPreview() : 
               <p className="text-gray-500 text-sm">Нажмите "Редактировать" для добавления контента</p>}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 content-constructor-container">
      {/* Скрытый input для загрузки файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          const elementId = e.target.getAttribute('data-element-id');
          if (file && elementId) {
            handleFileUpload(elementId, file);
          }
          // Сбрасываем input
          e.target.value = '';
        }}
      />

      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addElement('heading')}
          className="flex items-center gap-2"
        >
          <Heading className="w-4 h-4" />
          Заголовок
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addElement('paragraph')}
          className="flex items-center gap-2"
        >
          <Type className="w-4 h-4" />
          Абзац
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addElement('link')}
          className="flex items-center gap-2"
        >
          <Link className="w-4 h-4" />
          Ссылка
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addElement('image')}
          className="flex items-center gap-2"
        >
          <Image className="w-4 h-4" />
          Изображение
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addElement('list')}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          Список
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addElement('table')}
          className="flex items-center gap-2"
        >
          <Table className="w-4 h-4" />
          Таблица
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addElement('file')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Файл
        </Button>
      </div>

      <div className="space-y-4">
        {content.map(renderElement)}
      </div>

      {content.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            Контент не добавлен. Нажмите на кнопки выше, чтобы добавить элементы.
          </CardContent>
        </Card>
      )}
    </div>
  );
}


