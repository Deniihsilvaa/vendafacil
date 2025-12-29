/**
 * Utilitários para formatação e conversão de horários de funcionamento
 * Converte entre o formato da API (array) e o formato usado no frontend (objeto)
 */

import type { ApiWorkingHoursItem } from '@/types/index';
import type { Store } from '@/types/store';
import { formatTimeForInput, formatTimeForApi } from './format';

/**
 * Converte array de horários da API para objeto usado no componente
 * @param apiHours - Array de horários no formato da API
 * @returns Objeto de horários no formato do frontend
 */
export const convertApiWorkingHoursToObject = (
  apiHours: ApiWorkingHoursItem[]
): Store['info']['workingHours'] => {
  const defaultHours: Store['info']['workingHours'] = {
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '18:00', closed: true },
    sunday: { open: '09:00', close: '18:00', closed: true },
  };

  // Mapear week_day para chave do objeto
  const weekDayToKey: Record<number, keyof Store['info']['workingHours']> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const result = { ...defaultHours };

  apiHours.forEach((item) => {
    const dayKey = weekDayToKey[item.week_day];
    if (dayKey) {
      result[dayKey] = {
        open: formatTimeForInput(item.opens_at),
        close: formatTimeForInput(item.closes_at),
        closed: item.is_closed,
      };
    }
  });

  return result;
};

/**
 * Converte objeto de horários do frontend para array no formato da API
 * @param workingHours - Objeto de horários no formato do frontend
 * @returns Array de horários no formato da API
 */
export const convertObjectToApiWorkingHours = (
  workingHours: Store['info']['workingHours']
): ApiWorkingHoursItem[] => {
  const keyToWeekDay: Record<keyof Store['info']['workingHours'], number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return (Object.keys(workingHours) as Array<keyof Store['info']['workingHours']>).map((key) => {
    const dayHours = workingHours[key];
    return {
      week_day: keyToWeekDay[key],
      opens_at: dayHours.closed ? null : formatTimeForApi(dayHours.open),
      closes_at: dayHours.closed ? null : formatTimeForApi(dayHours.close),
      is_closed: dayHours.closed ?? false,
    };
  });
};

