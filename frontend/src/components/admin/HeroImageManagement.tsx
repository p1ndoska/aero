import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetCurrentHeroImageQuery, useUploadHeroImageMutation, useRemoveHeroImageMutation } from '@/app/services/heroImageApi';
import { toast } from 'sonner';
import { Upload, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { BASE_URL } from '@/constants';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return fallback;
  }

  const data = error.data;
  if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }

  return fallback;
};

const HeroImageManagement: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [selectedFallbackImage, setSelectedFallbackImage] = useState<File | null>(null);
  const [fallbackPreviewUrl, setFallbackPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const { data: currentImage, isLoading, refetch } = useGetCurrentHeroImageQuery();
  const { data: currentMedia, refetch: refetchMedia } = useGetCurrentHeroMediaQuery();
  const [uploadImage, { isLoading: isUploading }] = useUploadHeroImageMutation();
  const [uploadVideo, { isLoading: isUploadingVideo }] = useUploadHeroVideoMutation();
  const [uploadFallbackImage, { isLoading: isUploadingFallback }] = useUploadHeroFallbackImageMutation();
  const [removeImage, { isLoading: isRemoving }] = useRemoveHeroImageMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Выберите файл изображения');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Выберите файл для загрузки');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const result = await uploadImage(formData).unwrap();
      console.log('Результат загрузки:', result);
      toast.success('Изображение успешно загружено');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Ждем, чтобы файл точно сохранился на сервере
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Принудительно обновляем кэш несколько раз для надежности
      await refetch();
      setTimeout(() => {
        refetch();
      }, 300);
      setTimeout(() => {
        refetch();
      }, 1000);
      
      // Отправляем событие для обновления всех компонентов, использующих hero image
      // Делаем это с задержкой, чтобы данные успели обновиться
      setTimeout(() => {
        console.log('Отправка события heroImageUpdated');
        window.dispatchEvent(new CustomEvent('heroImageUpdated', { 
          detail: { timestamp: Date.now() } 
        }));
      }, 600);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ошибка при загрузке изображения'));
    }
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'video/mp4') {
      toast.error('Выберите видео в формате MP4');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error('Размер видео не должен превышать 500MB');
      return;
    }

    setSelectedVideo(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleFallbackSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Выберите файл изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер изображения не должен превышать 5MB');
      return;
    }

    setSelectedFallbackImage(file);
    setFallbackPreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoUpload = async () => {
    if (!selectedVideo) {
      toast.error('Выберите MP4-файл видео');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', selectedVideo);
      await uploadVideo(formData).unwrap();
      toast.success('Видео верхнего блока успешно загружено');
      setSelectedVideo(null);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
      await refetchMedia();
      window.dispatchEvent(new CustomEvent('heroMediaUpdated'));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ошибка при загрузке видео'));
    }
  };

  const handleFallbackUpload = async () => {
    if (!selectedFallbackImage) {
      toast.error('Выберите изображение fallback');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fallbackImage', selectedFallbackImage);
      await uploadFallbackImage(formData).unwrap();
      toast.success('Изображение для слабого соединения успешно загружено');
      setSelectedFallbackImage(null);
      if (fallbackPreviewUrl) URL.revokeObjectURL(fallbackPreviewUrl);
      setFallbackPreviewUrl(null);
      if (fallbackInputRef.current) fallbackInputRef.current.value = '';
      await refetchMedia();
      window.dispatchEvent(new CustomEvent('heroMediaUpdated'));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ошибка при загрузке изображения'));
    }
  };

  const handleRemove = async () => {
    try {
      await removeImage().unwrap();
      toast.success('Изображение удалено');
      refetch();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Ошибка при удалении изображения'));
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление медиа верхнего блока</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Управление медиа верхнего блока
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--color-primary)]">
            <Video className="h-5 w-5" />
            Видео верхнего блока
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Это видео показывается на главной странице при достаточной скорости соединения.
          </p>
          {currentMedia?.hasVideo && (
            <video
              src={`${BASE_URL}${currentMedia.videoUrl?.startsWith('/') ? '' : '/'}${currentMedia.videoUrl}?t=${Date.now()}`}
              controls
              className="mt-3 h-48 w-full max-w-md rounded-lg border object-cover"
            />
          )}
          <div className="mt-3 space-y-3">
            <Input
              ref={videoInputRef}
              type="file"
              accept="video/mp4"
              onChange={handleVideoSelect}
              className="file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500">Только MP4. Максимальный размер: 500MB</p>
            {videoPreviewUrl && (
              <video
                src={videoPreviewUrl}
                controls
                className="h-48 w-full max-w-md rounded-lg border object-cover"
              />
            )}
            <Button
              onClick={handleVideoUpload}
              disabled={!selectedVideo || isUploadingVideo}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploadingVideo ? 'Загрузка...' : 'Заменить видео'}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--color-primary)]">
            <ImageIcon className="h-5 w-5" />
            Картинка при слабом соединении
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Она показывается первой и остаётся, если видео не прошло проверку скорости.
          </p>
          {currentMedia?.hasFallbackImage && (
            <img
              src={`${BASE_URL}${currentMedia.fallbackImageUrl?.startsWith('/') ? '' : '/'}${currentMedia.fallbackImageUrl}?t=${Date.now()}`}
              alt="Картинка при слабом соединении"
              className="mt-3 h-48 w-full max-w-md rounded-lg border object-cover"
            />
          )}
          <div className="mt-3 space-y-3">
            <Input
              ref={fallbackInputRef}
              type="file"
              accept="image/*"
              onChange={handleFallbackSelect}
              className="file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500">JPG, PNG или GIF. Максимальный размер: 5MB</p>
            {fallbackPreviewUrl && (
              <img
                src={fallbackPreviewUrl}
                alt="Предварительный просмотр fallback"
                className="h-48 w-full max-w-md rounded-lg border object-cover"
              />
            )}
            <Button
              onClick={handleFallbackUpload}
              disabled={!selectedFallbackImage || isUploadingFallback}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploadingFallback ? 'Загрузка...' : 'Заменить картинку'}
            </Button>
          </div>
        </div>

        {/* Текущее изображение */}
        <div>
          <Label className="text-sm font-medium">Текущее изображение</Label>
          <div className="mt-2">
            {currentImage?.hasImage ? (
              <div className="relative">
                <img
                  src={`${BASE_URL}${currentImage.imageUrl?.startsWith('/') ? '' : '/'}${currentImage.imageUrl}?t=${Date.now()}`}
                  alt="Текущее изображение"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                  onError={() => {
                    console.error('Ошибка загрузки hero image:', currentImage.imageUrl);
                    console.error('Полный URL:', `${BASE_URL}${currentImage.imageUrl?.startsWith('/') ? '' : '/'}${currentImage.imageUrl}`);
                  }}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>Изображение не загружено</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Загрузка нового изображения */}
        <div>
          <Label className="text-sm font-medium">Загрузить новое изображение</Label>
          <div className="mt-2 space-y-4">
            <div>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Поддерживаемые форматы: JPG, PNG, GIF. Максимальный размер: 5MB
              </p>
            </div>

            {previewUrl && (
              <div>
                <Label className="text-sm font-medium">Предварительный просмотр</Label>
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Предварительный просмотр"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Загрузка...' : 'Загрузить'}
              </Button>
              
              {selectedFile && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  Отмена
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroImageManagement;
