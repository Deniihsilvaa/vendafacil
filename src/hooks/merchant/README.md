# Hooks do Merchant

## Estrutura de Autenticação

### `useMerchantAuth` (Principal) ✅

**Localização:** `src/hooks/useMerchantAuth.ts`

Este é o hook principal para todas as operações relacionadas ao merchant.

**Uso:**
```tsx
import { useMerchantAuth } from '@/hooks/useMerchantAuth';

function MerchantComponent() {
  const { 
    merchant,      // Dados do merchant logado
    login,         // Função para fazer login
    signup,        // Função para criar conta
    logout,        // Função para sair
    updateMerchant,// Função para atualizar dados
    loading,       // Estado de carregamento
    categories     // Categorias disponíveis
  } = useMerchantAuth();
  
  // ...
}
```

**Retorna:**
- `merchant: Merchant | null` - Dados do merchant logado
- `login: (credentials: MerchantLoginCredentials) => Promise<void>` - Função de login
- `signup: (credentials: MerchantSignupCredentials) => Promise<void>` - Função de cadastro
- `logout: () => Promise<void>` - Função de logout
- `updateMerchant: (merchant: Merchant) => Promise<void>` - Atualizar dados
- `loading: boolean` - Estado de carregamento
- `categories: Array<{value: string, label: string}>` - Categorias de lojas

---

## Contexto

### `MerchantAuthProvider`

**Localização:** `src/contexts/MerchantAuthContext.tsx`

Provedor de contexto que deve envolver componentes que usam `useMerchantAuth`.

**Exemplo de uso no App:**
```tsx
import { MerchantAuthProvider } from '@/contexts/MerchantAuthContext';

<MerchantAuthProvider>
  <MerchantRoutes />
</MerchantAuthProvider>
```

---

## Serviços

### `MerchantLoginService`

**Localização:** `src/services/merchant/merchantService.ts`

Serviço de baixo nível para comunicação com a API. **Não use diretamente**, use `useMerchantAuth` ao invés disso.

---

## Separação de Responsabilidades

### ✅ Componente de UI (MerchantLogin.tsx)
- **Responsabilidade:** Apenas renderização e interação com usuário
- **O que faz:**
  - Renderiza formulários
  - Captura inputs do usuário
  - Exibe feedbacks visuais
  - Gerencia estado local da UI (campos de formulário, erros de validação)

### ✅ Hook (useMerchantAuth)
- **Responsabilidade:** Lógica de negócio e estado global
- **O que faz:**
  - Gerencia estado de autenticação
  - Executa login/signup/logout
  - Comunica com API via serviços
  - Persiste dados no localStorage
  - Gerencia tokens de autenticação

### ✅ Serviço (MerchantLoginService)
- **Responsabilidade:** Comunicação com API
- **O que faz:**
  - Faz requisições HTTP
  - Formata payloads
  - Trata respostas da API
  - Não gerencia estado

---

## Fluxo de Dados

```
┌─────────────────┐
│  UI Component   │  MerchantLogin.tsx
│  (Apresentação) │  - Formulários
└────────┬────────┘  - Validação de UI
         │
         ↓ usa
┌─────────────────┐
│  Hook           │  useMerchantAuth()
│  (Lógica)       │  - Estado global
└────────┬────────┘  - Lógica de negócio
         │
         ↓ usa
┌─────────────────┐
│  Context        │  MerchantAuthContext
│  (Estado)       │  - Provider
└────────┬────────┘  - Estado compartilhado
         │
         ↓ usa
┌─────────────────┐
│  Service        │  MerchantLoginService()
│  (API)          │  - HTTP requests
└─────────────────┘  - Comunicação API
```

---

## Boas Práticas

### ✅ Fazer
- Use `useMerchantAuth` em componentes de UI
- Mantenha componentes focados apenas em apresentação
- Use o contexto através do hook
- Valide dados no frontend antes de enviar

### ❌ Não Fazer
- Não chame `MerchantLoginService` diretamente de componentes
- Não duplique lógica de autenticação
- Não misture lógica de negócio com componentes de UI
- Não crie múltiplos hooks de autenticação

---

## Exemplo Completo

```tsx
// ✅ CORRETO: Componente limpo focado em UI
import { useMerchantAuth } from '@/hooks/useMerchantAuth';

export const MerchantLogin = () => {
  const { login, categories, loading } = useMerchantAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      // Navegação ou feedback
    } catch (error) {
      // Tratar erro de UI
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Formulário */}
    </form>
  );
};
```

```tsx
// ❌ ERRADO: Lógica de negócio no componente
export const MerchantLoginBad = () => {
  const [merchant, setMerchant] = useState(null);
  
  const handleLogin = async () => {
    // ❌ Chamando service diretamente
    const response = await MerchantLoginService().login({...});
    // ❌ Gerenciando tokens manualmente
    localStorage.setItem('token', response.token);
    // ❌ Lógica de negócio misturada com UI
    setMerchant(response.user);
  };
  
  return <form>...</form>;
};
```

