import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Phone, Mail, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ContentConstructor from './admin/ContentConstructor';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslatedField } from '../utils/translationHelpers';

export default function ContactsPage() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = ['SUPER_ADMIN', 'ABOUT_ADMIN'].includes(roleName.toString().toUpperCase());

  const [isContentEditorOpen, setIsContentEditorOpen] = useState(false);
  const [editableTitle, setEditableTitle] = useState('Контакты');
  const [editableSubtitle, setEditableSubtitle] = useState('');
  const [editableContent, setEditableContent] = useState<any[]>([]);

  const handleOpenContentEditor = () => {
    setEditableTitle('Контакты');
    setEditableSubtitle('');
    setEditableContent([]);
    setIsContentEditorOpen(true);
  };

  const handleSaveContent = async () => {
    try {
      // Здесь можно добавить API для сохранения контента страницы контактов
      toast.success('Контент страницы успешно обновлен');
      setIsContentEditorOpen(false);
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при сохранении контента');
    }
  };

  const renderContentElement = (element: any) => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${element.props?.level || 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        const HeadingComponent = HeadingTag;
        return (
          <HeadingComponent 
            className="text-2xl font-bold text-gray-900 mb-4 break-words"
            style={{ color: element.props?.color || '#000000' }}
          >
            {element.content}
          </HeadingComponent>
        );
      case 'paragraph':
        return (
          <p 
            className="text-gray-700 mb-4 leading-relaxed break-words"
            style={{ textIndent: element.props?.textIndent ? '1.5em' : '0' }}
          >
            {element.content}
          </p>
        );
      case 'list':
        const items = element.props?.items || [];
        return (
          <ul className="list-disc list-inside mb-4 space-y-2">
            {items.map((item: string, idx: number) => (
              <li key={idx} className="text-gray-700 break-words">{item}</li>
            ))}
          </ul>
        );
      case 'link':
        return (
          <a
            href={element.props?.href}
            target={element.props?.target || '_blank'}
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mb-4 inline-block break-words"
          >
            {element.content}
          </a>
        );
      case 'image':
        return (
          <div className="mb-6 flex flex-col items-center">
            <img 
              src={element.props?.src} 
              alt={element.props?.alt || ''}
              className="max-w-full h-auto rounded-lg object-contain"
              style={{ maxWidth: '800px', maxHeight: '400px' }}
              onError={(e) => {
                console.error('Image failed to load in ContactsPage:', element.props?.src);
                e.currentTarget.style.display = 'none';
              }}
            />
            {element.props?.alt && <p className="text-sm text-gray-500 mt-2 text-center">{element.props.alt}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Белый закругленный контейнер на фоне */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          {/* Заголовок */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-10 h-10 text-blue-600" />
                Контакты
              </h1>
              {isAuthenticated && isAdmin && (
                <Button
                  onClick={handleOpenContentEditor}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Управление контентом
                </Button>
              )}
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Свяжитесь с нами для получения дополнительной информации о наших услугах
            </p>
          </div>

          {/* Контактная информация */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Телефон
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">+375 (17) 123-45-67</p>
                <p className="text-sm text-gray-500">Пн-Пт: 9:00-18:00</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">info@aero.by</p>
                <p className="text-sm text-gray-500">info@aero.by</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Адрес
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">г. Минск</p>
                <p className="text-sm text-gray-500">ул. Примерная, 1</p>
              </CardContent>
            </Card>
          </div>

          {/* Дополнительный контент */}
          {editableContent && Array.isArray(editableContent) && editableContent.length > 0 && (
            <div className="w-full mb-12">
              <div className="py-8">
                {editableContent.map((element: any) => (
                  <div key={element.id}>
                    {renderContentElement(element)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Заглушка контента, если нет динамического контента */}
          {(!editableContent || editableContent.length === 0) && (
            <div className="w-full">
              <div className="bg-blue-50 py-12 text-center rounded-lg">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Контактная информация</h3>
                <p className="text-gray-500 mb-6">
                  Здесь будет размещена подробная контактная информация и форма обратной связи.
                </p>
                {isAuthenticated && isAdmin && (
                  <Button
                    onClick={handleOpenContentEditor}
                    variant="outline"
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Добавить контент
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Редактор контента страницы */}
      <Dialog open={isContentEditorOpen} onOpenChange={setIsContentEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white min-w-0 dialog-content">
          <DialogHeader>
            <DialogTitle>Управление контентом страницы контактов</DialogTitle>
            <DialogDescription>
              Редактируйте заголовок, подзаголовок и основной контент страницы контактов.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок страницы</label>
              <Input
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                placeholder="Контакты"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Подзаголовок</label>
              <Textarea
                value={editableSubtitle}
                onChange={(e) => setEditableSubtitle(e.target.value)}
                placeholder="Краткое описание контактной информации..."
                className="min-h-[80px] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Основной контент</label>
              <ContentConstructor
                content={editableContent}
                onChange={setEditableContent}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsContentEditorOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveContent}>
                Сохранить изменения
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}