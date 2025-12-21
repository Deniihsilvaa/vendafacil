# 📦 Esquema de Banco de Dados – Supabase (StoreFlow)

Documento gerado a partir de `DOCUMENTACAO_BACKEND.md`. Contém os `CREATE TYPE` e `CREATE TABLE` necessários para provisionar a base no Supabase (PostgreSQL).  
Execute os blocos SQL na ordem apresentada. Ajuste nomes de schemas conforme a configuração do projeto (por padrão, Supabase usa `public`).

> ℹ️ Principais diretrizes aplicadas: clientes independentes de lojas, colunas `deleted_at` para soft delete, índices de busca full-text, validações (`CHECK`) para integridade e estrutura simplificada de customizações de produto.

---

## 🎨 Tipos Personalizados (ENUM)

```sql
-- Categorias padronizadas de loja
CREATE TYPE store_category_enum AS ENUM (
  'hamburgueria',
  'pizzaria',
  'pastelaria',
  'sorveteria',
  'cafeteria',
  'padaria',
  'comida_brasileira',
  'comida_japonesa',
  'doces',
  'mercado',
  'outros'
);

-- Papel do lojista
CREATE TYPE merchant_role_enum AS ENUM ('admin', 'manager');

-- Família do produto
CREATE TYPE product_family_enum AS ENUM ('raw_material', 'finished_product', 'addon');

-- Categoria de customização do produto
CREATE TYPE product_customization_type_enum AS ENUM ('extra', 'sauce', 'base', 'protein', 'topping');

-- Tipo de seleção para customização
CREATE TYPE selection_type_enum AS ENUM ('quantity', 'boolean');

-- Método de fulfillment do pedido
CREATE TYPE fulfillment_method_enum AS ENUM ('delivery', 'pickup');

-- Status do pedido
CREATE TYPE order_status_enum AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- Forma de pagamento
CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'debit_card', 'pix', 'cash');

-- Status do pagamento
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed');

-- Tipo de endereço do cliente
CREATE TYPE customer_address_type_enum AS ENUM ('home', 'work', 'other');

-- Tipo de endereço da loja
CREATE TYPE store_address_type_enum AS ENUM ('main', 'pickup');
```

---

## 🧑‍🤝‍🧑 Usuários e Autenticação

Supabase já possui `auth.users`. Tabelas abaixo estendem o perfil.

```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role merchant_role_enum NOT NULL DEFAULT 'admin',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customers_phone_min_length CHECK (char_length(trim(phone)) >= 8),
  CONSTRAINT customers_name_not_blank CHECK (char_length(trim(name)) > 0)
);
-- redundante

-- CREATE TABLE refresh_tokens (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   token TEXT NOT NULL UNIQUE,
--   expires_at TIMESTAMPTZ NOT NULL,
--   is_active BOOLEAN NOT NULL DEFAULT TRUE,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);
```

> ✅ Clientes são independentes de lojas. Use tabelas relacionais (ex.: pedidos, endereços) para vincular clientes a lojas específicas quando necessário.

---

## 🏬 Lojas

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category store_category_enum NOT NULL,
  custom_category TEXT, -- obrigatório quando category = 'outros'
  avatar_url TEXT,
  banner_url TEXT,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  primary_color TEXT NOT NULL DEFAULT '#FF5733',
  secondary_color TEXT NOT NULL DEFAULT '#33FF57',
  accent_color TEXT NOT NULL DEFAULT '#3357FF',
  text_color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_time TEXT,
  min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  free_delivery_above NUMERIC(10,2) CHECK (free_delivery_above IS NULL OR free_delivery_above >= 0),
  accepts_payment_credit_card BOOLEAN NOT NULL DEFAULT TRUE,
  accepts_payment_debit_card BOOLEAN NOT NULL DEFAULT TRUE,
  accepts_payment_pix BOOLEAN NOT NULL DEFAULT TRUE,
  accepts_payment_cash BOOLEAN NOT NULL DEFAULT TRUE,
  fulfillment_delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  fulfillment_pickup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  fulfillment_pickup_instructions TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_secondary_color CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_accent_color CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE store_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  address_type store_address_type_enum NOT NULL, -- main | pickup
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  complement TEXT,
  reference TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_store_address_type UNIQUE (store_id, address_type),
  CONSTRAINT store_addresses_zip_check CHECK (char_length(trim(zip_code)) BETWEEN 8 AND 12)
);

CREATE TABLE store_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  week_day SMALLINT NOT NULL CHECK (week_day BETWEEN 0 AND 6), -- 0=domingo
  opens_at TIME,
  closes_at TIME,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_store_weekday UNIQUE (store_id, week_day)
);

CREATE TABLE store_delivery_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  estimated_time TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX store_delivery_options_store_idx
  ON store_delivery_options (store_id)
  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX store_delivery_options_default_idx
  ON store_delivery_options (store_id)
  WHERE is_default = TRUE AND deleted_at IS NULL;

CREATE INDEX stores_category_idx ON stores (category) WHERE deleted_at IS NULL;
CREATE INDEX stores_name_search_idx
  ON stores USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')))
  WHERE deleted_at IS NULL;
```

---

## 🍔 Produtos e Customizações

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  family product_family_enum NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  custom_category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  preparation_time INTEGER NOT NULL DEFAULT 0,
  nutritional_info JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_pricing CHECK (
    (family = 'finished_product' AND price >= cost_price)
    OR family IN ('raw_material', 'addon')
  )
);

CREATE INDEX products_store_idx
  ON products (store_id)
  WHERE deleted_at IS NULL;
CREATE INDEX products_family_idx
  ON products (family)
  WHERE deleted_at IS NULL;
CREATE INDEX products_category_idx ON products (category) WHERE deleted_at IS NULL;
CREATE INDEX products_name_search_idx
  ON products USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')))
  WHERE deleted_at IS NULL;

CREATE TABLE product_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  customization_type product_customization_type_enum NOT NULL DEFAULT 'extra',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  selection_type selection_type_enum NOT NULL DEFAULT 'quantity',
  selection_group TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX product_customizations_product_idx
  ON product_customizations (product_id)
  WHERE deleted_at IS NULL;
CREATE INDEX product_customizations_name_idx
  ON product_customizations USING GIN (to_tsvector('simple', coalesce(name, '')))
  WHERE deleted_at IS NULL;

CREATE TABLE product_extra_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_extra_list_name_per_store UNIQUE (store_id, name)
);

CREATE INDEX product_extra_lists_store_idx
  ON product_extra_lists (store_id)
  WHERE deleted_at IS NULL;

CREATE INDEX product_extra_lists_name_idx
  ON product_extra_lists USING GIN (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')))
  WHERE deleted_at IS NULL;

CREATE TABLE product_extra_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_list_id UUID NOT NULL REFERENCES product_extra_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0 AND sale_price >= cost_price),
  position INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX product_extra_list_items_list_idx
  ON product_extra_list_items (extra_list_id)
  WHERE deleted_at IS NULL;

CREATE TABLE product_extra_list_applicability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_list_id UUID NOT NULL REFERENCES product_extra_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_extra_list_applicability UNIQUE (extra_list_id, product_id)
);

CREATE INDEX product_extra_list_applicability_list_idx
  ON product_extra_list_applicability (extra_list_id);

CREATE INDEX product_extra_list_applicability_product_idx
  ON product_extra_list_applicability (product_id);
```

> Use `product_extra_list_applicability` para relacionar produtos acabados às listas reutilizáveis de extras, garantindo integridade referencial e evitando arrays dentro das tabelas.

---

## 👤 Clientes – Endereços

```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_type customer_address_type_enum NOT NULL DEFAULT 'other',
  label TEXT,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  complement TEXT,
  reference TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customer_addresses_zip_check CHECK (char_length(trim(zip_code)) BETWEEN 8 AND 12)
);

CREATE INDEX customer_addresses_customer_idx
  ON customer_addresses (customer_id)
  WHERE deleted_at IS NULL;

-- Garantir que apenas um endereço padrão por cliente
CREATE UNIQUE INDEX customer_addresses_unique_default
ON customer_addresses (customer_id)
WHERE is_default = TRUE;

CREATE INDEX customers_name_search_idx
  ON customers USING GIN (to_tsvector('simple', coalesce(name, '')))
  WHERE deleted_at IS NULL;
```

---

## 🛒 Pedidos

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  delivery_option_id UUID REFERENCES store_delivery_options(id) ON DELETE SET NULL,
  fulfillment_method fulfillment_method_enum NOT NULL,
  pickup_slot TIMESTAMPTZ,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  status order_status_enum NOT NULL DEFAULT 'pending',
  payment_method payment_method_enum NOT NULL,
  payment_status payment_status_enum NOT NULL DEFAULT 'pending',
  estimated_delivery_time TIMESTAMPTZ,
  observations TEXT,
  cancellation_reason TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_store_idx
  ON orders (store_id)
  WHERE deleted_at IS NULL;
CREATE INDEX orders_customer_idx
  ON orders (customer_id)
  WHERE deleted_at IS NULL;
CREATE INDEX orders_status_idx
  ON orders (status)
  WHERE deleted_at IS NULL;
CREATE INDEX orders_payment_status_idx
  ON orders (payment_status)
  WHERE deleted_at IS NULL;
CREATE INDEX orders_created_at_idx ON orders (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE order_delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  complement TEXT,
  reference TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX order_delivery_addresses_order_idx
  ON order_delivery_addresses (order_id)
  WHERE deleted_at IS NULL;

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_family product_family_enum NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  unit_cost_price NUMERIC(10,2) CHECK (unit_cost_price IS NULL OR unit_cost_price >= 0),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  observations TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX order_items_order_idx
  ON order_items (order_id)
  WHERE deleted_at IS NULL;

CREATE TABLE order_item_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  customization_id UUID REFERENCES product_customizations(id) ON DELETE SET NULL,
  customization_name TEXT NOT NULL,
  customization_type product_customization_type_enum NOT NULL,
  selection_type selection_type_enum NOT NULL,
  selection_group TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX order_item_customizations_item_idx
  ON order_item_customizations (order_item_id)
  WHERE deleted_at IS NULL;

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status_enum NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  note TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX order_status_history_order_idx
  ON order_status_history (order_id)
  WHERE deleted_at IS NULL;
```

---
## Inventario
```sql
-- 1. Criar schema
CREATE SCHEMA IF NOT EXISTS inventory;

-- 2. Criar tabelas
CREATE TABLE inventory.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock INTEGER NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_product_inventory UNIQUE (store_id, product_id)
);

CREATE TABLE inventory.inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory.inventory(id) ON DELETE CASCADE,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('sale', 'manual_adjust', 'purchase')),
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Configurar permissões
GRANT USAGE ON SCHEMA inventory TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA inventory TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA inventory TO authenticated;

-- 4. Criar índices básicos
CREATE INDEX CONCURRENTLY inventory_store_product_idx 
ON inventory.inventory (store_id, product_id);

CREATE INDEX CONCURRENTLY inventory_history_inventory_idx 
ON inventory.inventory_history (inventory_id, created_at DESC);

```
## 🔄 Relacionamento Loja ↔ Lojista

Uma loja pode ter múltiplos lojistas (admin/manager). Crie tabela pivô:

```sql
CREATE TABLE store_merchant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  role merchant_role_enum NOT NULL DEFAULT 'manager',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_store_merchant UNIQUE (store_id, merchant_id)
);

CREATE INDEX store_merchant_members_store_idx
  ON store_merchant_members (store_id)
  WHERE deleted_at IS NULL;

CREATE INDEX store_merchant_members_merchant_idx
  ON store_merchant_members (merchant_id)
  WHERE deleted_at IS NULL;
```

Atualize `stores.merchant_id` para opcional caso use múltiplos administradores:

```sql
ALTER TABLE stores
  DROP CONSTRAINT stores_merchant_id_fkey,
  ALTER COLUMN merchant_id DROP NOT NULL,
  ADD CONSTRAINT stores_merchant_id_fkey
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL;
```

---

## 🧾 Views & Índices Auxiliares (Opcional)

```sql
-- View para exibir produtos com categorias amigáveis
CREATE VIEW v_products_overview AS
SELECT
  p.*,
  s.name AS store_name,
  s.slug AS store_slug
FROM products p
JOIN stores s ON s.id = p.store_id;

-- Índice único por loja + nome normalizado
DROP INDEX IF EXISTS products_store_slug_name_idx;
CREATE UNIQUE INDEX products_store_name_idx
ON products (store_id, lower(name))
WHERE deleted_at IS NULL;
```

### Melhorias opcionais recomendadas

```sql
-- Adicionar slug opcional para URLs amigáveis
ALTER TABLE products ADD COLUMN slug TEXT;
CREATE UNIQUE INDEX products_store_slug_idx
  ON products (store_id, slug)
  WHERE slug IS NOT NULL AND deleted_at IS NULL;

-- Campos para controle de estoque
ALTER TABLE products ADD COLUMN track_inventory BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0);

-- Índice de busca mais abrangente (português)
CREATE INDEX products_search_comprehensive_idx
  ON products USING GIN (
    to_tsvector(
      'portuguese',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(category, '')
    )
  )
  WHERE deleted_at IS NULL;
```

---

## 🔐 Regras RLS (Resumo)

Defina regras de Row-Level Security conforme necessidade:

```sql
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Exemplo: clientes só enxergam seus próprios pedidos
CREATE POLICY customer_orders_select
ON orders
FOR SELECT
USING (auth.uid() = customer_id AND deleted_at IS NULL);
```

Adapte as policies às regras descritas em `DOCUMENTACAO_BACKEND.md`.

---
## Planos e Limitações
```sql
-- Schema para gestão de planos
CREATE SCHEMA IF NOT EXISTS billing;

-- Tabela de planos disponíveis
CREATE TABLE billing.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'starter', 'growth', etc
  display_name TEXT NOT NULL, -- 'Plano Starter'
  description TEXT,
  
  -- Limites do plano
  max_products INTEGER NOT NULL DEFAULT 50,
  max_orders_monthly INTEGER NOT NULL DEFAULT 100,
  max_storage_mb INTEGER NOT NULL DEFAULT 1024, -- 1GB
  max_stores INTEGER NOT NULL DEFAULT 1,
  
  -- Preços
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Configurações
  trial_days INTEGER NOT NULL DEFAULT 45,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  features JSONB NOT NULL DEFAULT '[]', -- Lista de features em JSON
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de assinaturas das lojas
CREATE TABLE billing.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES billing.plans(id),
  
  -- Status da assinatura
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  
  -- Períodos
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_end TIMESTAMPTZ NOT NULL,
  
  -- Dados do pagamento (para futuro)
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de uso mensal por loja
CREATE TABLE billing.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- YYYY-MM-01
  year INTEGER NOT NULL,
  
  -- Contadores
  orders_count INTEGER NOT NULL DEFAULT 0,
  products_count INTEGER NOT NULL DEFAULT 0,
  storage_used_mb INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(store_id, month)
);

```
## Permissoes
```sql
CREATE SCHEMA IF NOT EXISTS permissions;
-- Criar ENUMs no schema permissions também
CREATE TYPE permissions.merchant_role_enum AS ENUM ('admin', 'manager');
CREATE TYPE permissions.permission_action_enum AS ENUM ('create', 'read', 'update', 'delete', 'manage');

CREATE TABLE permissions.store_merchant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  role permissions.merchant_role_enum NOT NULL DEFAULT 'manager',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_store_merchant UNIQUE (store_id, merchant_id)
);

CREATE INDEX store_merchant_members_store_idx
  ON permissions.store_merchant_members (store_id)
  WHERE deleted_at IS NULL;

CREATE INDEX store_merchant_members_merchant_idx
  ON permissions.store_merchant_members (merchant_id)
  WHERE deleted_at IS NULL;


  -- Tabela de ações de permissão

CREATE TABLE permissions.permission_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action permissions.permission_action_enum NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- Tabela de perfis de permissão
CREATE TABLE permissions.permission_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de permissões por perfil
CREATE TABLE permissions.profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES permissions.permission_profiles(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES permissions.permission_actions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, action_id)
);

-- Dar permissão de uso do schema
GRANT USAGE ON SCHEMA permissions TO authenticated;
GRANT USAGE ON SCHEMA permissions TO anon;

-- Dar permissões nas tabelas
GRANT ALL ON permissions.store_merchant_members TO authenticated;
GRANT SELECT ON permissions.store_merchant_members TO anon;

GRANT ALL ON permissions.permission_actions TO authenticated;
GRANT ALL ON permissions.permission_profiles TO authenticated;
GRANT ALL ON permissions.profile_permissions TO authenticated;

ALTER TABLE stores ADD COLUMN legal_responsible_name TEXT;
ALTER TABLE stores ADD COLUMN legal_responsible_document TEXT;
ALTER TABLE stores ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Registro de aceite de termos pelo time do lojista
CREATE TABLE permissions.merchant_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL,   -- Ex.: 'terms_of_service', 'privacy_policy'
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

```

---

## Proteções Legais (Opcional, recomendado)

```sql
-- Campos adicionais na loja para compliance
ALTER TABLE stores ADD COLUMN legal_responsible_name TEXT;
ALTER TABLE stores ADD COLUMN legal_responsible_document TEXT;
ALTER TABLE stores ADD COLUMN terms_accepted_at TIMESTAMPTZ;

-- Registro de aceite de termos pelo time do lojista
CREATE TABLE permissions.merchant_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  agreement_type TEXT NOT NULL,   -- Ex.: 'terms_of_service', 'privacy_policy'
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);
```

---

## ✅ Checklist Final

- [ x] Executar `CREATE TYPE` antes das tabelas que os utilizam.
- [ x] Criar tabelas na ordem apresentada.
- [ x] Popular `store_delivery_options`, `store_addresses` e `store_working_hours` ao cadastrar loja.
- [ ] Configurar RLS e policies no Supabase após criar as tabelas.
- [ ] Atualizar seeds com categorias padrão e exemplos de fulfillment.
- [ ] Implementar triggers/cron para propagar `deleted_at` para tabelas relacionadas e manter a tabela `product_extra_list_applicability` sincronizada (ex.: remover vínculos órfãos).

---

**Última atualização**: 2025-11-07

