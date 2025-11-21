# 🥗 StoreFlow - Sistema Multi-Tenant de Delivery

Sistema de delivery white-label inspirado no iFood/Anota Aí, desenvolvido com React + TypeScript + Vite.

## 🚀 **Status do Projeto**

### ✅ **Implementado**
- ✅ Estrutura completa de pastas
- ✅ Configuração Vite + TypeScript + absolute imports
- ✅ Sistema de tipos TypeScript completo
- ✅ Componentes UI puros (Button, Input, Card, Modal)
- ✅ Contexts (Store, Theme, Auth, Cart)
- ✅ **StoreFront** - Página inicial pública com produtos
- ✅ Sistema de branding dinâmico
- ✅ Componentes de negócio (ProductCard, ProductList)
- ✅ Layout público responsivo
- ✅ Sistema de carrinho com persistência
- ✅ Dados mockados para demonstração

### 🔄 **Próximos Passos**
- [ ] Página de personalização de produtos
- [ ] Sistema de autenticação (cliente/lojista)
- [ ] Dashboard do lojista (CRUD produtos)
- [ ] Área do cliente (pedidos, perfil)
- [ ] Sistema de checkout e pagamento

## 🏗️ **Arquitetura**

### **Multi-Tenant Ready**
```
- Suporte a múltiplas lojas
- Branding dinâmico (cores, logo, nome)
- Contextos separados por loja
```

### **Autenticação Separada**
```
- Cliente: Login por telefone
- Lojista: Login por email/senha
```

### **Componentização**
```
src/components/
├── ui/           # Componentes puros
├── business/     # Lógica de negócio  
├── layout/       # Layouts
└── shared/       # Compartilhados
```

## 🛠️ **Tecnologias**

- **React 18** + TypeScript
- **Vite** (build tool)
- **TailwindCSS** (styling)
- **React Router** (navegação)
- **Zustand** (gerenciamento de estado)
- **Lucide React** (ícones)

## 🚀 **Como Executar**

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📱 **StoreFront - Página Principal**

A **StoreFront** é a página inicial pública onde os clientes:

- ✅ Navegam pelos produtos sem login
- ✅ Filtram por categoria
- ✅ Buscam produtos por nome
- ✅ Visualizam informações nutricionais
- ✅ Adicionam produtos ao carrinho
- ✅ Veem o branding dinâmico da loja

### **Recursos Implementados**
- 🎨 Theming dinâmico baseado na loja
- 🛒 Carrinho flutuante com persistência
- 📱 Layout responsivo
- 🔍 Sistema de busca e filtros
- ⚡ Loading states
- 💚 Design moderno e acessível

## 🎯 **Sistema Multi-Tenant**

Cada loja pode ter:
- Nome personalizado
- Cores primária/secundária
- Logo própria
- Configurações específicas (tempo entrega, valor mínimo)

## 🔄 **Estado Global**

- **StoreContext**: Loja atual, configurações
- **ThemeContext**: Cores dinâmicas, branding
- **AuthContext**: Usuário logado (cliente/lojista)
- **CartContext**: Carrinho com persistência

## 📦 **Dados de Exemplo**

O projeto inclui dados mockados para demonstração:
- Loja "Poke do Chef" 
- Produtos variados (pokes, temakis, sobremesas, bebidas)
- Sistema de customização (bases, proteínas, toppings)

---

**Desenvolvido com ❤️ usando o sistema StoreFlow**