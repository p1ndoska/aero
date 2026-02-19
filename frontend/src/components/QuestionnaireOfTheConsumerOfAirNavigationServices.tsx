import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import Captcha, { validateCaptcha } from "./Captcha";
import { BASE_URL } from "@/constants";

interface FormData {
  // Вопросы

  userAddress: string;
  userName: string;
  phoneNumber: string;
  email: string;
  qualityOfRadioExchangePhraseologyByAviationPersonnel: string;
  timelinessOfAirSituationReporting: string;
  qualityOfOperationOfRadioEquipment: string;
  qualityOfAirTrafficServicesProcedures: string;
  reasonsForTheRatingDecrease: string;
  comments: string;
  dateOfCompletion: string;
  antispamCode: string;
}

const ratingOptions = [
  { value: "excellent", label: "5" },
  { value: "good", label: "4" },
  { value: "satisfactory", label: "3" },
  { value: "poor", label: "2" },
  { value: "very-poor", label: "1" },
];

const QuestionnaireOfTheConsumerOfAirNavigationServices: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    userAddress: "",
    userName: "",
    phoneNumber: "",
    email: "",
    qualityOfRadioExchangePhraseologyByAviationPersonnel: "",
    timelinessOfAirSituationReporting: "",
    qualityOfOperationOfRadioEquipment: "",
    qualityOfAirTrafficServicesProcedures: "",
    reasonsForTheRatingDecrease: "",
    comments: "",
    dateOfCompletion: "",
    antispamCode: "",
  });

  const { t, language } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка обязательных полей
    const requiredFields: (keyof FormData)[] = [
      "userAddress",
      "userName",
      "phoneNumber",
      "email",
      "qualityOfRadioExchangePhraseologyByAviationPersonnel",
      "timelinessOfAirSituationReporting",
      "qualityOfOperationOfRadioEquipment",
      "qualityOfAirTrafficServicesProcedures",
      "dateOfCompletion",
      "antispamCode",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error("Заполните все обязательные поля");
      setErrors({ general: "Заполните все обязательные поля" });
      return;
    }

    // Проверка капчи
    if (!validateCaptcha(formData.antispamCode)) {
      toast.error("Неверный код безопасности");
      setErrors({ antispamCode: "Неверный код безопасности" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Приводим данные к формату, который ожидает существующий backend `/api/questionnaire/send-questionnaire`
      const payload = {
        userAddress: formData.userAddress,
        userName: formData.userName,
        phone: formData.phoneNumber,
        email: formData.email,
        phraseologyQuality:
          formData.qualityOfRadioExchangePhraseologyByAviationPersonnel,
        informationTimeliness: formData.timelinessOfAirSituationReporting,
        equipmentQuality: formData.qualityOfOperationOfRadioEquipment,
        proceduresQuality: formData.qualityOfAirTrafficServicesProcedures,
        satisfactionReasons: formData.reasonsForTheRatingDecrease,
        suggestions: formData.comments,
        completionDate: formData.dateOfCompletion,
        antispamCode: formData.antispamCode,
      };

      const response = await fetch(
        `${BASE_URL}/api/questionnaire/send-questionnaire`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при отправке анкеты");
      }

      toast.success("Анкета успешно отправлена! Спасибо за сотрудничество!");

      // Сброс формы
      setFormData({
        userAddress: "",
        userName: "",
        phoneNumber: "",
        email: "",
        qualityOfRadioExchangePhraseologyByAviationPersonnel: "",
        timelinessOfAirSituationReporting: "",
        qualityOfOperationOfRadioEquipment: "",
        qualityOfAirTrafficServicesProcedures: "",
        reasonsForTheRatingDecrease: "",
        comments: "",
        dateOfCompletion: "",
        antispamCode: "",
      });
      setErrors({});
    } catch (error: any) {
      console.error("Error submitting questionnaire:", error);
      toast.error(error.message || "Ошибка при отправке анкеты");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Устанавливаем текущую дату по умолчанию
  React.useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      dateOfCompletion: prev.dateOfCompletion || today,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center bg-white">
            <CardTitle className="text-3xl font-bold text-[#213659] mb-4">
              Анкета потребителя аэронавигационных услуг Республики Беларусь
            </CardTitle>
            <div className="text-center">
              <p className="text-xl font-semibold text-red-600 mb-4">
                Уважаемые Коллеги!
              </p>
              <p className="text-gray-700 leading-relaxed">
                Благодарим Вас за сотрудничество с Государственным предприятием
                БЕЛАЭРОНАВИГАЦИЯ. Мы стремимся к тому, чтобы оно было еще более
                эффективным и комфортным. Ваше мнение о качестве наших
                аэронавигационных услуг имеет для нас первостепенное значение.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Для того, чтобы мы могли учесть Ваше мнение, просим ответить на
                вопросы анкеты, приведенной ниже.
              </p>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Вопрос 1 */}
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xl font-semibold text-blue-900 mb-4">
                    1. ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ
                  </p>
                </div>
                <div className="space-y-4 border-l-4 border-blue-200 pl-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userAddress" className="text-base font-medium">
                        Адресс пользователя <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="userAddress"
                        value={formData.userAddress}
                        onChange={(e) =>
                          handleInputChange("userAddress", e.target.value)
                        }
                        placeholder="Введите адресс пользователя"
                        className={errors.userAddress ? "border-red-500" : ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-base font-medium">
                        Наименование пользователя{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="userName"
                        value={formData.userName}
                        onChange={(e) =>
                          handleInputChange("userName", e.target.value)
                        }
                        placeholder="Введите наименование пользователя"
                        className={errors.userName ? "border-red-500" : ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-base font-medium">
                        Телефон <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="tel"
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        placeholder="Введите номер телефона"
                        className={errors.phoneNumber ? "border-red-500" : ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Введите email"
                        className={errors.email ? "border-red-500" : ""}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Вопрос 2 */}
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xl font-semibold text-blue-900 mb-4">
                    2. УДОВЛЕТВОРЕННОСТЬ ОКАЗЫВАЕМОЙ АЭРОНАВИГАЦИОННОЙ УСЛУГОЙ
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Оцените по 5-бальной шкале степень Вашей удовлетворенности
                  оказываемой аэронавигационной услугой: 5 баллов - высокая степень
                  удовлетворенности; 4 балла - хорошая степень удовлетворенности; 3
                  балла - средняя степень удовлетворенности; 2 балла - низкая
                  степень удовлетворенности; 1 балл - полная неудовлетворенность
                </p>

                <div className="space-y-4 border-l-4 border-blue-200 pl-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Качество ведения фразеологии радиообмена авиационным
                        персоналом: <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={
                          formData.qualityOfRadioExchangePhraseologyByAviationPersonnel
                        }
                        onValueChange={(value) =>
                          handleInputChange(
                            "qualityOfRadioExchangePhraseologyByAviationPersonnel",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.qualityOfRadioExchangePhraseologyByAviationPersonnel
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Выберите оценку" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ratingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Своевременность информирования о воздушной обстановке:{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.timelinessOfAirSituationReporting}
                        onValueChange={(value) =>
                          handleInputChange(
                            "timelinessOfAirSituationReporting",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.timelinessOfAirSituationReporting
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Выберите оценку" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ratingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Качество работы радиотехнических средств:{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.qualityOfOperationOfRadioEquipment}
                        onValueChange={(value) =>
                          handleInputChange(
                            "qualityOfOperationOfRadioEquipment",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.qualityOfOperationOfRadioEquipment
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Выберите оценку" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ratingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        Качество процедур обслуживания воздушного движения{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.qualityOfAirTrafficServicesProcedures}
                        onValueChange={(value) =>
                          handleInputChange(
                            "qualityOfAirTrafficServicesProcedures",
                            value,
                          )
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.qualityOfAirTrafficServicesProcedures
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Выберите оценку" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {ratingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Вопрос 3 */}
              <div className="space-y-6">
                <div className="space-y-4 border-l-4 border-blue-200 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="reasonsForTheRatingDecrease" className="text-base font-medium">
                      Поясните причины снижения оценки удовлетворенности
                    </Label>
                    <Input
                      type="text"
                      id="reasonsForTheRatingDecrease"
                      value={formData.reasonsForTheRatingDecrease}
                      onChange={(e) =>
                        handleInputChange(
                          "reasonsForTheRatingDecrease",
                          e.target.value,
                        )
                      }
                      placeholder="Поясните причины снижения оценки удовлетворенности"
                      className={
                        errors.reasonsForTheRatingDecrease ? "border-red-500" : ""
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Вопрос 4 */}
              <div className="space-y-6">
                <div className="space-y-4 border-l-4 border-blue-200 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="comments" className="text-base font-medium">
                      Ваши замечания, пожелания и предложения по улучшению
                      качества аэронавигационных услуг нашим предприятием:
                    </Label>
                    <Textarea
                      id="comments"
                      value={formData.comments}
                      onChange={(e) =>
                        handleInputChange("comments", e.target.value)
                      }
                      placeholder="Введите ваши комментарии..."
                      rows={4}
                      className="resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Дата заполнения и Капча */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfCompletion" className="text-base font-medium">
                    Дата заполнения <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfCompletion"
                    type="date"
                    value={formData.dateOfCompletion}
                    onChange={(e) =>
                      handleInputChange("dateOfCompletion", e.target.value)
                    }
                    className={errors.dateOfCompletion ? "border-red-500" : ""}
                    required
                  />
                </div>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Код безопасности <span className="text-red-500">*</span>
                  </Label>
                  <Captcha
                    value={formData.antispamCode}
                    onChange={(value) => handleInputChange("antispamCode", value)}
                    error={errors.antispamCode}
                    required
                  />
                </div>
              </div>

              {/* Кнопка отправки */}
              <div className="flex flex-col items-center space-y-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-2 bg-[#213659] hover:bg-[#213659] text-white text-lg font-medium"
                >
                  {isSubmitting ? "Отправка..." : "ОТПРАВИТЬ"}
                </Button>
                <p className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> - поля, обязательные
                  для заполнения
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionnaireOfTheConsumerOfAirNavigationServices;
