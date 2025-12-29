// Tipo para os dados de horário da API
export type ApiWorkingHoursItem = {
    week_day: number;
    opens_at: string | null;
    closes_at: string | null;
    is_closed: boolean;
  }