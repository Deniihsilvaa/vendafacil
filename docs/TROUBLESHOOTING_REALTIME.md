# 🔧 Troubleshooting - Realtime Sync

Este guia ajuda a resolver problemas comuns relacionados ao sistema de sincronização em tempo real.

## ❌ Erro: "Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão configuradas"

Este erro indica que as variáveis de ambiente não estão sendo lidas corretamente pelo Vite.

### ✅ Soluções:

#### 1. Verificar se o arquivo `.env` existe na raiz do projeto

O arquivo `.env` deve estar no mesmo diretório que o `package.json`:

```
Front_VendaFacil/
├── .env          ← Aqui!
├── package.json
├── src/
└── ...
```

#### 2. Verificar o formato do arquivo `.env`

O arquivo deve ter este formato (sem espaços ao redor do `=`):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

**❌ Errado:**
```env
VITE_SUPABASE_URL = https://seu-projeto.supabase.co  # Espaços ao redor do =
VITE_SUPABASE_ANON_KEY= "sua-chave"                  # Aspas não são necessárias
```

**✅ Correto:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

#### 3. Reiniciar o servidor de desenvolvimento

**IMPORTANTE:** Após adicionar ou modificar variáveis de ambiente no arquivo `.env`, você **DEVE** reiniciar o servidor:

1. Pare o servidor (pressione `Ctrl+C` no terminal)
2. Inicie novamente: `npm run dev`

As variáveis de ambiente são carregadas apenas na inicialização do servidor.

#### 4. Verificar se as variáveis estão sendo lidas

Adicione temporariamente este código em algum componente para verificar:

```tsx
import { debugSupabaseEnv } from '@/utils/env-check';

// Em algum componente ou arquivo de inicialização
debugSupabaseEnv();
```

Ou no console do navegador:

```javascript
// No console do navegador (F12)
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Presente' : 'Ausente');
```

#### 5. Verificar se não há arquivo `.env.local` ou `.env.production` sobrescrevendo

O Vite carrega variáveis nesta ordem (último sobrescreve):
1. `.env`
2. `.env.local`
3. `.env.[mode]`
4. `.env.[mode].local`

Certifique-se de que não há conflitos.

#### 6. Verificar se o nome do arquivo está correto

O arquivo deve se chamar exatamente `.env` (com o ponto no início).

**❌ Errado:**
- `env`
- `.env.txt`
- `env.local`

**✅ Correto:**
- `.env`
- `.env.local`
- `.env.development`

## ❌ Erro: CHANNEL_ERROR ao conectar

Se você está recebendo `CHANNEL_ERROR` mesmo com as variáveis configuradas:

### ✅ Soluções:

1. **Verificar se as credenciais estão corretas**
   - A URL deve ser: `https://[seu-projeto].supabase.co`
   - A chave ANON deve ser a chave pública (não a service_role)

2. **Verificar se o Realtime está habilitado no Supabase**
   - Vá para o Dashboard do Supabase
   - Database → Replication
   - Certifique-se de que a tabela `orders` está replicada

3. **Verificar políticas RLS**
   - As políticas RLS devem estar configuradas corretamente
   - O usuário deve estar autenticado (para customer ou merchant)

## ❌ Realtime conecta mas não recebe eventos

### ✅ Soluções:

1. **Verificar se há mudanças acontecendo**
   - Teste criando/atualizando um pedido manualmente no banco

2. **Verificar filtros do canal**
   - Os filtros devem corresponder aos dados que você espera receber
   - Para customers: `customer_id=eq.{customer_id}`
   - Para merchants: `store_id=in.(store1,store2,...)`

3. **Verificar logs do console**
   - Procure por mensagens de erro no console do navegador
   - Verifique se o canal está no status `SUBSCRIBED`

## 📋 Checklist de Verificação

Use este checklist para diagnosticar problemas:

- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] Variáveis começam com `VITE_`
- [ ] Não há espaços ao redor do `=` no `.env`
- [ ] Servidor foi reiniciado após adicionar variáveis
- [ ] URL está no formato: `https://[projeto].supabase.co`
- [ ] Chave ANON é a chave pública (anon key)
- [ ] Realtime está habilitado para a tabela `orders` no Supabase
- [ ] Políticas RLS estão configuradas
- [ ] Usuário está autenticado (customer ou merchant)

## 🔍 Comandos Úteis para Debug

### No código:

```typescript
import { checkSupabaseEnv, debugSupabaseEnv } from '@/utils/env-check';

// Verificar configuração
const check = checkSupabaseEnv();
console.log('Configurado:', check.isConfigured);

// Debug completo
debugSupabaseEnv();
```

### No console do navegador:

```javascript
// Ver variáveis de ambiente
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Presente' : 'Ausente');

// Ver todas as variáveis que começam com VITE_
console.log('Todas as variáveis VITE_:', 
  Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
);
```

## 📞 Ainda com problemas?

Se nenhuma das soluções acima funcionou:

1. Verifique os logs completos no console do navegador
2. Verifique os logs do servidor de desenvolvimento
3. Certifique-se de que está usando a versão mais recente do código
4. Tente criar um arquivo `.env.local` (ele tem prioridade sobre `.env`)

