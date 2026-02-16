//@ts-nocheck
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import ContentConstructor from './ContentConstructor';

interface MultilingualContentEditorProps {
  // Данные для русского языка
  titleRu: string;
  subtitleRu: string;
  contentRu: any[];
  // Данные для английского языка
  titleEn: string;
  subtitleEn: string;
  contentEn: any[];
  // Данные для белорусского языка
  titleBe: string;
  subtitleBe: string;
  contentBe: any[];
  // Callbacks для обновления данных
  onTitleRuChange: (value: string) => void;
  onSubtitleRuChange: (value: string) => void;
  onContentRuChange: (content: any[]) => void;
  onTitleEnChange: (value: string) => void;
  onSubtitleEnChange: (value: string) => void;
  onContentEnChange: (content: any[]) => void;
  onTitleBeChange: (value: string) => void;
  onSubtitleBeChange: (value: string) => void;
  onContentBeChange: (content: any[]) => void;
  // Placeholders
  titlePlaceholder?: string;
  subtitlePlaceholder?: string;
  // Скрыть поля title и subtitle (для новостей)
  hideTitleSubtitle?: boolean;
}

export default function MultilingualContentEditor({
  titleRu,
  subtitleRu,
  contentRu,
  titleEn,
  subtitleEn,
  contentEn,
  titleBe,
  subtitleBe,
  contentBe,
  onTitleRuChange,
  onSubtitleRuChange,
  onContentRuChange,
  onTitleEnChange,
  onSubtitleEnChange,
  onContentEnChange,
  onTitleBeChange,
  onSubtitleBeChange,
  onContentBeChange,
  titlePlaceholder = 'Введите заголовок',
  subtitlePlaceholder = 'Введите подзаголовок',
  hideTitleSubtitle = false
}: MultilingualContentEditorProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('ru');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ru">Русский</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="be">Беларуская</TabsTrigger>
        </TabsList>

        {/* Русский язык */}
        <TabsContent value="ru" className="space-y-6 mt-6">
          {!hideTitleSubtitle && (
            <>
              <div>
                <Label htmlFor="title-ru" className="block text-sm font-medium mb-2">
                  {t('page_title')} (RU)
                </Label>
                <Input
                  id="title-ru"
                  value={titleRu}
                  onChange={(e) => onTitleRuChange(e.target.value)}
                  placeholder={titlePlaceholder}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="subtitle-ru" className="block text-sm font-medium mb-2">
                  {t('subtitle')} (RU)
                </Label>
                <Textarea
                  id="subtitle-ru"
                  value={subtitleRu}
                  onChange={(e) => onSubtitleRuChange(e.target.value)}
                  placeholder={subtitlePlaceholder}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </>
          )}
          <div>
            <Label className="block text-sm font-medium mb-4">
              {t('main_content')} (RU)
            </Label>
            <ContentConstructor
              content={contentRu}
              onChange={onContentRuChange}
            />
          </div>
        </TabsContent>

        {/* Английский язык */}
        <TabsContent value="en" className="space-y-6 mt-6">
          {!hideTitleSubtitle && (
            <>
              <div>
                <Label htmlFor="title-en" className="block text-sm font-medium mb-2">
                  {t('page_title')} (EN)
                </Label>
                <Input
                  id="title-en"
                  value={titleEn}
                  onChange={(e) => onTitleEnChange(e.target.value)}
                  placeholder={titlePlaceholder}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="subtitle-en" className="block text-sm font-medium mb-2">
                  {t('subtitle')} (EN)
                </Label>
                <Textarea
                  id="subtitle-en"
                  value={subtitleEn}
                  onChange={(e) => onSubtitleEnChange(e.target.value)}
                  placeholder={subtitlePlaceholder}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </>
          )}
          <div>
            <Label className="block text-sm font-medium mb-4">
              {t('main_content')} (EN)
            </Label>
            <ContentConstructor
              content={contentEn}
              onChange={onContentEnChange}
            />
          </div>
        </TabsContent>

        {/* Белорусский язык */}
        <TabsContent value="be" className="space-y-6 mt-6">
          {!hideTitleSubtitle && (
            <>
              <div>
                <Label htmlFor="title-be" className="block text-sm font-medium mb-2">
                  {t('page_title')} (BE)
                </Label>
                <Input
                  id="title-be"
                  value={titleBe}
                  onChange={(e) => onTitleBeChange(e.target.value)}
                  placeholder={titlePlaceholder}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="subtitle-be" className="block text-sm font-medium mb-2">
                  {t('subtitle')} (BE)
                </Label>
                <Textarea
                  id="subtitle-be"
                  value={subtitleBe}
                  onChange={(e) => onSubtitleBeChange(e.target.value)}
                  placeholder={subtitlePlaceholder}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </>
          )}
          <div>
            <Label className="block text-sm font-medium mb-4">
              {t('main_content')} (BE)
            </Label>
            <ContentConstructor
              content={contentBe}
              onChange={onContentBeChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

