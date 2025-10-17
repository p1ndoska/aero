import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetAllServicesCategoriesQuery } from '../app/services/servicesCategoryApi';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, ArrowRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceRequestForm from './ServiceRequestForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const ServicesPage = () => {
  const { t, language } = useLanguage();
  const { data: categories = [], isLoading, error } = useGetAllServicesCategoriesQuery();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ type: string; name: string } | null>(null);

  const getTranslatedField = (item: any, field: string) => {
    if (language === 'en' && item[`${field}En`]) return item[`${field}En`];
    if (language === 'be' && item[`${field}Be`]) return item[`${field}Be`];
    return item[field] || item[`${field}En`] || item[`${field}Be`] || '';
  };

  const handleRequestService = (serviceType: string, serviceName: string) => {
    setSelectedService({ type: serviceType, name: serviceName });
    setIsRequestDialogOpen(true);
  };

  const handleCloseRequestDialog = () => {
    setIsRequestDialogOpen(false);
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка услуг...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Ошибка загрузки</h1>
            <p className="text-gray-600">Не удалось загрузить информацию об услугах</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                {language === 'en' ? 'Services' : language === 'be' ? 'Паслугі' : 'Услуги'}
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Information about the services provided by the enterprise.' 
                : language === 'be' 
                ? 'Інфармацыя пра паслугі, якія прадастаўляе прадпрыемства.'
                : 'Информация об услугах, предоставляемых предприятием.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {language === 'en' ? 'No services available' : language === 'be' ? 'Паслугі не даступныя' : 'Услуги недоступны'}
            </h3>
            <p className="text-gray-500">
              {language === 'en' 
                ? 'Services will be added soon.' 
                : language === 'be' 
                ? 'Паслугі будуць дададзены ў бліжэйшы час.'
                : 'Услуги будут добавлены в ближайшее время.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {getTranslatedField(category, 'name')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getTranslatedField(category, 'description') && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {getTranslatedField(category, 'description')}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link to={`/services/${category.pageType}`} className="flex-1">
                      <Button className="w-full transition-colors bg-[#213659] text-white hover:bg-[#1a2a4a] focus:ring-2 focus:ring-offset-2 focus:ring-[#213659]">
                        {language === 'en' ? 'Learn more' : language === 'be' ? 'Даведацца больш' : 'Подробнее'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleRequestService(category.pageType, getTranslatedField(category, 'name'))}
                      className="px-4 transition-colors border-[#213659] text-[#213659] hover:bg-[#213659] hover:text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Диалог подачи заявки */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Service Request' : language === 'be' ? 'Заяўка на паслугу' : 'Заявка на услугу'}
            </DialogTitle>
          </DialogHeader>
          {selectedService && (
            <ServiceRequestForm
              serviceType={selectedService.type}
              serviceName={selectedService.name}
              onClose={handleCloseRequestDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
