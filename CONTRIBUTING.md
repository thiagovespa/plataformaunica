# Contribuindo para a Plataforma Única

## Conventional Commits

Este projeto usa [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit padronizadas e geração automática de release notes.

### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Formatação, espaços em branco, etc (sem mudanças de código)
- **refactor**: Refatoração de código
- **perf**: Melhorias de performance
- **test**: Adição ou correção de testes
- **chore**: Tarefas de manutenção, build, dependências

### Escopos

- `auth` - Autenticação e autorização
- `matrix` - Funcionalidades da matriz RACI
- `export` - Exportação de dados
- `admin` - Painel administrativo
- `ui` - Componentes de interface
- `i18n` - Internacionalização e traduções
- `theme` - Temas e estilos
- `db` - Banco de dados
- `api` - APIs e rotas

### Exemplos

```bash
# Nova funcionalidade
feat(matrix): permitir múltiplas atribuições RACI por pessoa

# Correção de bug
fix(export): corrigir URL do branding para racim.us

# Documentação
docs: adicionar guia de conventional commits

# Refatoração
refactor(theme): simplificar contexto de tema

# Chore
chore: atualizar Next.js para 16.0.10
```

### Breaking Changes

Para mudanças que quebram compatibilidade, adicione `!` após o tipo/escopo ou `BREAKING CHANGE:` no rodapé:

```bash
feat(api)!: alterar estrutura de resposta da API

BREAKING CHANGE: A resposta da API agora retorna um objeto em vez de array
```

## Versionamento Automático

O projeto usa **versionamento automático** baseado em conventional commits. Você não precisa criar tags ou atualizar versões manualmente!

### Como funciona

1. Faça commits seguindo o padrão conventional commits
2. Faça push na branch `main`
3. O GitHub Actions automaticamente:
   - Analisa os commits desde a última release
   - Determina o tipo de bump de versão:
     - **MAJOR**: Breaking changes (`feat!:` ou `BREAKING CHANGE:`)
     - **MINOR**: Novas funcionalidades (`feat:`)
     - **PATCH**: Bug fixes e outros (`fix:`, `docs:`, etc)
   - Atualiza `package.json` com a nova versão
   - Gera e atualiza `CHANGELOG.md`
   - Cria tag e release no GitHub automaticamente

### Versionamento Semântico

- **MAJOR** (v1.0.0 → v2.0.0): Breaking changes
- **MINOR** (v1.0.0 → v1.1.0): Novas funcionalidades (backwards compatible)
- **PATCH** (v1.0.0 → v1.0.1): Bug fixes (backwards compatible)

### Exemplo de Fluxo

```bash
# Fazer mudanças no código
git add .

# Commit seguindo conventional commits
git commit -m "feat(matrix): adicionar filtro de busca na seleção"

# Push para main
git push origin main

# 🎉 Versão v1.1.0 será criada automaticamente!
```

## Release Notes

As release notes são geradas automaticamente e incluem:
- Categorização por tipo de commit (Features, Bug Fixes, etc)
- Links para commits
- Comparação com a versão anterior
- Atualização automática do CHANGELOG.md
