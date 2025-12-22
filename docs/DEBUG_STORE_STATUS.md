# 🔍 Debug - Status da Loja (Toggle Temporariamente Fechada)

Este documento ajuda a debugar problemas com o toggle de status da loja.

## 📋 Fluxo Completo

1. **Componente StoreStatusCard**
   - Switch alterado pelo usuário
   - Chama `onToggle(shouldClose)`

2. **Hook useStoreStatus**
   - Recebe `closed: boolean`
   - Chama `StoreService.toggleStoreStatus(storeId, closed)`
   - Atualiza estado com resposta

3. **StoreService.toggleStoreStatus**
   - Envia PATCH para `/api/merchant/stores/{storeId}/toggle-status`
   - Payload: `{ closed: boolean }`
   - Retorna `StoreStatus`

## 🔍 Como Debugar

### 1. Verificar Console do Navegador

Após tentar fazer toggle, procure por estas mensagens:

```
🔄 StoreStatusCard - Switch alterado:
🔄 useStoreStatus.toggleStatus - Iniciando toggle:
📤 StoreService.toggleStoreStatus - Enviando requisição:
📥 StoreService.toggleStoreStatus - Resposta recebida:
✅ useStoreStatus.toggleStatus - Status atualizado:
```

### 2. Verificar o que está sendo enviado

No console, você deve ver algo como:

```javascript
📤 StoreService.toggleStoreStatus - Enviando requisição: {
  url: "/api/merchant/stores/xxx/toggle-status",
  storeId: "xxx",
  closed: true,  // ou false
  payload: { closed: true }
}
```

**Se `closed` está incorreto:**
- Problema no frontend (lógica do Switch)

### 3. Verificar o que está sendo recebido

```javascript
📥 StoreService.toggleStoreStatus - Resposta recebida: {
  response: { ... },
  isTemporarilyClosed: true,  // ou false
  isOpen: false,  // ou true
  temporarilyClosed: true  // campo raw da API (pode estar em snake_case)
}
```

**Se `isTemporarilyClosed` está incorreto mas `temporarilyClosed` está correto:**
- API está retornando em snake_case, precisa transformar

**Se ambos estão incorretos:**
- Problema na API (não está salvando/retornando corretamente)

### 4. Verificar Requisição HTTP

No DevTools → Network:
1. Filtre por "toggle-status"
2. Verifique a requisição PATCH
3. Veja o Request Payload (deve ser `{ "closed": true }` ou `{ "closed": false }`)
4. Veja a Response (deve ter `isTemporarilyClosed` ou `temporarily_closed`)

## 🐛 Problemas Comuns

### Problema 1: Valor sempre volta para false

**Sintoma:** Você faz toggle, mas logo depois o valor volta para false

**Possíveis causas:**
1. ✅ **RESOLVIDO:** Recarregamento automático após toggle (agora há proteção de 5 segundos)
2. API não está salvando o valor corretamente
3. API está retornando valor antigo

**Como verificar:**
- Veja os logs no console
- Verifique se a resposta da API tem o valor correto
- Verifique no banco de dados se o valor foi salvo

### Problema 2: Valor nunca muda

**Sintoma:** Você faz toggle, mas o valor nunca muda

**Possíveis causas:**
1. API não está processando a requisição
2. Erro na requisição (verifique Network tab)
3. Lógica do Switch está invertida

**Como verificar:**
- Veja se há erros no console
- Verifique se a requisição está sendo enviada (Network tab)
- Verifique o status code da resposta (deve ser 200)

### Problema 3: Valor muda mas não persiste

**Sintoma:** O valor muda na tela, mas ao recarregar a página volta ao anterior

**Possíveis causas:**
1. API não está salvando no banco de dados
2. Problema no backend ao salvar

**Como verificar:**
- Verifique no banco de dados se `temporarily_closed` foi atualizado
- Verifique logs do backend

## 🔧 Transformação de Dados (se necessário)

Se a API retornar em snake_case, pode ser necessário transformar:

```typescript
// Se a API retornar temporarily_closed em vez de isTemporarilyClosed
const transformStoreStatus = (apiResponse: any): StoreStatus => {
  return {
    ...apiResponse,
    isTemporarilyClosed: apiResponse.temporarily_closed ?? apiResponse.isTemporarilyClosed,
  };
};
```

Mas primeiro verifique os logs para ver o formato exato da resposta.

