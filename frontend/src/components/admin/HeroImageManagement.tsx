import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetCurrentHeroImageQuery, useUploadHeroImageMutation, useRemoveHeroImageMutation } from '@/app/services/heroImageApi';
import { toast } from 'sonner';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { BASE_URL } from '@/constants';

const HeroImageManagement: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: currentImage, isLoading, refetch } = useGetCurrentHeroImageQuery();
  const [uploadImage, { isLoading: isUploading }] = useUploadHeroImageMutation();
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

      await uploadImage(formData).unwrap();
      toast.success('Изображение успешно загружено');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Ошибка при загрузке изображения');
    }
  };

  const handleRemove = async () => {
    try {
      await removeImage().unwrap();
      toast.success('Изображение удалено');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.error || 'Ошибка при удалении изображения');
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
          <CardTitle>Управление изображением верхнего блока</CardTitle>
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
          Управление изображением верхнего блока
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Текущее изображение */}
        <div>
          <Label className="text-sm font-medium">Текущее изображение</Label>
          <div className="mt-2">
            {currentImage?.hasImage ? (
              <div className="relative">
                <img
                  src={`${BASE_URL}${currentImage.imageUrl}`}
                  alt="Текущее изображение"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
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

