# 🔒 Segurança - Variáveis de Ambiente

## Variáveis Públicas do Supabase

As seguintes variáveis são **projetadas para serem públicas** e podem ser expostas no código do frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Por que são seguras?

1. **Chave ANON é pública por design**: A chave `anon` do Supabase é projetada para ser usada em aplicações client-side
2. **Proteção via RLS**: O Supabase usa Row Level Security (RLS) para proteger os dados no banco
3. **Não são secrets sensíveis**: Essas chaves não dão acesso a operações administrativas ou dados sensíveis
4. **Documentação oficial**: O próprio Supabase recomenda usar essas chaves no frontend

### Referências

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Configuração de Scanners de Secrets

Se você estiver usando scanners de secrets (como GitHub Secret Scanning, GitGuardian, etc.), você pode:

1. **Adicionar exceções** para essas variáveis específicas
2. **Marcar como falsos positivos** no seu scanner
3. **Usar padrões de allowlist** se o scanner suportar

### Exemplo de configuração para GitHub Secret Scanning

Adicione ao seu `.github/secret-scanning.yml` (se existir):

```yaml
paths-ignore:
  - 'src/lib/supabase/realtime-client.ts'
```

Ou configure o scanner para ignorar padrões que começam com `VITE_SUPABASE_ANON_KEY` e `VITE_SUPABASE_URL`.

