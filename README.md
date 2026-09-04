# Seekerh Signal

Triagem assistida por evidências para transformar uma vaga em uma rubrica auditável e mostrar, com fonte, o que cada pessoa já entregou.

> Status: MVP demonstrativo. O sistema apoia a análise e nunca decide uma contratação sozinho.

## Problema validado

A Seekerh é uma consultoria de recrutamento fundada em 2019, com equipe enxuta e experiência em vagas de tecnologia. Sua comunicação pública enfatiza contratação por competências, capacidade de entrega, agilidade e avaliação humana. A operação pública de vagas usa a Quickin e inclui posições técnicas.

O contato direto que originou este MVP trouxe outro sinal concreto: para uma vaga sênior de IA, o recrutador precisou interpretar manualmente projetos, arquitetura, agentes, evals e tracing para inferir aderência. A hipótese de produto é que essa investigação consome tempo, varia entre avaliadores e perde evidências verificáveis em perfis executivos ou técnicos.

Isto valida um sinal de problema, não product-market fit. O piloto shadow existe para medir valor e risco antes de qualquer uso operacional.

## Proposta

O Seekerh Signal converte cada processo em um fluxo verificável:

1. A vaga vira uma rubrica aprovada pelo recrutador, separada em `must-have` e `nice-to-have`.
2. A pessoa candidata autoriza e informa Git, portfólio ou site que deseja usar como prova.
3. Cada requisito recebe uma matriz `skill -> evidência -> URL -> data -> confiança -> lacuna`.
4. As recomendações mostram fonte e incerteza, sem inventar experiência ausente.
5. Um recrutador revisa, corrige e toma a decisão final.

Não possuir Git ou site nunca reduz a nota. O processo deve oferecer uma rota equivalente, como work sample estruturado, case anterior autorizado ou entrevista técnica objetiva.

## O que esta versão entrega

- Rubrica executiva com cinco resultados ponderados.
- Avaliação determinística de evidências por sinais e força da prova.
- Recomendação, cobertura e lacunas explicáveis.
- Interface web demonstrativa e resposta JSON auditável.
- Health check para operação em container e Railway.

O cenário desta versão é intencionalmente estático. Ainda não há ingestão de vagas, busca externa, integração com ATS, persistência de dados ou chamada a LLM. Data de captura e confiança por afirmação pertencem ao contrato do piloto descrito em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Rotas

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/` | Demonstração visual |
| `GET` | `/api/demo` | Avaliação estruturada do cenário demonstrativo |
| `GET` | `/health` | Prontidão do serviço |

## Execução local

Requisito: Node.js 22 ou superior.

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000`.

Verificação completa:

```bash
npm test
```

## Container

```bash
docker build -t seekerh-signal .
docker run --rm -p 3000:3000 -e PORT=3000 seekerh-signal
```

Valide em `http://localhost:3000/health`.

## Railway

O `railway.json` seleciona o Dockerfile, verifica `/health` e reinicia apenas em falha.

```bash
railway up --detach -m "Deploy Seekerh Signal MVP"
railway deployment list --json
```

Um deploy só está concluído quando o estado mais recente é `SUCCESS` e `/health` responde `200`.

## Piloto shadow, 4 a 6 semanas

Escopo: 3 vagas e 30 a 50 candidaturas por vaga, total de 90 a 150 análises. O Signal roda em paralelo ao processo atual. Seus resultados ficam ocultos do recrutador até o registro da triagem manual, evitando viés de ancoragem. Nenhuma pessoa é rejeitada, reordenada ou contatada automaticamente.

Metas de saída:

- Reduzir em pelo menos 30% o tempo mediano de triagem.
- Manter 100% das afirmações de aderência vinculadas a uma fonte.
- Obter `quality@5` não inferior à linha de base manual.
- Obter kappa de Cohen maior ou igual a 0,60 entre recomendação binária do Signal e avaliação humana independente.
- Registrar 100% das revisões e divergências usadas na decisão de continuidade.

`quality@5` é a proporção dos cinco perfis priorizados que um avaliador independente considera qualificados segundo a rubrica aprovada. O piloto só avança se eficiência crescer sem perda de qualidade ou equidade.

## Limites éticos e LGPD

- Coletar fontes externas somente com opt-in específico e registrável.
- Tratar o mínimo de dados necessário para a vaga e por prazo definido.
- Ocultar nome, foto e localização durante a análise de capacidade.
- Não inferir saúde, raça, religião, orientação sexual, opinião política, personalidade ou outros atributos protegidos.
- Não raspar redes sociais nem usar conteúdo fora da finalidade informada.
- Não penalizar ausência de presença pública e oferecer work sample equivalente.
- Exibir critérios, fontes, confiança e lacunas para revisão e contestação.
- Manter revisão humana real em todas as decisões com efeito sobre a candidatura.
- Definir controlador, operador, hipótese legal, retenção, descarte e atendimento aos direitos antes do piloto.
- Elaborar RIPD antes de tratar dados no piloto e revisar o documento quando o fluxo mudar.

Este repositório é uma demonstração técnica, não um parecer jurídico.

## Fontes do contexto

- [Site oficial da Seekerh](https://seekerh.com.br/), consultoria, serviços e proposta de valor.
- [Seekerh no LinkedIn](https://www.linkedin.com/company/seekerh/), fundação, porte e posicionamento público.
- [Portal público de vagas da Seekerh](https://jobs.quickin.io/seekerh), operação de vagas e critérios divulgados.
- [LGPD, Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), princípios e direitos.
- [Orientação da ANPD sobre RIPD](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/relatorio-de-impacto-a-protecao-de-dados-pessoais-ripd), avaliação de risco e salvaguardas.
- [Direitos dos titulares segundo a ANPD](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares), explicação e revisão de decisões automatizadas.

Fontes consultadas em 4 de setembro de 2026.
