import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Eye, RotateCcw } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

const AccessibilitySettings: React.FC = () => {
  const { settings, updateSettings, resetSettings, isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-[#213659] text-[#213659]"
        >
          <Eye className="h-4 w-4" />
          Версия для слабовидящих
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки доступности
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Переключатель режима доступности */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Режим доступности</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="accessibility-mode" className="text-base">
                  Включить версию для слабовидящих
                </Label>
                <Switch
                  id="accessibility-mode"
                  checked={isAccessibilityMode}
                  onCheckedChange={toggleAccessibilityMode}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Включает специальные настройки для улучшения доступности сайта
              </p>
            </CardContent>
          </Card>

          {/* Настройки шрифта */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Настройки текста</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Размер шрифта */}
              <div>
                <Label className="text-base">
                  Размер шрифта: {Math.round(settings.fontSize * 100)}%
                </Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSettings({ fontSize: value })}
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Рекомендуется увеличение до 200% для слабовидящих
                </p>
              </div>

              {/* Межстрочный интервал */}
              <div>
                <Label className="text-base">
                  Межстрочный интервал: {settings.lineHeight}x
                </Label>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSettings({ lineHeight: value })}
                  min={1.0}
                  max={2.0}
                  step={0.1}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Рекомендуется 1.5x для лучшей читаемости
                </p>
              </div>

              {/* Межбуквенный интервал */}
              <div>
                <Label className="text-base">
                  Межбуквенный интервал: {settings.letterSpacing}px
                </Label>
                <Slider
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSettings({ letterSpacing: value })}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Увеличение интервала между буквами для лучшей читаемости
                </p>
              </div>

              {/* Семейство шрифтов */}
              <div>
                <Label className="text-base">Семейство шрифтов</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value: 'default' | 'arial') => updateSettings({ fontFamily: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Стандартный шрифт</SelectItem>
                    <SelectItem value="arial">Arial</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  Arial рекомендуется для лучшей читаемости
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Настройки контрастности и цветов */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Цвета и контрастность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Контрастность */}
              <div>
                <Label className="text-base">Контрастность</Label>
                <Select
                  value={settings.contrast}
                  onValueChange={(value: 'normal' | 'high') => updateSettings({ contrast: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Обычная</SelectItem>
                    <SelectItem value="high">Высокая (7:1)</SelectItem>
                  </SelectContent>
                </Select>
                
              </div>

              {/* Цветовая схема */}
              <div>
                <Label className="text-base">Цветовая схема</Label>
                <Select
                  value={settings.colorScheme}
                  onValueChange={(value: 'normal' | 'dark' | 'inverted') => updateSettings({ colorScheme: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Обычная</SelectItem>
                    <SelectItem value="dark">Темная</SelectItem>
                    <SelectItem value="inverted">Инвертированная</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  Позволяет выбрать удобную цветовую схему
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные настройки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Дополнительные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Уменьшение анимаций */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduce-motion" className="text-base">
                    Уменьшить анимации
                  </Label>
                  <p className="text-sm text-gray-600">
                    Отключает анимации для пользователей с вестибулярными расстройствами
                  </p>
                </div>
                <Switch
                  id="reduce-motion"
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) => updateSettings({ reduceMotion: checked })}
                />
              </div>

              {/* Показ фокуса */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-focus" className="text-base">
                    Подсветка фокуса
                  </Label>
                  <p className="text-sm text-gray-600">
                    Четко показывает элемент в фокусе для навигации с клавиатуры
                  </p>
                </div>
                <Switch
                  id="show-focus"
                  checked={settings.showFocus}
                  onCheckedChange={(checked) => updateSettings({ showFocus: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Кнопки управления */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить
            </Button>
            <Button
              onClick={() => {
                // Закрыть диалог
                const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
                closeButton?.click();
              }}
            >
              Применить
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilitySettings;
