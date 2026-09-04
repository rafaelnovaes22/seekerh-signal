import type { CandidateProfile, RoleRequirement } from "./types.js";

export const executiveRequirements: readonly RoleRequirement[] = [
  {
    id: "strategy",
    label: "Estratégia e viabilidade",
    outcome: "Converter problemas de negócio em produtos de IA economicamente viáveis",
    weight: 3,
    signals: ["outcomes", "unit economics", "estratégia"],
  },
  {
    id: "architecture",
    label: "Arquitetura de produção",
    outcome: "Projetar sistemas híbridos, resilientes e portáveis",
    weight: 3,
    signals: ["produção", "langgraph", "rag", "multi-llm"],
  },
  {
    id: "governance",
    label: "Governança e risco",
    outcome: "Operar agentes com qualidade, rastreabilidade e autonomia progressiva",
    weight: 3,
    signals: ["governança", "auditoria", "evals", "telemetria"],
  },
  {
    id: "product",
    label: "Produto e receita",
    outcome: "Levar soluções ao usuário e medir impacto comercial",
    weight: 2,
    signals: ["produto", "receita", "conversão", "saas"],
  },
  {
    id: "operating-model",
    label: "Modelo operacional",
    outcome: "Coordenar agentes, pessoas e decisões em escala",
    weight: 2,
    signals: ["multiagente", "guildas", "autonomia", "organização"],
  },
];

export const rafaelProfile: CandidateProfile = {
  name: "Rafael Novaes",
  targetRole: "CAIO ou sócio operador",
  summary: "Constrói produtos de IA do diagnóstico à produção com governança e unit economics.",
  evidence: [
    {
      title: "Agent Governance Framework",
      summary: "Framework de estratégia com outcomes, unit economics, governança, auditoria, evals e telemetria.",
      url: "https://github.com/rafaelnovaes22/agent-governance-framework",
      tags: ["estratégia", "outcomes", "unit economics", "governança", "auditoria", "evals", "telemetria"],
      proofKind: "repository",
    },
    {
      title: "AI CFO Platform",
      summary: "SaaS financeiro auditável com LangGraph, filas, gates de qualidade e arquitetura de produção.",
      url: "https://github.com/rafaelnovaes22/ai-cfo-platform",
      tags: ["saas", "produto", "langgraph", "produção", "auditoria", "evals"],
      proofKind: "repository",
    },
    {
      title: "Multi-Agent Company OS",
      summary: "Produto ao vivo com organização multiagente, 169 agentes, 14 guildas e autonomia governada.",
      url: "https://multi-agent-company-os-production.up.railway.app/",
      tags: ["produto", "produção", "multiagente", "guildas", "autonomia", "organização"],
      proofKind: "live_product",
    },
    {
      title: "CarInsight",
      summary: "Produto comercial ao vivo com RAG híbrido, roteamento multi-LLM, guardrails e conversão.",
      url: "https://frontend-production-74e7.up.railway.app/",
      tags: ["produto", "produção", "rag", "multi-llm", "conversão", "receita"],
      proofKind: "live_product",
    },
    {
      title: "Marketing AI Agents",
      summary: "Operação com sete agentes especializados, LangGraph, tracing e promoção baseada em evals.",
      url: "https://github.com/rafaelnovaes22/marketing-ai-agents",
      tags: ["multiagente", "langgraph", "evals", "telemetria"],
      proofKind: "repository",
    },
  ],
};
