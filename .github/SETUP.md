# Configuração de Versionamento Automático

Este guia explica como configurar o versionamento automático para a Plataforma Única.

## 📋 Pré-requisitos

O workflow de versionamento automático já está configurado em `.github/workflows/auto-release.yml`. Para que funcione corretamente, você precisa configurar as permissões do GitHub Actions.

## 🚀 Como Funciona

### Fluxo Automático

Quando você faz push na branch `main` com commits convencionais:

1. O GitHub Actions detecta os commits
2. Analisa o tipo de mudança:
   - `feat:` ou `feature:` → **MINOR** bump (ex: 1.0.0 → 1.1.0)
   - `fix:` ou `bugfix:` → **PATCH** bump (ex: 1.0.0 → 1.0.1)
   - `BREAKING CHANGE:` ou `type!:` → **MAJOR** bump (ex: 1.0.0 → 2.0.0)
3. Atualiza automaticamente:
   - `package.json` com a nova versão
   - `CHANGELOG.md` com as mudanças categorizadas
4. Cria um commit de release
5. Cria e publica a tag
6. Gera a release no GitHub

### Formato de Commits

Use commits convencionais para que o sistema funcione corretamente:

```bash
# Feature (minor bump)
git commit -m "feat(matrix): adiciona seleção múltipla de RACI"

# Bug fix (patch bump)
git commit -m "fix(export): corrige tradução em português"

# Breaking change (major bump)
git commit -m "feat(api)!: altera estrutura da API de matrizes"
# ou
git commit -m "feat(api): altera estrutura da API

BREAKING CHANGE: A estrutura de dados mudou completamente"

# Chore (patch bump)
git commit -m "chore: atualiza dependências"
```

### Tipos de Commit Disponíveis

- `feat` / `feature`: Nova funcionalidade
- `fix` / `bugfix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação e estilo
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Testes
- `chore`: Tarefas de manutenção
- `ci`: Integração contínua
- `build`: Sistema de build

### Escopos Sugeridos

- `matrix`: Matriz RACI
- `export`: Exportação
- `dashboard`: Dashboard
- `admin`: Painel admin
- `i18n`: Internacionalização
- `ui`: Interface do usuário
- `api`: API e integrações
- `db`: Banco de dados

## 🔍 Verificando o Funcionamento

### Ver Logs do Workflow

1. Vá para a aba **Actions**
2. Clique no workflow "Auto Release"
3. Clique no último run para ver os logs detalhados

---

**Problema:** Workflow não executa

**Solução:** 
- Verifique se o workflow está na branch `main`
- Certifique-se de que está fazendo push na branch `main`
- Verifique se Actions está habilitado no repositório

---

**Problema:** Não cria tag

**Solução:**
- Verifique se há commits novos desde a última tag
- Certifique-se de que os commits seguem o formato convencional
- Veja os logs do workflow para identificar erros específicos

## 📦 Primeira Release

Se este é seu primeiro release, o workflow criará a versão `v0.0.1` automaticamente no próximo push para `main`.

Para começar com uma versão específica (ex: v1.0.0), crie manualmente a primeira tag:

```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

A partir daí, todas as releases serão automáticas!

## 📝 Exemplo Completo

```bash
# Fazer mudanças no código
git add .

# Commit seguindo conventional commits
git commit -m "feat(matrix): adiciona suporte a múltiplas atribuições RACI"

# Push para main
git push origin main

# ✨ O GitHub Actions automaticamente:
# - Analisa os commits
# - Determina que é uma feature (minor bump)
# - Atualiza package.json e CHANGELOG.md
# - Cria tag (ex: v1.1.0)
# - Publica release no GitHub
```

## 🎯 Verificar Release

Após o push, aguarde alguns minutos e:

1. Vá para **Actions** e veja o workflow executando
2. Vá para **Releases** e veja a nova release publicada
3. Veja o `CHANGELOG.md` atualizado no repositório

## 📞 Suporte

Se encontrar problemas, verifique:
- Logs do workflow em Actions
- Permissões do repositório em Settings → Actions
- Formato dos commits em CONTRIBUTING.md
