//@ts-nocheck
import React, { useState } from 'react';
import { useForceChangePasswordMutation } from '../app/services/userProfileApi';
import { useDispatch } from 'react-redux';
import { clearMustChangePassword } from '../features/user/userSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
}

export const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ isOpen }) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [forceChangePassword, { isLoading }] = useForceChangePasswordMutation();
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Валидация
    if (!passwordData.newPassword) {
      setErrors({ newPassword: t('password_required') || 'Пароль обязателен' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: t('passwords_do_not_match') || 'Пароли не совпадают' });
      return;
    }

    try {
      await forceChangePassword({ newPassword: passwordData.newPassword }).unwrap();
      toast.success(t('password_changed_successfully') || 'Пароль успешно изменен', {
        position: "top-right",
      });
      // Очищаем флаг принудительной смены пароля
      dispatch(clearMustChangePassword());
      setPasswordData({ newPassword: '', confirmPassword: '' });
      
      // Обновляем токен после смены пароля (может потребоваться перелогин)
      // Но обычно сервер возвращает новый токен, который нужно сохранить
    } catch (err: any) {
      const errorMessage = err.data?.error || err.data?.errors?.join(', ') || t('error_changing_password') || 'Ошибка при смене пароля';
      toast.error(errorMessage, {
        position: "top-right",
      });
      if (err.data?.errors) {
        setErrors({ newPassword: err.data.errors.join(', ') });
      }
    }
  };

  // Не позволяем закрыть модальное окно, если пароль не изменен
  const handleOpenChange = (open: boolean) => {
    // Игнорируем попытки закрыть модальное окно
    if (!open) {
      return;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-red-300 rounded-lg" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-[#213659] text-xl">
            {t('force_password_change_title') || 'Требуется смена пароля'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t('force_password_change_description') || 'Для безопасности вашего аккаунта необходимо изменить пароль при первом входе.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Новый пароль */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-[#213659]">
              {t('new_password') || 'Новый пароль'} *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A81A9] h-4 w-4" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder={t('enter_new_password') || "Введите новый пароль"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                className={`pl-10 pr-10 bg-white border-[#B1D1E0] text-[#213659] focus:border-[#213659] ${errors.newPassword ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A81A9] hover:text-[#213659]"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          {/* Подтверждение пароля */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[#213659]">
              {t('confirm_password') || 'Подтвердите пароль'} *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A81A9] h-4 w-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('confirm_new_password') || "Подтвердите новый пароль"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className={`pl-10 pr-10 bg-white border-[#B1D1E0] text-[#213659] focus:border-[#213659] ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A81A9] hover:text-[#213659]"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#213659] hover:bg-[#1a2a4a] text-white"
            disabled={isLoading}
          >
            {isLoading ? (t('changing') || "Изменение...") : (t('change_password') || "Изменить пароль")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

