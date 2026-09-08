import React, { useState } from 'react';
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

interface AccessibilitySettingsProps {
  variant?: 'default' | 'header' | 'header-mobile';
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ variant = 'default' }) => {
  const { settings, updateSettings, resetSettings, isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const triggerClassName =
    variant === 'header'
      ? 'site-header__icon-btn site-header__a11y-btn'
      : variant === 'header-mobile'
        ? 'header-mobile__a11y-btn'
        : 'flex items-center gap-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--a11y-settings-accent-soft)] hover:bg-[var(--a11y-settings-accent-soft-hover)]';

  const triggerContent =
    variant === 'header' || variant === 'header-mobile' ? (
      <Eye className="site-header__action-icon" />
    ) : (
      <>
        <Eye className="h-4 w-4" />
        {t('version_visually_impaired')}
      </>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant === 'default' ? 'outline' : 'ghost'}
          size={variant === 'default' ? 'sm' : 'icon'}
          className={triggerClassName}
          aria-label={t('version_visually_impaired')}
        >
          {triggerContent}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="accessibility-settings-dialog max-w-2xl max-h-[90vh] bg-white flex flex-col">
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
                  className="focus-visible:ring-[var(--color-focus-ring)] data-[state=checked]:bg-[var(--color-primary)]"
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
                  className="mt-2 accessibility-settings-slider [&_.bg-primary]:bg-[var(--color-primary)] [&_[role=slider]]:border-[var(--color-primary)]"
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
                  className="mt-2 accessibility-settings-slider [&_.bg-primary]:bg-[var(--color-primary)] [&_[role=slider]]:border-[var(--color-primary)]"
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
                  className="mt-2 accessibility-settings-slider [&_.bg-primary]:bg-[var(--color-primary)] [&_[role=slider]]:border-[var(--color-primary)]"
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
                  <SelectTrigger className="mt-2 focus:ring-[var(--color-focus-ring)] focus:border-[var(--color-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="accessibility-settings-select-content">
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
                  <SelectTrigger className="mt-2 focus:ring-[var(--color-focus-ring)] focus:border-[var(--color-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="accessibility-settings-select-content">
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
                  <SelectTrigger className="mt-2 focus:ring-[var(--color-focus-ring)] focus:border-[var(--color-primary)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="accessibility-settings-select-content">
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
                  className="focus-visible:ring-[var(--color-focus-ring)] data-[state=checked]:bg-[var(--color-primary)]"
                />
              </div>

              {/* Черно-белый режим */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="grayscale" className="text-base">
                    {t('grayscale')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {t('grayscale_description')}
                  </p>
                </div>
                <Switch
                  id="grayscale"
                  checked={settings.grayscale}
                  onCheckedChange={(checked) => updateSettings({ grayscale: checked })}
                  className="focus-visible:ring-[var(--color-focus-ring)] data-[state=checked]:bg-[var(--color-primary)]"
                />
              </div>

              {/* Отключить изображения */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hide-images" className="text-base">
                    {t('hide_images')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {t('hide_images_description')}
                  </p>
                </div>
                <Switch
                  id="hide-images"
                  checked={settings.hideImages}
                  onCheckedChange={(checked) => updateSettings({ hideImages: checked })}
                  className="focus-visible:ring-[var(--color-focus-ring)] data-[state=checked]:bg-[var(--color-primary)]"
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
                  className="focus-visible:ring-[var(--color-focus-ring)] data-[state=checked]:bg-[var(--color-primary)]"
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
              onClick={() => setOpen(false)}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
            >
              {t('apply_settings')}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilitySettings;
