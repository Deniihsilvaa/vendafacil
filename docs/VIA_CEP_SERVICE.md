# 📚 Documentação - Serviço ViaCEP

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Instalação e Configuração](#instalação-e-configuração)
3. [API Reference](#api-reference)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Integração com Formulários](#integração-com-formulários)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Boas Práticas](#boas-práticas)
8. [Limitações e Avisos](#limitações-e-avisos)
9. [Casos de Uso Comuns](#casos-de-uso-comuns)

---

## 🎯 Visão Geral

O serviço **ViaCEP** é um utilitário para consultar endereços através de CEPs brasileiros. Ele utiliza a API pública do [ViaCEP](https://viacep.com.br/) para buscar automaticamente informações de endereço como rua, bairro, cidade e estado.

### Arquivo

```
src/services/external/viaCepService.ts
```

### Características

- ✅ **Consulta assíncrona** via API pública do ViaCEP
- ✅ **Validação de formato** de CEP (8 dígitos)
- ✅ **Limpeza automática** de formatação (aceita "00000-000" ou "00000000")
- ✅ **TypeScript** com tipagem completa
- ✅ **Tratamento de erros** robusto
- ✅ **Sem dependências externas** (usa apenas `fetch` nativo)

---

## ⚙️ Instalação e Configuração

### Requisitos

- **Nenhuma dependência adicional** - usa apenas APIs nativas do JavaScript/TypeScript
- **Conexão com internet** - a API é externa e pública

### Importação

```typescript
// Importação direta (recomendado)
import { 
  consultarCep, 
  validarFormatoCep, 
  cepIncompleto,
  type ViaCepResponse 
} from '@/services/external/viaCepService';

// Ou via index (alternativa)
import { 
  consultarCep, 
  validarFormatoCep, 
  cepIncompleto,
  type ViaCepResponse 
} from '@/services/external';
```

---

## 📖 API Reference

### Interfaces TypeScript

#### `ViaCepResponse`

```typescript
interface ViaCepResponse {
  cep: string;           // CEP formatado (ex: "01310-100")
  logradouro: string;    // Nome da rua/avenida
  complemento: string;   // Complemento (geralmente vazio)
  bairro: string;        // Bairro
  localidade: string;    // Cidade
  uf: string;            // Estado (2 letras, ex: "SP")
  ibge: string;          // Código IBGE
  gia?: string;          // Código GIA (opcional)
  ddd?: string;          // DDD (opcional)
  siafi?: string;        // Código SIAFI (opcional)
}
```

---

### Funções Principais

#### `consultarCep(cep: string): Promise<ViaCepResponse | null>`

Consulta um CEP na API ViaCEP e retorna os dados do endereço.

**Parâmetros:**
- `cep` (string): CEP no formato "00000-000" ou "00000000"

**Retorno:**
- `Promise<ViaCepResponse | null>`: Dados do endereço ou `null` se não encontrado/inválido

**Comportamento:**
- Remove automaticamente formatação (aceita "00000-000" ou "00000000")
- Valida se o CEP tem 8 dígitos
- Retorna `null` se:
  - CEP inválido (menos de 8 dígitos)
  - CEP não encontrado
  - Erro na requisição

**Exemplo:**

```typescript
const dadosCep = await consultarCep('01310-100');

if (dadosCep) {
  console.log(dadosCep.logradouro); // "Avenida Paulista"
  console.log(dadosCep.bairro);     // "Bela Vista"
  console.log(dadosCep.localidade); // "São Paulo"
  console.log(dadosCep.uf);         // "SP"
} else {
  console.log('CEP não encontrado');
}
```

---

#### `validarFormatoCep(cep: string): boolean`

Valida se um CEP está no formato correto (8 dígitos).

**Parâmetros:**
- `cep` (string): CEP a ser validado

**Retorno:**
- `boolean`: `true` se o CEP tem 8 dígitos, `false` caso contrário

**Exemplo:**

```typescript
validarFormatoCep('01310-100'); // true
validarFormatoCep('01310100');  // true
validarFormatoCep('01310');     // false
validarFormatoCep('');          // false
```

---

#### `cepIncompleto(cep: string): boolean`

Verifica se um CEP está incompleto (tem dígitos mas menos de 8).

**Parâmetros:**
- `cep` (string): CEP a ser verificado

**Retorno:**
- `boolean`: `true` se está incompleto (1-7 dígitos), `false` se vazio ou completo

**Exemplo:**

```typescript
cepIncompleto('01310');    // true (5 dígitos)
cepIncompleto('0131');     // true (4 dígitos)
cepIncompleto('');         // false (vazio)
cepIncompleto('01310100'); // false (completo)
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Busca Simples

```typescript
import { consultarCep } from '@/services/external/viaCepService';

async function buscarEndereco(cep: string) {
  const dados = await consultarCep(cep);
  
  if (dados) {
    console.log(`Rua: ${dados.logradouro}`);
    console.log(`Bairro: ${dados.bairro}`);
    console.log(`Cidade: ${dados.localidade}`);
    console.log(`Estado: ${dados.uf}`);
  } else {
    console.error('CEP não encontrado');
  }
}

buscarEndereco('01310-100');
```

---

### Exemplo 2: Validação Antes de Buscar

```typescript
import { consultarCep, validarFormatoCep } from '@/services/external/viaCepService';

async function buscarEnderecoSeguro(cep: string) {
  // Valida antes de fazer a requisição
  if (!validarFormatoCep(cep)) {
    console.error('CEP inválido');
    return;
  }

  const dados = await consultarCep(cep);
  
  if (dados) {
    return dados;
  }
  
  console.error('CEP não encontrado');
  return null;
}
```

---

### Exemplo 3: Integração com React Hook

```typescript
import { useState, useCallback } from 'react';
import { consultarCep, validarFormatoCep } from '@/services/external/viaCepService';
import { formatZipCode, unformatZipCode } from '@/utils/format';

interface EnderecoFormData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

function useCepSearch() {
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState<EnderecoFormData | null>(null);

  const buscarCep = useCallback(async (cep: string) => {
    if (!validarFormatoCep(cep)) {
      return;
    }

    try {
      setLoading(true);
      const dadosCep = await consultarCep(cep);

      if (dadosCep) {
        setEndereco({
          street: dadosCep.logradouro,
          number: '',
          neighborhood: dadosCep.bairro,
          city: dadosCep.localidade,
          state: dadosCep.uf,
          zipCode: formatZipCode(dadosCep.cep),
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { buscarCep, loading, endereco };
}
```

---

### Exemplo 4: Busca com Debounce (React)

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { consultarCep, validarFormatoCep, cepIncompleto } from '@/services/external/viaCepService';
import { showErrorToast, showInfoToast } from '@/utils/toast';

function useCepAutoSearch(cep: string) {
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Se CEP completo, busca automaticamente
    if (validarFormatoCep(cep)) {
      buscarCep(cep);
    } else if (cepIncompleto(cep)) {
      // Se incompleto, aguarda 5 segundos e notifica
      timeoutRef.current = setTimeout(() => {
        showInfoToast('CEP incompleto. Digite os 8 dígitos.', 'CEP incompleto');
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cep]);

  const buscarCep = useCallback(async (cepValue: string) => {
    try {
      setLoading(true);
      const dadosCep = await consultarCep(cepValue);

      if (dadosCep) {
        setEndereco(dadosCep);
      } else {
        showErrorToast('CEP não encontrado', 'Erro');
      }
    } catch (error) {
      showErrorToast('Erro ao buscar CEP', 'Erro');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, endereco };
}
```

---

## 🔗 Integração com Formulários

### Exemplo: Integração com AddressForm

O serviço ViaCEP pode ser facilmente integrado com o componente `AddressForm`:

```typescript
import { AddressForm, type AddressFormData } from '@/components/forms/AddressForm';
import { consultarCep, validarFormatoCep } from '@/services/external/viaCepService';
import { formatZipCode, unformatZipCode } from '@/utils/format';

function MeuFormulario() {
  const [address, setAddress] = useState<AddressFormData>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleCepChange = async (cep: string) => {
    // Atualiza o CEP no estado
    setAddress(prev => ({ ...prev, zipCode: cep }));

    // Se CEP completo, busca automaticamente
    if (validarFormatoCep(cep)) {
      const dadosCep = await consultarCep(cep);
      
      if (dadosCep) {
        // Preenche campos automaticamente (exceto número)
        setAddress(prev => ({
          ...prev,
          street: dadosCep.logradouro || prev.street,
          neighborhood: dadosCep.bairro || prev.neighborhood,
          city: dadosCep.localidade || prev.city,
          state: dadosCep.uf || prev.state,
          zipCode: formatZipCode(dadosCep.cep),
        }));
      }
    }
  };

  return (
    <AddressForm
      value={address}
      onChange={setAddress}
      // ... outras props
    />
  );
}
```

---

### Exemplo: Campo CEP com Botão de Busca

```typescript
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/buttons';
import { Search } from 'lucide-react';
import { consultarCep, validarFormatoCep } from '@/services/external/viaCepService';
import { formatZipCode } from '@/utils/format';

function CepField({ value, onChange, onCepFound }) {
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    if (!validarFormatoCep(value)) {
      showErrorToast('CEP inválido', 'Erro');
      return;
    }

    try {
      setLoading(true);
      const dadosCep = await consultarCep(value);

      if (dadosCep) {
        onCepFound(dadosCep);
        showSuccessToast('Endereço encontrado!', 'Sucesso');
      } else {
        showErrorToast('CEP não encontrado', 'Erro');
      }
    } catch (error) {
      showErrorToast('Erro ao buscar CEP', 'Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="00000-000"
        value={formatZipCode(value)}
        onChange={(e) => onChange(e.target.value)}
        maxLength={9}
        className="flex-1"
        disabled={loading}
      />
      <Button
        type="button"
        onClick={handleBuscar}
        loading={loading}
        disabled={loading || !value}
        variant="outline"
      >
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </div>
  );
}
```

---

## ⚠️ Tratamento de Erros

### Casos de Erro Comuns

1. **CEP Inválido** (menos de 8 dígitos)
   ```typescript
   const dados = await consultarCep('123'); // Retorna null
   ```

2. **CEP Não Encontrado**
   ```typescript
   const dados = await consultarCep('00000-000'); // Retorna null
   ```

3. **Erro de Rede**
   ```typescript
   // Retorna null e loga erro no console
   const dados = await consultarCep('01310-100');
   ```

### Padrão Recomendado de Tratamento

```typescript
import { consultarCep, validarFormatoCep } from '@/services/external/viaCepService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

async function buscarCepComTratamento(cep: string) {
  // Validação inicial
  if (!cep || cep.trim() === '') {
    showErrorToast('CEP não pode estar vazio', 'Erro');
    return null;
  }

  if (!validarFormatoCep(cep)) {
    showErrorToast('CEP inválido. Digite 8 dígitos.', 'CEP Inválido');
    return null;
  }

  try {
    const dadosCep = await consultarCep(cep);

    if (!dadosCep) {
      showErrorToast('CEP não encontrado. Verifique o CEP digitado.', 'CEP não encontrado');
      return null;
    }

    // Sucesso - dados encontrados
    showSuccessToast('Endereço encontrado!', 'Sucesso');
    return dadosCep;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    showErrorToast('Erro ao buscar CEP. Tente novamente.', 'Erro na busca');
    return null;
  }
}
```

---

## ✅ Boas Práticas

### 1. Sempre Valide Antes de Buscar

```typescript
// ✅ BOM
if (validarFormatoCep(cep)) {
  const dados = await consultarCep(cep);
}

// ❌ EVITAR
const dados = await consultarCep(cep); // Pode retornar null sem necessidade
```

### 2. Use Debounce para Busca Automática

```typescript
// ✅ BOM - Evita muitas requisições
const [cep, setCep] = useState('');
const debouncedCep = useDebounce(cep, 500);

useEffect(() => {
  if (validarFormatoCep(debouncedCep)) {
    buscarCep(debouncedCep);
  }
}, [debouncedCep]);

// ❌ EVITAR - Muitas requisições
onChange={(e) => {
  setCep(e.target.value);
  buscarCep(e.target.value); // Requisição a cada digitação
}}
```

### 3. Sempre Trate o Retorno Null

```typescript
// ✅ BOM
const dados = await consultarCep(cep);
if (dados) {
  // Usar dados
} else {
  // Tratar erro
}

// ❌ EVITAR
const dados = await consultarCep(cep);
console.log(dados.logradouro); // Pode dar erro se dados for null
```

### 4. Não Sobrescreva Dados já Preenchidos Sempre

```typescript
// ✅ BOM - Preserva número e outros campos
setAddress(prev => ({
  ...prev,
  street: dadosCep.logradouro || prev.street,
  neighborhood: dadosCep.bairro || prev.neighborhood,
  // Não sobrescreve 'number'
}));

// ❌ EVITAR - Pode perder dados do usuário
setAddress({
  street: dadosCep.logradouro,
  number: '', // Perdeu o número que o usuário digitou
});
```

### 5. Use Loading States

```typescript
// ✅ BOM
const [loading, setLoading] = useState(false);

const buscarCep = async (cep: string) => {
  setLoading(true);
  try {
    const dados = await consultarCep(cep);
    // ...
  } finally {
    setLoading(false);
  }
};

// No componente
<Button disabled={loading} loading={loading}>
  Buscar CEP
</Button>
```

---

## 🚨 Limitações e Avisos

### ⚠️ Uso Massivo

> **IMPORTANTE**: A API ViaCEP é pública e gratuita, mas **uso massivo para validação de bases de dados locais poderá automaticamente bloquear seu acesso por tempo indeterminado**.

**Recomendações:**
- ✅ Use apenas para **validação em tempo real** durante a digitação do usuário
- ✅ Use **debounce** para evitar muitas requisições
- ❌ **Não use** para validar grandes listas de CEPs em batch
- ❌ **Não faça** scraping ou crawlers da API

### Limitações Técnicas

1. **Requisições por segundo**: Não há limite oficial documentado, mas use com moderação
2. **Disponibilidade**: API pode estar temporariamente indisponível
3. **Dados**: Alguns CEPs podem não retornar todos os campos (ex: `logradouro` vazio)
4. **Formato**: A API aceita apenas CEPs brasileiros (8 dígitos)

### CEPs Especiais

Alguns CEPs podem retornar dados incompletos:
- CEPs muito novos podem não estar na base
- CEPs de áreas rurais podem ter campos vazios
- Sempre valide se os campos necessários estão presentes

```typescript
const dados = await consultarCep(cep);
if (dados && dados.logradouro) {
  // Garantir que logradouro não está vazio
  setStreet(dados.logradouro);
}
```

---

## 📝 Casos de Uso Comuns

### 1. Formulário de Cadastro de Endereço

```typescript
// src/pages/customer/profile/AddressForm.tsx
import { consultarCep, validarFormatoCep } from '@/services/external/viaCepService';

function AddressForm() {
  const [address, setAddress] = useState(/* ... */);

  const handleCepBlur = async () => {
    if (validarFormatoCep(address.zipCode)) {
      const dados = await consultarCep(address.zipCode);
      if (dados) {
        setAddress(prev => ({
          ...prev,
          street: dados.logradouro,
          neighborhood: dados.bairro,
          city: dados.localidade,
          state: dados.uf,
        }));
      }
    }
  };

  return (
    <Input
      name="zipCode"
      value={address.zipCode}
      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
      onBlur={handleCepBlur}
    />
  );
}
```

---

### 2. Checkout com Validação de Entrega

```typescript
// src/pages/public/Checkout/CheckoutAddressForm.tsx
import { consultarCep } from '@/services/external/viaCepService';

function CheckoutAddressForm({ onAddressChange }) {
  const buscarCep = async (cep: string) => {
    const dados = await consultarCep(cep);
    if (dados) {
      onAddressChange({
        street: dados.logradouro,
        neighborhood: dados.bairro,
        city: dados.localidade,
        state: dados.uf,
        zipCode: dados.cep,
      });
    }
  };
  // ...
}
```

---

### 3. Validação de CEP em Input

```typescript
// Componente reutilizável
function CepInput({ value, onChange, onCepFound }) {
  const [isValidating, setIsValidating] = useState(false);

  const validateCep = async (cep: string) => {
    if (!validarFormatoCep(cep)) {
      return;
    }

    setIsValidating(true);
    const dados = await consultarCep(cep);
    setIsValidating(false);

    if (dados) {
      onCepFound(dados);
    }
  };

  return (
    <div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => validateCep(value)}
      />
      {isValidating && <Spinner />}
    </div>
  );
}
```

---

## 🔄 Migração e Compatibilidade

### Versão Atual

- **Arquivo**: `src/services/external/viaCepService.ts`
- **API**: ViaCEP REST API (JSON)
- **Formato de retorno**: `ViaCepResponse | null`

### Mudanças Futuras

Se a API ViaCEP mudar no futuro, apenas o arquivo `viaCepService.ts` precisará ser atualizado. Todos os componentes que o utilizam continuarão funcionando sem alterações.

---

## 📚 Referências

- **API ViaCEP**: https://viacep.com.br/
- **Documentação Oficial**: https://viacep.com.br/exemplo/javascript/
- **Termos de Uso**: https://viacep.com.br/

---

## 🎣 Hook Customizado (Opcional)

Para facilitar ainda mais o uso, você pode criar um hook customizado:

```typescript
// src/hooks/useCepSearch.ts
import { useState, useCallback } from 'react';
import { consultarCep, validarFormatoCep } from '@/services/external/viaCepService';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import type { ViaCepResponse } from '@/services/external/viaCepService';

interface UseCepSearchReturn {
  buscarCep: (cep: string, isManual?: boolean) => Promise<void>;
  loading: boolean;
  dadosCep: ViaCepResponse | null;
  reset: () => void;
}

export const useCepSearch = (): UseCepSearchReturn => {
  const [loading, setLoading] = useState(false);
  const [dadosCep, setDadosCep] = useState<ViaCepResponse | null>(null);

  const buscarCep = useCallback(async (cep: string, isManual = false) => {
    if (!validarFormatoCep(cep)) {
      if (isManual) {
        showErrorToast('CEP inválido. Digite um CEP com 8 dígitos.', 'CEP Inválido');
      }
      return;
    }

    try {
      setLoading(true);
      const dados = await consultarCep(cep);

      if (!dados) {
        if (isManual) {
          showErrorToast('CEP não encontrado. Verifique o CEP digitado.', 'CEP não encontrado');
        }
        setDadosCep(null);
        return;
      }

      setDadosCep(dados);
      if (isManual) {
        showSuccessToast('Endereço encontrado e preenchido automaticamente!', 'CEP encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      if (isManual) {
        showErrorToast('Erro ao buscar CEP. Tente novamente.', 'Erro na busca');
      }
      setDadosCep(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setDadosCep(null);
    setLoading(false);
  }, []);

  return { buscarCep, loading, dadosCep, reset };
};
```

### Uso do Hook

```typescript
import { useCepSearch } from '@/hooks/useCepSearch';

function MeuComponente() {
  const { buscarCep, loading, dadosCep, reset } = useCepSearch();

  const handleCepChange = (cep: string) => {
    if (validarFormatoCep(cep)) {
      buscarCep(cep, false); // Busca automática
    }
  };

  const handleBuscarManual = () => {
    buscarCep(cepValue, true); // Busca manual com feedback
  };

  useEffect(() => {
    if (dadosCep) {
      // Preencher campos do formulário
      setStreet(dadosCep.logradouro);
      setNeighborhood(dadosCep.bairro);
      setCity(dadosCep.localidade);
      setState(dadosCep.uf);
    }
  }, [dadosCep]);

  return (
    <div>
      <Input 
        onChange={(e) => handleCepChange(e.target.value)}
        disabled={loading}
      />
      <Button onClick={handleBuscarManual} loading={loading}>
        Buscar
      </Button>
    </div>
  );
}
```

---

**Última atualização**: 22 de Dezembro de 2024

