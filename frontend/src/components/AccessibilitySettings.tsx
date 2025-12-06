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
import { useLanguage } from '@/contexts/LanguageContext';

const AccessibilitySettings: React.FC = () => {
  const { settings, updateSettings, resetSettings, isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();
  const { t } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-[#213659] text-[#213659]"
        >
          <Eye className="h-4 w-4" />
          {t('version_visually_impaired')}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] bg-white flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('accessibility_settings')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {/* Переключатель режима доступности */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('accessibility_mode')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="accessibility-mode" className="text-base">
                  {t('enable_visually_impaired')}
                </Label>
                <Switch
                  id="accessibility-mode"
                  checked={isAccessibilityMode}
                  onCheckedChange={toggleAccessibilityMode}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {t('accessibility_mode_description')}
              </p>
            </CardContent>
          </Card>

          {/* Настройки шрифта */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('text_settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Размер шрифта */}
              <div>
                <Label className="text-base">
                  {t('font_size')}: {Math.round(settings.fontSize * 100)}%
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
                  {t('font_size_recommendation')}
                </p>
              </div>

              {/* Межстрочный интервал */}
              <div>
                <Label className="text-base">
                  {t('line_spacing')}: {settings.lineHeight}x
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
                  {t('line_spacing_recommendation')}
                </p>
              </div>

              {/* Межбуквенный интервал */}
              <div>
                <Label className="text-base">
                  {t('letter_spacing')}: {settings.letterSpacing}px
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
                  {t('letter_spacing_recommendation')}
                </p>
              </div>

              {/* Семейство шрифтов */}
              <div>
                <Label className="text-base">{t('font_family')}</Label>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value: 'default' | 'arial') => updateSettings({ fontFamily: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">{t('standard_font')}</SelectItem>
                    <SelectItem value="arial">{t('arial_font')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  {t('arial_recommendation')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Настройки контрастности и цветов */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('colors_contrast')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Контрастность */}
              <div>
                <Label className="text-base">{t('contrast')}</Label>
                <Select
                  value={settings.contrast}
                  onValueChange={(value: 'normal' | 'high') => updateSettings({ contrast: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t('normal_contrast')}</SelectItem>
                    <SelectItem value="high">{t('high_contrast')}</SelectItem>
                  </SelectContent>
                </Select>
                
              </div>

              {/* Цветовая схема */}
              <div>
                <Label className="text-base">{t('color_scheme')}</Label>
                <Select
                  value={settings.colorScheme}
                  onValueChange={(value: 'normal' | 'dark' | 'inverted') => updateSettings({ colorScheme: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t('normal_contrast')}</SelectItem>
                    <SelectItem value="dark">{t('dark_scheme')}</SelectItem>
                    <SelectItem value="inverted">{t('inverted_scheme')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  {t('color_scheme_description')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные настройки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('additional_settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Уменьшение анимаций */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduce-motion" className="text-base">
                    {t('reduce_motion')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {t('reduce_motion_description')}
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
                    {t('show_focus')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {t('show_focus_description')}
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
              {t('reset')}
            </Button>
            <Button
              onClick={() => {
                // Закрыть диалог
                const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]') as HTMLButtonElement;
                closeButton?.click();
              }}
            >
              {t('apply')}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilitySettings;
