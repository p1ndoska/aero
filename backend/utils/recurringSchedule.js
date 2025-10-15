/**
 * Утилита для работы с повторяющимися расписаниями
 * Создает слоты для повторяющихся дат (например, каждый второй понедельник месяца)
 */

class RecurringSchedule {
    /**
     * Определяет номер недели в месяце для указанной даты
     * @param {Date} date - Дата для анализа
     * @returns {number} Номер недели (1 = первая, 2 = вторая, ...)
     */
    static getWeekNumberInMonth(date) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const firstWeekday = firstDay.getDay();
        const dayOfMonth = date.getDate();
        
        // Вычисляем номер недели
        const weekNumber = Math.ceil((dayOfMonth + firstWeekday) / 7);
        return weekNumber;
    }

    /**
     * Находит все даты, соответствующие шаблону (например, каждый второй понедельник)
     * @param {number} weekday - День недели (0 = воскресенье, 1 = понедельник, ...)
     * @param {number} weekNumber - Номер недели в месяце (1 = первая, 2 = вторая, ...)
     * @param {number} monthsAhead - На сколько месяцев вперед искать
     * @param {Date} startFrom - Начальная дата для поиска (по умолчанию - текущая дата)
     * @returns {Date[]} Массив найденных дат
     */
    static findRecurringDates(weekday, weekNumber, monthsAhead = 3, startFrom = new Date()) {
        const dates = [];
        const currentDate = new Date(startFrom);
        
        // Начинаем с первого числа текущего месяца
        currentDate.setDate(1);
        
        for (let month = 0; month < monthsAhead; month++) {
            const targetMonth = new Date(currentDate);
            targetMonth.setMonth(currentDate.getMonth() + month);
            
            // Находим первое число месяца
            const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
            
            // Находим первый день нужного дня недели в месяце
            const firstWeekday = firstDay.getDay();
            const daysToFirstWeekday = (weekday - firstWeekday + 7) % 7;
            const firstTargetWeekday = new Date(firstDay);
            firstTargetWeekday.setDate(firstDay.getDate() + daysToFirstWeekday);
            
            // Находим нужную неделю
            const targetDate = new Date(firstTargetWeekday);
            targetDate.setDate(firstTargetWeekday.getDate() + (weekNumber - 1) * 7);
            
            // Проверяем, что дата все еще в том же месяце
            if (targetDate.getMonth() === targetMonth.getMonth()) {
                dates.push(new Date(targetDate));
            }
        }
        
        return dates;
    }

    /**
     * Создает слоты для повторяющихся дат
     * @param {Object} template - Шаблон расписания
     * @param {Date[]} dates - Массив дат для создания слотов
     * @returns {Array} Массив объектов слотов для базы данных
     */
    static createSlotsFromTemplate(template, dates) {
        const slots = [];
        
        for (const date of dates) {
            const startDateTime = new Date(`${date.toISOString().split('T')[0]}T${template.startTime}`);
            const endDateTime = new Date(`${date.toISOString().split('T')[0]}T${template.endTime}`);
            
            // Создаем слоты по указанной длительности
            const currentTime = new Date(startDateTime);
            while (currentTime < endDateTime) {
                const slotEndTime = new Date(currentTime.getTime() + template.slotDuration * 60000);
                
                if (slotEndTime <= endDateTime) {
                    slots.push({
                        managementId: template.managementId,
                        date: new Date(date),
                        startTime: new Date(currentTime),
                        endTime: new Date(slotEndTime),
                        isAvailable: true,
                        isBooked: false,
                        isRecurring: true,
                        recurringTemplateId: template.id
                    });
                }
                
                currentTime.setMinutes(currentTime.getMinutes() + template.slotDuration);
            }
        }
        
        return slots;
    }

    /**
     * Создает шаблон повторяющегося расписания на основе выбранной даты
     * @param {Date} selectedDate - Выбранная дата
     * @param {Object} scheduleData - Данные расписания
     * @param {number} managementId - ID руководителя
     * @returns {Object} Шаблон расписания
     */
    static createTemplateFromDate(selectedDate, scheduleData, managementId) {
        const weekday = selectedDate.getDay();
        const weekNumber = this.getWeekNumberInMonth(selectedDate);
        
        return {
            id: `template_${managementId}_${weekday}_${weekNumber}_${Date.now()}`,
            managementId,
            weekday,
            weekNumber,
            startTime: scheduleData.startTime,
            endTime: scheduleData.endTime,
            slotDuration: scheduleData.slotDuration || 10,
            monthsAhead: scheduleData.monthsAhead || 3,
            isActive: true
        };
    }

    /**
     * Обновляет существующие слоты для шаблона
     * @param {Object} template - Шаблон расписания
     * @param {Date} startFrom - Начальная дата для обновления
     * @returns {Object} Данные для обновления базы данных
     */
    static updateSlotsForTemplate(template, startFrom = new Date()) {
        const dates = this.findRecurringDates(
            template.weekday, 
            template.weekNumber, 
            template.monthsAhead, 
            startFrom
        );
        
        const newSlots = this.createSlotsFromTemplate(template, dates);
        
        return {
            template,
            dates,
            slots: newSlots
        };
    }

    /**
     * Получает описание шаблона на русском языке
     * @param {Object} template - Шаблон расписания
     * @returns {string} Описание шаблона
     */
    static getTemplateDescription(template) {
        const weekdays = [
            'воскресенье', 'понедельник', 'вторник', 'среда', 
            'четверг', 'пятница', 'суббота'
        ];
        
        const weekNames = ['первую', 'вторую', 'третью', 'четвертую', 'пятую'];
        
        const weekday = weekdays[template.weekday];
        const weekName = weekNames[template.weekNumber - 1] || `${template.weekNumber}-ю`;
        
        return `Каждый ${weekName} ${weekday} месяца с ${template.startTime} до ${template.endTime}`;
    }

    /**
     * Проверяет, соответствует ли дата шаблону
     * @param {Date} date - Дата для проверки
     * @param {Object} template - Шаблон расписания
     * @returns {boolean} Соответствует ли дата шаблону
     */
    static isDateMatchingTemplate(date, template) {
        return date.getDay() === template.weekday && 
               this.getWeekNumberInMonth(date) === template.weekNumber;
    }
}

module.exports = RecurringSchedule;

