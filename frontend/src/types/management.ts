// Интерфейс для структурированных данных расписания
export interface ReceptionScheduleData {
  type: 'firstWeekdayOfMonth' | 'weeklyWithTimeRange' | 'weeklyExactTime' | 'dailyWithTimeRange' | 'dailyExactTime' | 'byAppointment' | 'nthWeekdayOfMonth' | 'custom' | 'unknown';
  weekday?: number; // 0 = воскресенье, 1 = понедельник, ...
  time?: string; // HH:MM
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  duration: number; // в минутах
  description: string;
  isBookable: boolean;
  requiresContact?: boolean;
  weekNumber?: number; // для nthWeekdayOfMonth
}

// Интерфейс для временного слота записи
export interface ReceptionSlot {
  id: number;
  managementId: number;
  date: string; // ISO string
  startTime: string; // ISO string
  endTime: string; // ISO string
  isAvailable: boolean;
  isBooked: boolean;
  bookedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Интерфейс для временного слота (legacy)
export interface TimeSlot {
  id: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number;
  isAvailable: boolean;
}

// Интерфейс для руководителя
export interface Management {
  id: number;
  name: string;
  nameEn?: string;
  nameBe?: string;
  position: string;
  positionEn?: string;
  positionBe?: string;
  receptionSchedule: string;
  receptionScheduleEn?: string;
  receptionScheduleBe?: string;
  receptionSlots?: ReceptionSlot[];
  phone: string;
  offices?: string;
  officesEn?: string;
  officesBe?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Запрос на создание руководителя
export interface CreateManagementRequest {
  name: string;
  nameEn?: string;
  nameBe?: string;
  position: string;
  positionEn?: string;
  positionBe?: string;
  receptionSchedule: string;
  receptionScheduleEn?: string;
  receptionScheduleBe?: string;
  phone: string;
  offices?: string;
  officesEn?: string;
  officesBe?: string;
  images?: string[];
}

// Запрос на обновление руководителя
export interface UpdateManagementRequest {
  name?: string;
  nameEn?: string;
  nameBe?: string;
  position?: string;
  positionEn?: string;
  positionBe?: string;
  receptionSchedule?: string;
  receptionScheduleEn?: string;
  receptionScheduleBe?: string;
  phone?: string;
  offices?: string;
  officesEn?: string;
  officesBe?: string;
  images?: string[];
}

// Ответ API для руководителей
export interface ManagementResponse {
  managers: Management[];
}

export interface SingleManagementResponse {
  manager: Management;
}

// Ответ API для доступных слотов
export interface AvailableSlotsResponse {
  manager: {
    id: number;
    name: string;
    position: string;
    receptionSchedule: string;
  };
  scheduleData: ReceptionScheduleData;
  availableSlots: TimeSlot[];
  dateRange: {
    start: string;
    end: string;
  };
}

// Запрос на создание слотов
export interface CreateSlotsRequest {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  slotDuration?: number; // в минутах, по умолчанию 10
}

// Запрос на бронирование слота
export interface BookSlotRequest {
  email: string;
  notes?: string;
}

// Ответ API для слотов
export interface ReceptionSlotsResponse {
  slots: ReceptionSlot[];
}

// Интерфейс для шаблона повторяющегося расписания
export interface RecurringScheduleTemplate {
  id: string;
  managementId: number;
  weekday: number; // 0 = воскресенье, 1 = понедельник, ...
  weekNumber: number; // 1 = первая неделя, 2 = вторая, ...
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  slotDuration: number; // в минутах
  monthsAhead: number; // на сколько месяцев вперед создавать слоты
  isActive: boolean;
  description?: string; // описание шаблона
  createdAt: string;
  updatedAt: string;
}

// Запрос на создание повторяющегося расписания
export interface CreateRecurringScheduleRequest {
  selectedDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  slotDuration?: number; // в минутах, по умолчанию 10
  monthsAhead?: number; // на сколько месяцев вперед, по умолчанию 3
}

// Ответ API для создания повторяющегося расписания
export interface CreateRecurringScheduleResponse {
  message: string;
  template: RecurringScheduleTemplate;
  slots: {
    count: number;
    dates: string[];
  };
}


