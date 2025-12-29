import type { DeliveryAddress } from "../types/order";

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  export const formatAddress = (address: DeliveryAddress) => {
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''} - ${address.neighborhood}, ${address.city}${address.state ? ` - ${address.state}` : ''} - ${address.zipCode}`;
  };

  /**
   * Retorna a data/hora atual no formato ISO, mas usando o fuso horário local
   * ao invés de UTC. Isso garante que a hora salva seja exatamente a hora local.
   */
  export const getLocalISOString = (): string => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000; // offset em milissegundos
    const localTime = new Date(now.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, -1); // Remove o 'Z' final
  };

  /**
   * Formata uma string de data/hora ISO para exibição em português brasileiro
   * @param isoString - String no formato ISO (com ou sem 'Z')
   * @param options - Opções de formatação (incluir hora, etc)
   */
  export const formatDateTime = (
    isoString: string, 
    options: { includeTime?: boolean; includeDate?: boolean } = { includeTime: true, includeDate: true }
  ): string => {
    try {
      let date: Date;
      
      if (isoString.endsWith('Z')) {
        // Se tem 'Z', é UTC - converter para hora local
        date = new Date(isoString);
      } else {
        // Se não tem 'Z', é hora local já salva
        // Precisamos criar a data garantindo que seja interpretada como local
        // Fazemos isso extraindo os componentes e criando uma nova Date
        const isoMatch = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?/);
        if (isoMatch) {
          const [, year, month, day, hour, minute, second, ms] = isoMatch;
          date = new Date(
            parseInt(year),
            parseInt(month) - 1, // Mês é 0-indexed
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second),
            ms ? parseInt(ms.padEnd(3, '0')) : 0
          );
        } else {
          // Fallback: tentar criar normalmente
          date = new Date(isoString);
        }
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', isoString);
        return isoString;
      }
      
      const formatOptions: Intl.DateTimeFormatOptions = {};
      
      if (options.includeDate) {
        formatOptions.day = '2-digit';
        formatOptions.month = '2-digit';
        formatOptions.year = 'numeric';
      }
      
      if (options.includeTime) {
        formatOptions.hour = '2-digit';
        formatOptions.minute = '2-digit';
      }
      
      return date.toLocaleDateString('pt-BR', formatOptions);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return isoString;
    }
  };
  export const verifyStoreID = (storeId: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId);
    if (!isUUID) {
      return false;
    }
    return storeId;
  };

  /**
   * Formata CEP brasileiro (00000-000)
   * @param value - CEP sem formatação ou parcialmente formatado
   * @returns CEP formatado ou valor limpo se incompleto
   */
  export const formatZipCode = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  /**
   * Remove formatação do CEP, retornando apenas números
   * @param value - CEP formatado ou não
   * @returns CEP apenas com números
   */
  export const unformatZipCode = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  /**
   * Formata telefone brasileiro ((00) 00000-0000 ou (00) 0000-0000)
   * Suporta telefone fixo (10 dígitos) e celular (11 dígitos)
   * @param value - Telefone sem formatação ou parcialmente formatado
   * @returns Telefone formatado
   */
  export const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    
    if (cleaned.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      if (cleaned.length <= 6) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      }
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
    } else {
      // Celular: (00) 00000-0000
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  /**
   * Remove formatação do telefone, retornando apenas números
   * @param value - Telefone formatado ou não
   * @returns Telefone apenas com números
   */
  export const unformatPhone = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  /**
   * Converte horário de "HH:MM:SS" para "HH:MM" (formato usado em inputs HTML type="time")
   * @param time - Horário no formato "HH:MM:SS" ou null
   * @returns Horário no formato "HH:MM" ou "09:00" como padrão
   */
  export const formatTimeForInput = (time: string | null): string => {
    if (!time) return '09:00';
    return time.substring(0, 5); // Pega apenas HH:MM
  };

  /**
   * Converte horário de "HH:MM" para "HH:MM:SS" (formato esperado pela API)
   * @param time - Horário no formato "HH:MM"
   * @returns Horário no formato "HH:MM:SS"
   */
  export const formatTimeForApi = (time: string): string => {
    return time.length === 5 ? `${time}:00` : time;
  };

  