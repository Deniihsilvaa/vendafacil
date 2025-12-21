# 🔧 Configuração do Supabase Realtime

Este projeto usa **Supabase APENAS para real-time** (WebSockets), mantendo sua API REST própria para CRUD.

## ⚠️ IMPORTANTE: Segurança das Variáveis

**As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` são PÚBLICAS por design.**

- A chave **ANON** do Supabase é projetada para ser exposta no frontend
- Ela é protegida por **Row Level Security (RLS)** no banco de dados
- **NÃO é um segredo sensível** - pode ser commitada no código se necessário
- O sistema de build pode alertar sobre "secrets expostos", mas isso é um falso positivo

## 📋 Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env` ou `.env.local`:

```env
# Supabase (APENAS para real-time)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui

# OU (se usar Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

## 🚀 Como Obter as Credenciais

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## 🔐 Configuração no Supabase

### 1. Habilitar Realtime na Tabela `orders`

No Supabase Dashboard:

1. Vá em **Database** → **Tables**
2. Selecione a tabela `orders`
3. Vá em **Replication**
4. Ative **Enable Realtime** para a tabela

### 2. Configurar RLS (Row Level Security) - Opcional

Se quiser usar RLS para filtrar por `customer_id` ou `store_id`:

```sql
-- Permitir que clientes vejam apenas seus pedidos
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
USING (auth.uid() = customer_id::uuid);

-- Permitir que merchants vejam pedidos de sua loja
CREATE POLICY "Merchants can view store orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = orders.store_id 
    AND stores.owner_id = auth.uid()
  )
);
```

## ⚠️ Importante

- **NÃO use Supabase para autenticação** - O projeto já tem seu próprio sistema de auth
- **NÃO use Supabase para CRUD** - Use sua API REST própria
- **Use APENAS para real-time** - Receber atualizações via WebSocket

## 🧪 Testando a Conexão

1. Inicie o projeto: `npm run dev`
2. Acesse a página de pedidos: `/loja/:storeId/orders`
3. Verifique o console do navegador - deve aparecer: `"Conectado ao Supabase Realtime"`
4. O indicador verde "Atualizações em tempo real" deve aparecer no topo da página

## 🔄 Fluxo de Atualizações

1. **Backend atualiza pedido** → Sua API REST atualiza o banco
2. **Supabase detecta mudança** → Trigger/Webhook envia evento
3. **Frontend recebe via WebSocket** → Hook `useRealtimeOrders` processa
4. **UI atualiza automaticamente** → Lista de pedidos se atualiza
5. **Notificação aparece** → Toast informa sobre mudança de status

## 🐛 Troubleshooting

### Conexão não funciona?

1. Verifique se as variáveis de ambiente estão corretas
2. Verifique se Realtime está habilitado na tabela `orders`
3. Verifique o console do navegador para erros
4. Teste a conexão manualmente no Supabase Dashboard

### Notificações não aparecem?

1. Verifique se o hook `useRealtimeOrders` está sendo chamado
2. Verifique se `customerId` e `storeId` estão corretos
3. Verifique se os filtros do Supabase estão corretos

### Performance ruim?

1. O hook limita eventos a 5 por segundo
2. Ajuste `eventsPerSecond` em `realtime-client.ts` se necessário
3. Considere debounce para atualizações muito frequentes

