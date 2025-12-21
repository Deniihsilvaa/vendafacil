# ⚙️ Configuração do Git - Line Endings

## 📋 Problema

Ao trabalhar em equipe com diferentes sistemas operacionais (Windows, Linux, macOS), podem ocorrer problemas com line endings:

- **Windows**: Usa CRLF (`\r\n`)
- **Linux/macOS**: Usa LF (`\n`)

Isso pode causar:
- Avisos do Git sobre conversão de line endings
- Diferenças desnecessárias nos commits
- Problemas em scripts e arquivos de configuração

## ✅ Solução Implementada

### 1. Arquivo `.gitattributes`

Criado arquivo `.gitattributes` na raiz do projeto para padronizar line endings:

```gitattributes
# Arquivos de texto devem usar LF (Unix)
* text=auto eol=lf

# Arquivos específicos que devem manter CRLF (Windows)
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf

# Arquivos binários não devem ter conversão
*.png binary
*.jpg binary
# ... outros arquivos binários
```

### 2. Configuração do Git

```bash
# Desabilitar conversão automática (o .gitattributes cuida disso)
git config core.autocrlf false
```

## 🔧 Como Aplicar

### Normalizar Arquivos Existentes

Se você já tem arquivos no repositório com line endings incorretos:

```bash
# 1. Adicionar .gitattributes
git add .gitattributes

# 2. Normalizar todos os arquivos
git add --renormalize .

# 3. Verificar mudanças
git status

# 4. Commit (se necessário)
git commit -m "chore: padronizar line endings para LF"
```

## 📝 Regras do Projeto

### ✅ Usar LF (Unix)
- Todos os arquivos de código fonte (`.ts`, `.tsx`, `.js`, `.jsx`)
- Arquivos de configuração (`.json`, `.yml`, `.yaml`, `.toml`)
- Arquivos de documentação (`.md`, `.txt`)
- Arquivos de estilo (`.css`, `.scss`)

### ✅ Usar CRLF (Windows)
- Scripts do Windows (`.bat`, `.cmd`, `.ps1`)

### ✅ Binários (sem conversão)
- Imagens (`.png`, `.jpg`, `.svg`, etc.)
- Fontes (`.woff`, `.ttf`, etc.)
- Arquivos compactados (`.zip`, `.tar.gz`)

## 🚨 Avisos Comuns

### Aviso: "LF will be replaced by CRLF"

**Causa:** Git detectou que um arquivo tem LF mas será convertido para CRLF.

**Solução:** 
1. Verificar se `.gitattributes` está configurado corretamente
2. Executar `git add --renormalize .` para normalizar
3. Se persistir, verificar `git config core.autocrlf` (deve ser `false`)

### Aviso: "CRLF will be replaced by LF"

**Causa:** Git detectou que um arquivo tem CRLF mas será convertido para LF.

**Solução:** 
1. Isso é esperado e correto (projeto usa LF)
2. Executar `git add --renormalize .` para normalizar

## 🔍 Verificar Configuração

```bash
# Verificar configuração atual
git config core.autocrlf

# Verificar line endings de um arquivo específico
file src/App.tsx  # Linux/macOS
# ou
Get-Content src/App.tsx -Raw | Select-String -Pattern "`r`n"  # Windows PowerShell
```

## 📚 Referências

- [Git Attributes Documentation](https://git-scm.com/docs/gitattributes)
- [Dealing with line endings](https://docs.github.com/en/get-started/getting-started-with-git/configuring-git-to-handle-line-endings)

---

## 📅 Histórico

- **2024-12-21**: Criado `.gitattributes` e documentação para padronizar line endings

