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
     * Находит все даты, соответствующие шаблону (например, каждый второй понедельник или каждый понедельник)
     * @param {number} weekday - День недели (0 = воскресенье, 1 = понедельник, ...)
     * @param {number|null} weekNumber - Номер недели в месяце (1 = первая, 2 = вторая, ...) или null для еженедельного повторения
     * @param {number} monthsAhead - На сколько месяцев вперед искать
     * @param {Date} startFrom - Начальная дата для поиска (по умолчанию - текущая дата)
     * @param {boolean} isWeekly - true = каждую неделю, false = конкретная неделя месяца
     * @returns {Date[]} Массив найденных дат
     */
    static findRecurringDates(weekday, weekNumber, monthsAhead = 3, startFrom = new Date(), isWeekly = false) {
        const dates = [];
        const currentDate = new Date(startFrom);
        
        if (isWeekly) {
            // Еженедельное повторение - каждый указанный день недели
            const endDate = new Date(currentDate);
            endDate.setMonth(currentDate.getMonth() + monthsAhead);
            
            // Начинаем с ближайшего указанного дня недели
            const daysUntilWeekday = (weekday - currentDate.getDay() + 7) % 7;
            const startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() + daysUntilWeekday);
            
            // Добавляем все даты с интервалом в неделю
            const date = new Date(startDate);
            while (date <= endDate) {
                dates.push(new Date(date));
                date.setDate(date.getDate() + 7);
            }
        } else {
            // Повторение по конкретной неделе месяца
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
     * @param {boolean} isWeekly - true = каждую неделю, false = конкретная неделя месяца
     * @returns {Object} Шаблон расписания
     */
    static createTemplateFromDate(selectedDate, scheduleData, managementId, isWeekly = false) {
        const weekday = selectedDate.getDay();
        const weekNumber = isWeekly ? null : this.getWeekNumberInMonth(selectedDate);
        
        return {
            id: `template_${managementId}_${weekday}_${isWeekly ? 'weekly' : weekNumber}_${Date.now()}`,
            managementId,
            weekday,
            weekNumber,
            isWeekly,
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
            startFrom,
            template.isWeekly
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
        
        if (template.isWeekly) {
            return `Каждый ${weekday} с ${template.startTime} до ${template.endTime}`;
        } else {
            const weekName = weekNames[template.weekNumber - 1] || `${template.weekNumber}-ю`;
            return `Каждый ${weekName} ${weekday} месяца с ${template.startTime} до ${template.endTime}`;
        }
    }

    /**
     * Проверяет, соответствует ли дата шаблону
     * @param {Date} date - Дата для проверки
     * @param {Object} template - Шаблон расписания
     * @returns {boolean} Соответствует ли дата шаблону
     */
    static isDateMatchingTemplate(date, template) {
        if (template.isWeekly) {
            return date.getDay() === template.weekday;
        } else {
            return date.getDay() === template.weekday && 
                   this.getWeekNumberInMonth(date) === template.weekNumber;
        }
    }
}

module.exports = RecurringSchedule;

