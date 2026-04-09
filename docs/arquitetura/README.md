---
Proveniência e Autoria: Sumário de arquitetura (licença MIT-0).
---

# Arquitetura do Prometheus (resumo)

Este diretório descreve aspectos arquiteturais relevantes do projeto e aponta para documentos especializados.

## Visão Geral

O Prometheus foi projetado como uma CLI modular com componentes bem delimitados:

- `src/cli`: bootstrap e definição de comandos
- `src/analistas`: analistas e detectores (pluggable)
- `src/core`: parsing, execução e registry
- `src/guardian`: verificação de integridade e baseline
- `src/relatorios`: geração e exportação de relatórios

## Documentos da seção

- [Segurança](SEGURANCA.md)
- [Type Safety](TYPE-SAFETY.md)
- [Mensagens / Logs](MENSAGENS-LOGS.md)
- [Sistema de Erros](SISTEMA-ERROS.md)

## Observações de design

- Modularidade por analistas facilita ativação seletiva (`fastMode`).
- Configuração centralizada em `prometheus.config.json` com precedência por flags CLI.
- Balanceamento de precisão x performance via `fastMode` e limites de timeout por analista.

Para detalhes específicos, consulte os arquivos listados acima.
