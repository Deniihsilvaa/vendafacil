/**
 * Serviço para consulta de CEP via API ViaCEP
 * https://viacep.com.br/
 * 
 * IMPORTANTE: Uso massivo para validação de bases de dados locais, 
 * poderá automaticamente bloquear seu acesso por tempo indeterminado.
 */

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

export interface ViaCepError {
  erro: true;
}

/**
 * Consulta um CEP na API ViaCEP
 * @param cep - CEP no formato "00000000" ou "00000-000"
 * @returns Dados do endereço ou null se não encontrado
 */
export const consultarCep = async (cep: string): Promise<ViaCepResponse | null> => {
  try {
    // Remove formatação do CEP (mantém apenas números)
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida formato do CEP (deve ter 8 dígitos)
    if (cepLimpo.length !== 8) {
      return null;
    }

    // Faz a requisição para a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
      return null;
    }

    const data: ViaCepResponse | ViaCepError = await response.json();

    // Verifica se retornou erro
    if ('erro' in data && data.erro === true) {
      return null;
    }

    return data as ViaCepResponse;
  } catch (error) {
    console.error('Erro ao consultar CEP:', error);
    return null;
  }
};

/**
 * Valida se um CEP está no formato correto (8 dígitos)
 * @param cep - CEP a ser validado
 * @returns true se o formato é válido
 */
export const validarFormatoCep = (cep: string): boolean => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
};

/**
 * Verifica se um CEP está incompleto (menos de 8 dígitos)
 * @param cep - CEP a ser verificado
 * @returns true se está incompleto
 */
export const cepIncompleto = (cep: string): boolean => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length > 0 && cepLimpo.length < 8;
};

