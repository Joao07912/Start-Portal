# 🚀 Configuração do GitHub Storage (100% Gratuito)

## 📋 Passo a Passo:

### 1. **Criar Repositório no GitHub**
- Acesse [github.com](https://github.com)
- Clique em **"New repository"**
- Nome: `portal-files` (ou qualquer nome)
- Marque como **"Private"** (recomendado)
- Clique em **"Create repository"**

### 2. **Gerar Token de Acesso**
- No GitHub, vá em **Settings** (canto superior direito)
- Clique em **"Developer settings"** (menu esquerdo, final)
- Clique em **"Personal access tokens"** → **"Tokens (classic)"**
- Clique em **"Generate new token"** → **"Generate new token (classic)"**
- **Nome**: `Portal Files Token`
- **Expiração**: `No expiration` (sem expiração)
- **Permissões**: Marque apenas `repo` (acesso completo aos repositórios)
- Clique em **"Generate token"**
- **⚠️ COPIE O TOKEN** (só aparece uma vez!)

### 3. **Configurar o Sistema**
Abra o arquivo `github-storage.js` e substitua:

```javascript
const GITHUB_CONFIG = {
    owner: 'SEU_USUARIO_GITHUB',        // Ex: 'joaosilva'
    repo: 'portal-files',               // Nome do repositório criado
    token: 'SEU_TOKEN_GITHUB',          // Token copiado no passo 2
    branch: 'main'
};
```

**Exemplo:**
```javascript
const GITHUB_CONFIG = {
    owner: 'joaosilva',
    repo: 'portal-files',
    token: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz',
    branch: 'main'
};
```

## ✅ Pronto!

Agora você pode:
- **📤 Upload**: Arquivos até 50MB
- **📥 Download**: Download real dos arquivos
- **🗑️ Delete**: Remove do GitHub automaticamente
- **💰 Gratuito**: 1GB de storage grátis

## 🔒 Segurança

- Repositório **privado** = arquivos protegidos
- Token com **permissões mínimas**
- Arquivos acessíveis apenas via sua aplicação

## 📊 Limites Gratuitos

- **Storage**: 1GB grátis
- **Bandwidth**: 100GB/mês grátis
- **Arquivos**: Ilimitados
- **Tamanho por arquivo**: 100MB (configurado para 50MB)

## ❓ Problemas?

1. **Erro 401**: Token inválido ou expirado
2. **Erro 404**: Repositório não encontrado
3. **Erro 403**: Sem permissões suficientes

**Solução**: Verifique se o `owner`, `repo` e `token` estão corretos!