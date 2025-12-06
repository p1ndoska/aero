//@ts-nocheck
import React, { useState } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useDeleteAccountMutation } from '../app/services/userProfileApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { BASE_URL } from '../constants';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building, 
  FileText, 
  Lock, 
  Trash2,
  Settings,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserProfile() {
  const { t } = useLanguage();
  const { token } = useSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useGetProfileQuery();
  
  // Отладочная информация
  React.useEffect(() => {
    console.log('Profile loading:', profileLoading);
    console.log('Profile error:', profileError);
    console.log('Profile data:', profile);
    console.log('Token:', localStorage.getItem('token'));
  }, [profileLoading, profileError, profile]);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: '',
    position: '',
    department: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteData, setDeleteData] = useState({
    password: ''
  });

  // Инициализация формы при загрузке профиля
  React.useEffect(() => {
    if (profile) {
      console.log('Updating formData from profile:', profile);
      const newFormData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        middleName: profile.middleName || '',
        phone: profile.phone || '',
        birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
        gender: profile.gender || '',
        address: profile.address || '',
        position: profile.position || '',
        department: profile.department || '',
        bio: profile.bio || ''
      };
      console.log('Setting formData to:', newFormData);
      setFormData(newFormData);
    }
  }, [profile]);

  // Проверка авторизации после всех хуков
  if (!token && !localStorage.getItem('token')) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      console.log('Saving profile with data:', formData);
      const result = await updateProfile(formData).unwrap();
      console.log('Profile update result:', result);
      console.log('Current profile before refetch:', profile);
      toast.success(t('profile_updated_successfully'));
      setIsEditing(false);
      // Принудительно обновляем данные профиля
      // invalidatesTags должен автоматически обновить кеш, но refetch гарантирует обновление
      const refetchedData = await refetchProfile();
      console.log('Refetched profile data:', refetchedData.data);
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.data?.error || error.data?.details || t('error_updating_profile'));
    }
  };


  const handleChangePassword = async () => {
    // Валидация на фронтенде
    if (!passwordData.currentPassword) {
      toast.error((t('current_password') || 'Текущий пароль') + ' обязателен');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error((t('new_password') || 'Новый пароль') + ' обязателен');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('passwords_do_not_match'));
      return;
    }

    try {
      console.log('Changing password...', {
        hasCurrentPassword: !!passwordData.currentPassword,
        newPasswordLength: passwordData.newPassword.length
      });

      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }).unwrap();

      console.log('Password changed successfully:', result);
      toast.success(t('password_changed_successfully'));
      setIsChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Обновляем профиль после смены пароля
      refetchProfile();
    } catch (error: any) {
      console.error('Error changing password:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error data:', error?.data);
      console.error('Error status:', error?.status);
      console.error('Error message:', error?.message);
      
      // RTK Query может возвращать ошибку в разных форматах
      let errorMessage = t('error_changing_password');
      
      // Проверяем разные возможные форматы ошибки RTK Query
      if (error?.data) {
        // Формат: { data: { error: '...', errors: [...] } }
        if (typeof error.data === 'string') {
          errorMessage = error.data;
        } else if (error.data.errors && Array.isArray(error.data.errors) && error.data.errors.length > 0) {
          // Показываем все ошибки валидации
          errorMessage = error.data.error || 'Пароль не соответствует требованиям';
          const errorsList = error.data.errors.map((err: string) => `• ${err}`).join('\n');
          
          // Показываем toast с детальными ошибками
          toast.error(
            `${errorMessage}\n\n${errorsList}`,
            {
              autoClose: 10000,
            }
          );
          return; // Выходим, так как уже показали toast
        } else if (error.data.error) {
          errorMessage = error.data.error;
        } else if (error.data.details) {
          errorMessage = error.data.details;
        } else if (typeof error.data === 'object') {
          // Попробуем найти любую строку в объекте
          const errorString = Object.values(error.data).find(v => typeof v === 'string');
          if (errorString) {
            errorMessage = errorString;
          } else {
            errorMessage = JSON.stringify(error.data);
          }
        }
      } else if (error?.error) {
        // Формат: { error: '...' }
        errorMessage = error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('Final error message:', errorMessage);
      
      toast.error(errorMessage, {
        autoClose: 5000
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount({ password: deleteData.password }).unwrap();
      toast.success(t('account_deleted_successfully'));
      // Перенаправление на главную страницу
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.data?.error || t('error_deleting_account'));
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading_profile')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">{t('error_loading_profile')}</p>
          <p className="text-gray-600 mt-2">
            {profileError?.data?.error || t('try_refresh_page')}
          </p>
          <Button 
            onClick={() => refetchProfile()} 
            className="mt-4"
            variant="outline"
          >
            {t('try_again')}
          </Button>
        </div>
      </div>
    );
  }

  if (!profile && !profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">{t('profile_not_found')}</p>
          <p className="text-gray-600 mt-2">
            {t('not_authorized_error')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Белый закругленный контейнер на фоне */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#213659] mb-2">{t('profile')}</h1>
          <p className="text-gray-600">{t('manage_profile_settings')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Боковая панель */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar ? `${BASE_URL}${profile.avatar}` : undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile.firstName?.[0] || profile.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-[#213659] break-words">
                    {profile.firstName && profile.lastName 
                      ? `${profile.firstName} ${profile.lastName}` 
                      : profile.email
                    }
                  </h2>
                  <Badge variant="secondary" className="mt-2">
                    {profile.role.name}
                  </Badge>
                </div>

                {/* Информация о регистрации */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{t('registration_date')}: {new Date(profile.createdAt).toLocaleDateString()}</p>
                  {profile.lastLoginAt && (
                    <p>{t('last_login')}: {new Date(profile.lastLoginAt).toLocaleDateString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
                <TabsTrigger value="settings">{t('account_settings')}</TabsTrigger>
                <TabsTrigger value="security">{t('security')}</TabsTrigger>
              </TabsList>

              {/* Вкладка профиля */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('personal_info')}
                      </CardTitle>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        disabled={isUpdating}
                      >
                        {isEditing ? (
                          isUpdating ? (
                            <>
                              <Save className="w-4 h-4 mr-2 animate-spin" />
                              {t('saving')}
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {t('save')}
                            </>
                          )
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('edit')}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('first_name')} *</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!isEditing}
                          placeholder={t('enter_first_name')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('last_name')} *</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!isEditing}
                          placeholder={t('enter_last_name')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('middle_name')}</label>
                        <Input
                          value={formData.middleName}
                          onChange={(e) => handleInputChange('middleName', e.target.value)}
                          disabled={!isEditing}
                          placeholder={t('enter_middle_name')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('phone')}</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="+375 (XX) XXX-XX-XX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('date_of_birth')}</label>
                        <Input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('gender')}</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">{t('choose_gender')}</option>
                          <option value="male">{t('male')}</option>
                          <option value="female">{t('female')}</option>
                          <option value="other">{t('other')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">{t('address')}</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        placeholder={t('enter_address')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('position')}</label>
                        <Input
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          disabled={!isEditing}
                          placeholder={t('enter_position')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('department')}</label>
                        <Input
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          disabled={!isEditing}
                          placeholder={t('enter_department')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">{t('about_me')}</label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder={t('tell_about_yourself')}
                        rows={4}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={isUpdating}>
                          <Save className="w-4 h-4 mr-2" />
                          {t('save_changes')}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false);
                            // Восстанавливаем исходные данные
                            if (profile) {
                              setFormData({
                                firstName: profile.firstName || '',
                                lastName: profile.lastName || '',
                                middleName: profile.middleName || '',
                                phone: profile.phone || '',
                                birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
                                gender: profile.gender || '',
                                address: profile.address || '',
                                position: profile.position || '',
                                department: profile.department || '',
                                bio: profile.bio || ''
                              });
                            }
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          {t('cancel')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Вкладка настроек */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      {t('account_settings')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('email')}</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Input value={profile.email} disabled className="bg-gray-50" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">{t('role')}</label>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <Input value={profile.role.name} disabled className="bg-gray-50" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Вкладка безопасности */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      {t('security')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Информация о пароле */}
                    {profile && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                        <div>
                          <h3 className="font-medium text-sm text-gray-700 mb-1">{t('password_info') || 'Информация о пароле'}</h3>
                          {profile.passwordChangedAt ? (
                            <>
                              <p className="text-sm text-gray-600">
                                {t('last_password_change') || 'Последняя смена пароля'}:{' '}
                                <span className="font-medium">
                                  {new Date(profile.passwordChangedAt).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </p>
                              {(() => {
                                const adminRoles = ['SUPER_ADMIN', 'NEWS_ADMIN', 'ABOUT_ADMIN', 'AIRNAV_ADMIN', 
                                                  'APPEALS_ADMIN', 'SOCIAL_ADMIN', 'MEDIA_ADMIN'];
                                const isAdmin = adminRoles.includes(profile.role?.name?.toUpperCase() || '');
                                const maxDays = isAdmin ? 180 : 365;
                                const changedAt = new Date(profile.passwordChangedAt);
                                const now = new Date();
                                const daysSinceChange = Math.floor((now.getTime() - changedAt.getTime()) / (1000 * 60 * 60 * 24));
                                const daysRemaining = maxDays - daysSinceChange;
                                const isExpired = daysRemaining <= 0;
                                
                                // Форматирование дней для русского языка
                                const getDaysText = (days: number) => {
                                  if (days === 1) return 'день';
                                  if (days >= 2 && days <= 4) return 'дня';
                                  return 'дней';
                                };
                                
                                const daysText = getDaysText(daysRemaining);
                                const expiresText = daysRemaining <= 30 
                                  ? (t('password_expires_soon') || 'Пароль нужно будет сменить через').replace('{days}', `${daysRemaining} ${daysText}`)
                                  : (t('password_expires_in') || 'Пароль нужно будет сменить через').replace('{days}', `${daysRemaining} ${daysText}`);
                                
                                return (
                                  <p className={`text-sm ${isExpired ? 'text-red-600 font-medium' : daysRemaining <= 30 ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                                    {isExpired 
                                      ? (t('password_expired') || 'Пароль истек. Требуется смена пароля.')
                                      : expiresText
                                    }
                                  </p>
                                );
                              })()}
                            </>
                          ) : (
                            <p className="text-sm text-gray-600">
                              {t('password_never_changed') || 'Пароль никогда не менялся'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{t('password')}</h3>
                        <p className="text-sm text-gray-600">{t('change_password_description')}</p>
                      </div>
                      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Lock className="w-4 h-4 mr-2" />
                            {t('change_password')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white">
                          <DialogHeader>
                            <DialogTitle>{t('changing_password')}</DialogTitle>
                            <DialogDescription>
                              {t('change_password_description_modal')}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">{t('current_password')}</label>
                              <Input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder={t('enter_current_password')}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">{t('new_password')}</label>
                              <Input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder={t('enter_new_password')}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">{t('confirm_password')}</label>
                              <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder={t('confirm_new_password')}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                                {isChangingPassword ? t('changing') : t('change_password')}
                              </Button>
                              <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                                {t('cancel')}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-red-600">{t('delete_account')}</h3>
                          <p className="text-sm text-gray-600">{t('delete_account_irreversible')}</p>
                        </div>
                        <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                          <DialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('delete_account')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('delete_account_title')}</DialogTitle>
                              <DialogDescription>
                                {t('delete_account_description')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-red-600">
                                {t('delete_account_warning_text')}
                              </p>
                              <div>
                                <label className="block text-sm font-medium mb-2">{t('confirm_password_delete')}</label>
                                <Input
                                  type="password"
                                  value={deleteData.password}
                                  onChange={(e) => setDeleteData(prev => ({ ...prev, password: e.target.value }))}
                                  placeholder={t('enter_password_confirmation')}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                                  {isDeletingAccount ? t('deleting') : t('delete_account')}
                                </Button>
                                <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                                  {t('cancel')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </div> {/* Закрытие белого закругленного контейнера */}
      </div>
    </div>
  );
}
