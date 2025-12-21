# Instalação do Sonner (Toast Notifications)

O sistema de tratamento de erros foi implementado usando **Sonner** (Toast-Sonner do shadcn/ui).

## 📦 Instalação

Execute o seguinte comando para instalar o pacote:

```bash
npm install sonner
```

## ✅ Verificação

Após a instalação, verifique se tudo está funcionando:

```bash
npm run build
```

Não deve haver erros relacionados ao `sonner`.

## 🎯 Uso

O sistema de toast já está configurado e pronto para uso:

### Em componentes:
```typescript
import { showErrorToast, showSuccessToast } from '@/utils/toast';

// Mostrar erro
showErrorToast(error, 'Título do erro');

// Mostrar sucesso
showSuccessToast('Operação realizada com sucesso!');
```

### Em services (já implementado):
Os services (`AuthService`, `StoreService`) já estão configurados para exibir toasts automaticamente quando ocorrem erros.

## 📝 Notas

- O componente `Toaster` já foi adicionado ao `App.tsx`
- Os utilitários de toast estão em `src/utils/toast.ts`
- As mensagens amigáveis estão configuradas para diferentes tipos de erro (NETWORK_ERROR, TIMEOUT, etc.)
