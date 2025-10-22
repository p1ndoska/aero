/**
 * Парсер расписания для преобразования текстового описания в структурированные данные
 * Поддерживает различные форматы расписания для онлайн записи на прием
 */

class ScheduleParser {
    /**
     * Парсит текстовое расписание в структурированные данные
     * @param {string} scheduleText - Текстовое описание расписания
     * @returns {Object} Структурированные данные расписания
     */
    static parseSchedule(scheduleText) {
        const text = scheduleText.toLowerCase().trim();
        
        // Паттерны для различных типов расписания
        const patterns = {
            // Каждую первую пятницу месяца в 14.00
            firstWeekdayOfMonth: /каждую первую (понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье) месяца в (\d{1,2}):(\d{2})/i,
            
            // Каждый понедельник с 9.00 до 12.00
            weeklyWithTimeRange: /каждый (понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье) с (\d{1,2}):(\d{2}) до (\d{1,2}):(\d{2})/i,
            
            // Каждый понедельник в 14.00
            weeklyExactTime: /каждый (понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье) в (\d{1,2}):(\d{2})/i,
            
            // Ежедневно с 10.00 до 11.00
            dailyWithTimeRange: /ежедневно с (\d{1,2}):(\d{2}) до (\d{1,2}):(\d{2})/i,
            
            // Ежедневно в 14.00
            dailyExactTime: /ежедневно в (\d{1,2}):(\d{2})/i,
            
            // По предварительной записи
            byAppointment: /по предварительной записи/i,
            
            // Каждый второй вторник месяца в 15.30
            nthWeekdayOfMonth: /каждый второй (понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье) месяца в (\d{1,2}):(\d{2})/i,
        };

        // Маппинг дней недели на числа (0 = воскресенье, 1 = понедельник, ...)
        const weekdayMap = {
            'воскресенье': 0, 'воскресенью': 0,
            'понедельник': 1, 'понедельнику': 1,
            'вторник': 2, 'вторнику': 2,
            'среда': 3, 'среду': 3,
            'четверг': 4, 'четвергу': 4,
            'пятница': 5, 'пятницу': 5,
            'суббота': 6, 'субботу': 6,
        };

        // Проверяем паттерны по порядку
        for (const [patternName, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                return this.parsePattern(patternName, match, weekdayMap);
            }
        }

        // Если не удалось распарсить, возвращаем базовую структуру
        return {
            type: 'custom',
            description: scheduleText,
            isBookable: false,
            slots: []
        };
    }

    /**
     * Обрабатывает найденный паттерн
     */
    static parsePattern(patternName, match, weekdayMap) {
        switch (patternName) {
            case 'firstWeekdayOfMonth':
                return {
                    type: 'firstWeekdayOfMonth',
                    weekday: weekdayMap[match[1]],
                    time: `${match[2].padStart(2, '0')}:${match[3]}`,
                    duration: 60, // 1 час по умолчанию
                    description: `Каждую первую ${match[1]} месяца в ${match[2]}:${match[3]}`,
                    isBookable: true
                };

            case 'weeklyWithTimeRange':
                return {
                    type: 'weeklyWithTimeRange',
                    weekday: weekdayMap[match[1]],
                    startTime: `${match[2].padStart(2, '0')}:${match[3]}`,
                    endTime: `${match[4].padStart(2, '0')}:${match[5]}`,
                    duration: this.calculateDuration(match[2], match[3], match[4], match[5]),
                    description: `Каждый ${match[1]} с ${match[2]}:${match[3]} до ${match[4]}:${match[5]}`,
                    isBookable: true
                };

            case 'weeklyExactTime':
                return {
                    type: 'weeklyExactTime',
                    weekday: weekdayMap[match[1]],
                    time: `${match[2].padStart(2, '0')}:${match[3]}`,
                    duration: 60, // 1 час по умолчанию
                    description: `Каждый ${match[1]} в ${match[2]}:${match[3]}`,
                    isBookable: true
                };

            case 'dailyWithTimeRange':
                return {
                    type: 'dailyWithTimeRange',
                    startTime: `${match[1].padStart(2, '0')}:${match[2]}`,
                    endTime: `${match[3].padStart(2, '0')}:${match[4]}`,
                    duration: this.calculateDuration(match[1], match[2], match[3], match[4]),
                    description: `Ежедневно с ${match[1]}:${match[2]} до ${match[3]}:${match[4]}`,
                    isBookable: true
                };

            case 'dailyExactTime':
                return {
                    type: 'dailyExactTime',
                    time: `${match[1].padStart(2, '0')}:${match[2]}`,
                    duration: 60, // 1 час по умолчанию
                    description: `Ежедневно в ${match[1]}:${match[2]}`,
                    isBookable: true
                };

            case 'byAppointment':
                return {
                    type: 'byAppointment',
                    description: 'По предварительной записи',
                    isBookable: true,
                    requiresContact: true
                };

            case 'nthWeekdayOfMonth':
                return {
                    type: 'nthWeekdayOfMonth',
                    weekday: weekdayMap[match[1]],
                    weekNumber: 2, // второй
                    time: `${match[2].padStart(2, '0')}:${match[3]}`,
                    duration: 60, // 1 час по умолчанию
                    description: `Каждый второй ${match[1]} месяца в ${match[2]}:${match[3]}`,
                    isBookable: true
                };

            default:
                return {
                    type: 'unknown',
                    description: match[0],
                    isBookable: false
                };
        }
    }

    /**
     * Вычисляет длительность приема в минутах
     */
    static calculateDuration(startHour, startMin, endHour, endMin) {
        const startMinutes = parseInt(startHour) * 60 + parseInt(startMin);
        const endMinutes = parseInt(endHour) * 60 + parseInt(endMin);
        return Math.max(endMinutes - startMinutes, 30); // минимум 30 минут
    }

    /**
     * Генерирует доступные слоты для записи на основе расписания
     * @param {Object} scheduleData - Структурированные данные расписания
     * @param {Date} startDate - Начальная дата для генерации слотов
     * @param {Date} endDate - Конечная дата для генерации слотов
     * @returns {Array} Массив доступных слотов
     */
    static generateTimeSlots(scheduleData, startDate = new Date(), endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
        const slots = [];
        
        if (!scheduleData.isBookable) {
            return slots;
        }

        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            switch (scheduleData.type) {
                case 'firstWeekdayOfMonth':
                    if (this.isFirstWeekdayOfMonth(currentDate, scheduleData.weekday)) {
                        slots.push(this.createTimeSlot(currentDate, scheduleData.time, scheduleData.duration));
                    }
                    break;
                    
                case 'weeklyWithTimeRange':
                    if (currentDate.getDay() === scheduleData.weekday) {
                        slots.push(...this.createTimeRangeSlots(currentDate, scheduleData.startTime, scheduleData.endTime, scheduleData.duration));
                    }
                    break;
                    
                case 'weeklyExactTime':
                    if (currentDate.getDay() === scheduleData.weekday) {
                        slots.push(this.createTimeSlot(currentDate, scheduleData.time, scheduleData.duration));
                    }
                    break;
                    
                case 'dailyWithTimeRange':
                    slots.push(...this.createTimeRangeSlots(currentDate, scheduleData.startTime, scheduleData.endTime, scheduleData.duration));
                    break;
                    
                case 'dailyExactTime':
                    slots.push(this.createTimeSlot(currentDate, scheduleData.time, scheduleData.duration));
                    break;
                    
                case 'byAppointment':
                    // Для записи по предварительной договоренности генерируем слоты на рабочие дни
                    if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
                        slots.push(this.createTimeSlot(currentDate, '09:00', 60));
                        slots.push(this.createTimeSlot(currentDate, '10:00', 60));
                        slots.push(this.createTimeSlot(currentDate, '11:00', 60));
                        slots.push(this.createTimeSlot(currentDate, '14:00', 60));
                        slots.push(this.createTimeSlot(currentDate, '15:00', 60));
                    }
                    break;
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return slots;
    }

    /**
     * Проверяет, является ли дата первым указанным днем недели месяца
     */
    static isFirstWeekdayOfMonth(date, weekday) {
        if (date.getDay() !== weekday) return false;
        
        // Проверяем, что это первая неделя месяца
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const daysSinceFirstDay = date.getDate() - 1;
        const firstWeekdayOfMonth = (weekday - firstDayOfMonth.getDay() + 7) % 7;
        
        return daysSinceFirstDay === firstWeekdayOfMonth;
    }

    /**
     * Создает временной слот
     */
    static createTimeSlot(date, time, duration) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(hours, minutes, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);
        
        return {
            id: `${slotStart.toISOString()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: slotStart,
            endTime: slotEnd,
            duration: duration,
            isAvailable: true
        };
    }

    /**
     * Создает слоты в диапазоне времени
     */
    static createTimeRangeSlots(date, startTime, endTime, slotDuration = 30) {
        const slots = [];
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        for (let minutes = startMinutes; minutes + slotDuration <= endMinutes; minutes += slotDuration) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            
            slots.push(this.createTimeSlot(date, timeString, slotDuration));
        }
        
        return slots;
    }
}

module.exports = ScheduleParser;



