import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BASE_URL } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';

interface ELTDeregistrationData {
  // Информация по ELT
  eltCode: string[]; // 15 символов
  eltModel: string;
  eltSerialNumber: string;
  
  // Информация о воздушном судне
  aircraftType: string;
  aircraftModel: string;
  aircraftRegistration: string;
  
  // Информация об эксплуатанте
  operator: string;
  operatorAddress: string;
  operatorWorkPhone: string;
  operatorMobilePhone: string;
  operatorEmail: string;
  
  // Данные ответственного за снятие с регистрации
  responsiblePerson: string;
  responsiblePhone: string;
  responsibleEmail: string;
  
  // Реквизиты для выставления счёта
  billingFullName: string;
  billingShortName: string;
  billingLegalAddress: string;
  billingMailingAddress: string;
  billingUNP: string;
  
  // Дата и подпись
  date: string;
  signature: string;
}

export default function ELTDeregistrationForm() {
  const { t } = useLanguage();
  const eltCodeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<ELTDeregistrationData>({
    eltCode: Array(15).fill(''),
    eltModel: '',
    eltSerialNumber: '',
    aircraftType: '',
    aircraftModel: '',
    aircraftRegistration: '',
    operator: '',
    operatorAddress: '',
    operatorWorkPhone: '',
    operatorMobilePhone: '',
    operatorEmail: '',
    responsiblePerson: '',
    responsiblePhone: '',
    responsibleEmail: '',
    billingFullName: '',
    billingShortName: '',
    billingLegalAddress: '',
    billingMailingAddress: '',
    billingUNP: '',
    date: new Date().toLocaleDateString('ru-RU'),
    signature: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ELTDeregistrationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleELTCodeChange = (index: number, value: string) => {
    const newCode = [...formData.eltCode];
    const char = value.toUpperCase().slice(-1); // Берем последний символ (если вставлено несколько)
    
    // Проверяем, что это допустимый символ (0-9, A-F)
    if (char && /[0-9A-F]/.test(char)) {
      newCode[index] = char;
      setFormData(prev => ({
        ...prev,
        eltCode: newCode
      }));

      // Автоматический переход к следующему полю
      if (char && index < 14 && eltCodeRefs.current[index + 1]) {
        setTimeout(() => {
          eltCodeRefs.current[index + 1]?.focus();
          eltCodeRefs.current[index + 1]?.select();
        }, 0);
      }
    } else if (value === '') {
      // Разрешаем удаление
      newCode[index] = '';
      setFormData(prev => ({
        ...prev,
        eltCode: newCode
      }));
    }
  };

  const handleELTCodeKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    // Обработка Backspace - переход к предыдущему полю
    if (event.key === 'Backspace' && !formData.eltCode[index] && index > 0) {
      event.preventDefault();
      eltCodeRefs.current[index - 1]?.focus();
      eltCodeRefs.current[index - 1]?.select();
    }
    // Обработка стрелок
    else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      eltCodeRefs.current[index - 1]?.focus();
      eltCodeRefs.current[index - 1]?.select();
    }
    else if (event.key === 'ArrowRight' && index < 14) {
      event.preventDefault();
      eltCodeRefs.current[index + 1]?.focus();
      eltCodeRefs.current[index + 1]?.select();
    }
    // Обработка Delete - удаление и переход к следующему
    else if (event.key === 'Delete' && !formData.eltCode[index] && index < 14) {
      event.preventDefault();
      eltCodeRefs.current[index + 1]?.focus();
      eltCodeRefs.current[index + 1]?.select();
    }
  };

  const handleAircraftRegistrationChange = (value: string) => {
    // Форматируем регистрационный знак: XXX-XXXXX
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 8);
    }
    handleInputChange('aircraftRegistration', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (formData.eltCode.some(char => !char)) {
      toast.error('Заполните 15-значный код ELT');
      return;
    }

    if (!formData.eltModel || !formData.eltSerialNumber) {
      toast.error('Заполните информацию по ELT');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/elt-deregistration/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке формы');
      }

      toast.success('Заявление успешно отправлено');
      
      // Очистка формы
      setFormData({
        eltCode: Array(15).fill(''),
        eltModel: '',
        eltSerialNumber: '',
        aircraftType: '',
        aircraftModel: '',
        aircraftRegistration: '',
        operator: '',
        operatorAddress: '',
        operatorWorkPhone: '',
        operatorMobilePhone: '',
        operatorEmail: '',
        responsiblePerson: '',
        responsiblePhone: '',
        responsibleEmail: '',
        billingFullName: '',
        billingShortName: '',
        billingLegalAddress: '',
        billingMailingAddress: '',
        billingUNP: '',
        date: new Date().toLocaleDateString('ru-RU'),
        signature: ''
      });
    } catch (error: any) {
      console.error('Ошибка при отправке:', error);
      toast.error(error.message || t('error_sending_form'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-white rounded-lg shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-center" style={{ color: '#213659' }}>
            {t('elt_deregistration_application')}
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Информация по ELT */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('elt_information')}</h3>
              
              <div>
                <Label>{t('elt_15_digit_code')}</Label>
                <div className="flex gap-1 mt-2">
                  {formData.eltCode.map((char, index) => (
                    <Input
                      key={index}
                      ref={(el) => { eltCodeRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={char}
                      onChange={(e) => handleELTCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleELTCodeKeyDown(index, e)}
                      className="w-10 text-center uppercase"
                      pattern="[0-9A-F]"
                      required
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="eltModel">{t('model')}</Label>
                <Input
                  id="eltModel"
                  value={formData.eltModel}
                  onChange={(e) => handleInputChange('eltModel', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="eltSerialNumber">{t('serial_number')}</Label>
                <Input
                  id="eltSerialNumber"
                  value={formData.eltSerialNumber}
                  onChange={(e) => handleInputChange('eltSerialNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Информация о воздушном судне */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('aircraft_information')}</h3>
              
              <div>
                <Label htmlFor="aircraftType">{t('aircraft_type')}</Label>
                <Input
                  id="aircraftType"
                  value={formData.aircraftType}
                  onChange={(e) => handleInputChange('aircraftType', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="aircraftModel">{t('aircraft_model')}</Label>
                <Input
                  id="aircraftModel"
                  value={formData.aircraftModel}
                  onChange={(e) => handleInputChange('aircraftModel', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="aircraftRegistration">{t('aircraft_registration')}</Label>
                <Input
                  id="aircraftRegistration"
                  value={formData.aircraftRegistration}
                  onChange={(e) => handleAircraftRegistrationChange(e.target.value)}
                  placeholder="XXX-XXXXX"
                  required
                />
              </div>
            </div>

            {/* Информация об эксплуатанте */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('operator_information')}</h3>
              
              <div>
                <Label htmlFor="operator">{t('aircraft_operator')}</Label>
                <Input
                  id="operator"
                  value={formData.operator}
                  onChange={(e) => handleInputChange('operator', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="operatorAddress">{t('mailing_address')}</Label>
                <Input
                  id="operatorAddress"
                  value={formData.operatorAddress}
                  onChange={(e) => handleInputChange('operatorAddress', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="operatorWorkPhone">{t('work_phone')}</Label>
                <Input
                  id="operatorWorkPhone"
                  value={formData.operatorWorkPhone}
                  onChange={(e) => handleInputChange('operatorWorkPhone', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="operatorMobilePhone">{t('mobile_phone')}</Label>
                <Input
                  id="operatorMobilePhone"
                  value={formData.operatorMobilePhone}
                  onChange={(e) => handleInputChange('operatorMobilePhone', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="operatorEmail">E-mail</Label>
                <Input
                  id="operatorEmail"
                  type="email"
                  value={formData.operatorEmail}
                  onChange={(e) => handleInputChange('operatorEmail', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Данные ответственного за снятие с регистрации */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('responsible_person_deregistration_data')}</h3>
              
              <div>
                <Label htmlFor="responsiblePerson">{t('responsible_person')}</Label>
                <Input
                  id="responsiblePerson"
                  value={formData.responsiblePerson}
                  onChange={(e) => handleInputChange('responsiblePerson', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsiblePhone">{t('phone')}</Label>
                <Input
                  id="responsiblePhone"
                  value={formData.responsiblePhone}
                  onChange={(e) => handleInputChange('responsiblePhone', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsibleEmail">E-mail</Label>
                <Input
                  id="responsibleEmail"
                  type="email"
                  value={formData.responsibleEmail}
                  onChange={(e) => handleInputChange('responsibleEmail', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Реквизиты для выставления счёта */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('billing_details')}</h3>
              
              <div>
                <Label htmlFor="billingFullName">{t('full_organization_name')}</Label>
                <Input
                  id="billingFullName"
                  value={formData.billingFullName}
                  onChange={(e) => handleInputChange('billingFullName', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="billingShortName">{t('short_organization_name')}</Label>
                <Input
                  id="billingShortName"
                  value={formData.billingShortName}
                  onChange={(e) => handleInputChange('billingShortName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="billingLegalAddress">{t('legal_address')}</Label>
                <Input
                  id="billingLegalAddress"
                  value={formData.billingLegalAddress}
                  onChange={(e) => handleInputChange('billingLegalAddress', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="billingMailingAddress">{t('mailing_address')}</Label>
                <Input
                  id="billingMailingAddress"
                  value={formData.billingMailingAddress}
                  onChange={(e) => handleInputChange('billingMailingAddress', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="billingUNP">{t('unp')}:</Label>
                <Input
                  id="billingUNP"
                  value={formData.billingUNP}
                  onChange={(e) => handleInputChange('billingUNP', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Дата и подпись */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">{t('date')}</Label>
                <Input
                  id="date"
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  placeholder="дд.мм.гггг"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signature">{t('signature')}</Label>
                <Input
                  id="signature"
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-white px-8 py-2 hover:opacity-90"
                style={{ 
                  backgroundColor: '#213659'
                }}
              >
                {isSubmitting ? t('sending') : t('submit_application')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

