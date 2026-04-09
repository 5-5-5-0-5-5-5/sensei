---
Proveniência e Autoria: Checklist de issues (licença MIT-0).
---

# Checklist para Issues

> Use este checklist antes de abrir uma issue. Ele ajuda os mantenedores a reproduzir, priorizar e resolver problemas mais rápido.

## Antes de abrir

- [ ] Procure por issues existentes relacionadas
- [ ] Atualize para a versão mais recente do repositório e confirme o problema
- [ ] Verifique se o problema ocorre com `npm run build` e `npm test`
- [ ] Coletre o mínimo comando/fluxo que reproduz o problema
- [ ] Forneça saídas relevantes (`--json`, `--verbose`, logs), anexando arquivos quando necessário
- [ ] Informe: versão (`package.json`), Node.js (`node -v`) e SO
- [ ] Indique se é bloqueante, regressão ou comportamento esperado

## Informações essenciais (modelo curto)

- **Título**: resumo curto e descritivo
- **Tipo**: bug / feature / docs / chore
- **Versão**: `0.4.2` (ex.: package.json)
- **Ambiente**: Node.js X, SO, versão do Prometheus
- **Comando reproduzível**:

```bash
prometheus diagnosticar --full --include "src/**"
```

- **Comportamento esperado**: descreva o que deveria acontecer
- **Comportamento observado**: descreva o que ocorreu
- **Logs / saída**: cole a saída relevante ou anexe arquivo
- **Passos para reproduzir**: 1) 2) 3)

## Modelos (copie e cole)

### Bug report

```
**Título**: [bug] resumo curto
**Versão**: 0.4.2
**Ambiente**: Node 24.x, Linux

**Descrição**:
Breve descrição do problema.

**Como reproduzir**:
1. git clone ...
2. npm install
3. npm run build
4. comando que falha

**Comportamento esperado**:
O que deveria acontecer.

**Comportamento observado**:
Saída e erros observados.

**Logs / Attachments**:
Cole logs ou anexos.

**Prioridade**: high|medium|low
```

### Feature request

```
**Título**: [feat] adicionar X para Y
**Descrição**:
Motivação e caso de uso.

**Proposta**:
Como imagina a solução (opcional: PR sugerido).

**Compatibilidade / Breaking changes**:
Sim/Não e justificativa.

**Prioridade**: high|medium|low
```

## Notas finais

- Use labels apropriadas (bug|enhancement|docs) ao abrir a issue.
- Se possível, abra um PR com um teste que reproduza o problema ou demonstra a correção.
