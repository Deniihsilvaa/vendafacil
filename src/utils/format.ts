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