//@ts-nocheck
import React, { useState } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation, useUpdateAvatarMutation, useChangePasswordMutation, useGetUserStatsQuery, useDeleteAccountMutation } from '../app/services/userProfileApi';
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
import { Progress } from './ui/progress';
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
  Camera, 
  Lock, 
  Trash2,
  Settings,
  BarChart3,
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
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetUserStatsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updateAvatar, { isLoading: isUploadingAvatar }] = useUpdateAvatarMutation();
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
      await updateProfile(formData).unwrap();
      toast.success('Профиль успешно обновлен');
      setIsEditing(false);
      refetchProfile();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении профиля');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await updateAvatar(formData).unwrap();
      toast.success('Аватар успешно обновлен');
      refetchProfile();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при загрузке аватара');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }).unwrap();
      toast.success('Пароль успешно изменен');
      setIsChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при изменении пароля');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount({ password: deleteData.password }).unwrap();
      toast.success('Аккаунт успешно удален');
      // Перенаправление на главную страницу
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении аккаунта');
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Ошибка загрузки профиля</p>
          <p className="text-gray-600 mt-2">
            {profileError?.data?.error || 'Попробуйте обновить страницу'}
          </p>
          <Button 
            onClick={() => refetchProfile()} 
            className="mt-4"
            variant="outline"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (!profile && !profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Профиль не найден</p>
          <p className="text-gray-600 mt-2">
            Возможно, вы не авторизованы или произошла ошибка
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
          <h1 className="text-3xl font-bold text-[#213659] mb-2">Личный кабинет</h1>
          <p className="text-gray-600">Управляйте своим профилем и настройками</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Боковая панель */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={profile.avatar ? `${BASE_URL}${profile.avatar}` : undefined} />
                      <AvatarFallback className="text-2xl">
                        {profile.firstName?.[0] || profile.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </div>
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

                {/* Статистика */}
                {stats && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Заполненность профиля</span>
                        <span>{stats.profileCompleteness}%</span>
                      </div>
                      <Progress value={stats.profileCompleteness} className="h-2" />
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Регистрация: {new Date(profile.createdAt).toLocaleDateString()}</p>
                      {profile.lastLoginAt && (
                        <p>Последний вход: {new Date(profile.lastLoginAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Профиль</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
                <TabsTrigger value="security">Безопасность</TabsTrigger>
              </TabsList>

              {/* Вкладка профиля */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Личная информация
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
                              Сохранение...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Сохранить
                            </>
                          )
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Имя *</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Введите имя"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Фамилия *</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Введите фамилию"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Отчество</label>
                        <Input
                          value={formData.middleName}
                          onChange={(e) => handleInputChange('middleName', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Введите отчество"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Телефон</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="+375 (XX) XXX-XX-XX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Дата рождения</label>
                        <Input
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Пол</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Выберите пол</option>
                          <option value="male">Мужской</option>
                          <option value="female">Женский</option>
                          <option value="other">Другой</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Адрес</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Введите адрес"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Должность</label>
                        <Input
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Введите должность"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Отдел</label>
                        <Input
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Введите отдел"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">О себе</label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Расскажите о себе..."
                        rows={4}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={isUpdating}>
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить изменения
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
                          Отмена
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
                      Настройки аккаунта
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Input value={profile.email} disabled className="bg-gray-50" />
                        <Badge variant={profile.isEmailVerified ? "default" : "secondary"}>
                          {profile.isEmailVerified ? "Подтвержден" : "Не подтвержден"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Роль</label>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <Input value={profile.role.name} disabled className="bg-gray-50" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Статус аккаунта</label>
                      <div className="flex items-center gap-2">
                        <Badge variant={profile.isActive ? "default" : "destructive"}>
                          {profile.isActive ? "Активен" : "Заблокирован"}
                        </Badge>
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
                      Безопасность
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Пароль</h3>
                        <p className="text-sm text-gray-600">Измените свой пароль</p>
                      </div>
                      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Lock className="w-4 h-4 mr-2" />
                            Изменить пароль
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Изменение пароля</DialogTitle>
                            <DialogDescription>
                              Введите текущий пароль и новый пароль для изменения.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Текущий пароль</label>
                              <Input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="Введите текущий пароль"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Новый пароль</label>
                              <Input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Введите новый пароль"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Подтвердите пароль</label>
                              <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Подтвердите новый пароль"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                                {isChangingPassword ? "Изменение..." : "Изменить пароль"}
                              </Button>
                              <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                                Отмена
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-red-600">Удалить аккаунт</h3>
                          <p className="text-sm text-gray-600">Это действие необратимо</p>
                        </div>
                        <Dialog open={isDeleteAccountOpen} onOpenChange={setIsDeleteAccountOpen}>
                          <DialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Удалить аккаунт
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Удаление аккаунта</DialogTitle>
                              <DialogDescription>
                                Это действие необратимо. Подтвердите паролем для удаления аккаунта.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-red-600">
                                Внимание! Это действие необратимо. Все ваши данные будут удалены навсегда.
                              </p>
                              <div>
                                <label className="block text-sm font-medium mb-2">Подтвердите паролем</label>
                                <Input
                                  type="password"
                                  value={deleteData.password}
                                  onChange={(e) => setDeleteData(prev => ({ ...prev, password: e.target.value }))}
                                  placeholder="Введите пароль для подтверждения"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                                  {isDeletingAccount ? "Удаление..." : "Удалить аккаунт"}
                                </Button>
                                <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                                  Отмена
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
