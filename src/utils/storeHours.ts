import type { Store } from '@/types/store';

/**
 * Verifica se a loja está aberta no momento atual
 * @param store - Objeto da loja com horários de funcionamento
 * @returns Objeto com status (isOpen) e informações do horário atual
 */
export function isStoreOpen(store: Store): {
  isOpen: boolean;
  currentDay: string;
  currentDayHours: { open: string; close: string; closed?: boolean } | null;
  nextOpenDay?: string;
  nextOpenHours?: { open: string; close: string };
} {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = domingo, 1 = segunda, etc.
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  // Mapear dia da semana para chave do objeto workingHours
  const dayMap: Record<number, keyof Store['info']['workingHours']> = {
    0: 'sunday',    // domingo
    1: 'monday',    // segunda
    2: 'tuesday',   // terça
    3: 'wednesday', // quarta
    4: 'thursday',  // quinta
    5: 'friday',    // sexta
    6: 'saturday',  // sábado
  };

  const dayNames: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
  };

  const currentDayKey = dayMap[currentDay];
  const currentDayHours = store.info?.workingHours?.[currentDayKey];

  // Verificar se currentDayHours existe e se o dia está marcado como fechado
  if (!currentDayHours || currentDayHours.closed || !currentDayHours.open || !currentDayHours.close) {
    // Encontrar próximo dia aberto
    let nextDay = currentDay;
    let attempts = 0;
    let nextOpenDay: string | undefined;
    let nextOpenHours: { open: string; close: string } | undefined;

    while (attempts < 7) {
      nextDay = (nextDay + 1) % 7;
      const nextDayKey = dayMap[nextDay];
      const nextDayHours = store.info?.workingHours?.[nextDayKey];

      if (nextDayHours && !nextDayHours.closed && nextDayHours.open && nextDayHours.close) {
        nextOpenDay = dayNames[nextDay];
        nextOpenHours = {
          open: nextDayHours.open,
          close: nextDayHours.close,
        };
        break;
      }

      attempts++;
    }

    return {
      isOpen: false,
      currentDay: dayNames[currentDay],
      currentDayHours: null,
      nextOpenDay,
      nextOpenHours,
    };
  }

  // Comparar horários (formato "HH:MM")
  // Se chegou aqui, currentDayHours existe e tem open/close válidos
  if (!currentDayHours || !currentDayHours.open || !currentDayHours.close) {
    return {
      isOpen: false,
      currentDay: dayNames[currentDay],
      currentDayHours: null,
      nextOpenDay: undefined,
      nextOpenHours: undefined,
    };
  }

  const openTime = currentDayHours.open;
  const closeTime = currentDayHours.close;

  // Converter para minutos para comparação
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentMinutes = timeToMinutes(currentTime);
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  // Verificar se está dentro do horário de funcionamento
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return {
    isOpen,
    currentDay: dayNames[currentDay],
    currentDayHours: {
      open: openTime,
      close: closeTime,
      closed: false,
    },
  };
}

/**
 * Formata o horário de funcionamento para exibição
 */
export function formatWorkingHours(store: Store): string {
  const days = [
    { key: 'monday' as const, name: 'Seg' },
    { key: 'tuesday' as const, name: 'Ter' },
    { key: 'wednesday' as const, name: 'Qua' },
    { key: 'thursday' as const, name: 'Qui' },
    { key: 'friday' as const, name: 'Sex' },
    { key: 'saturday' as const, name: 'Sáb' },
    { key: 'sunday' as const, name: 'Dom' },
  ];

  const hours = days.map(day => {
    const dayHours = store.info?.workingHours?.[day.key];
    if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close) {
      return `${day.name}: Fechado`;
    }
    return `${day.name}: ${dayHours.open} - ${dayHours.close}`;
  });

  return hours.join('\n');
}

