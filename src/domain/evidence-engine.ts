import type {
  CandidateProfile,
  EvidenceItem,
  MatchStatus,
  RoleRequirement,
  TalentEvaluation,
} from "./types.js";

const PROOF_MULTIPLIER = {
  live_product: 1,
  repository: 0.9,
  documented_delivery: 0.72,
} as const;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchingSignals(item: EvidenceItem, signals: readonly string[]): number {
  const searchable = normalize(`${item.title} ${item.summary} ${item.tags.join(" ")}`);
  return signals.filter((signal) => searchable.includes(normalize(signal))).length;
}

function scoreEvidence(item: EvidenceItem, signals: readonly string[]): number {
  const overlap = matchingSignals(item, signals);
  if (overlap === 0) return 0;
  const signalCoverage = Math.min(overlap / Math.max(signals.length, 1), 1);
  return Math.round(signalCoverage * PROOF_MULTIPLIER[item.proofKind] * 100);
}

function statusFor(score: number): MatchStatus {
  if (score >= 70) return "strong";
  if (score >= 35) return "partial";
  return "missing";
}

function matchRequirement(
  profile: CandidateProfile,
  requirement: RoleRequirement,
): TalentEvaluation["matches"][number] {
  const ranked = profile.evidence
    .map((item) => ({ item, score: scoreEvidence(item, requirement.signals) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score);
  const bestScore = ranked[0]?.score ?? 0;

  return {
    requirementId: requirement.id,
    label: requirement.label,
    outcome: requirement.outcome,
    score: bestScore,
    status: statusFor(bestScore),
    evidence: ranked.slice(0, 2).map(({ item }) => item),
  };
}

function weightedScore(matches: TalentEvaluation["matches"], requirements: readonly RoleRequirement[]): number {
  const totalWeight = requirements.reduce((sum, requirement) => sum + requirement.weight, 0);
  if (totalWeight === 0) return 0;

  const total = matches.reduce((sum, match) => {
    const weight = requirements.find(({ id }) => id === match.requirementId)?.weight ?? 0;
    return sum + match.score * weight;
  }, 0);
  return Math.round(total / totalWeight);
}

function recommendationFor(score: number, coverage: number): string {
  if (score >= 75 && coverage >= 80) return "Revisar evidências em alinhamento executivo";
  if (score >= 55) return "Validar lacunas com prova de trabalho";
  return "Reunir novas evidências para revisão humana";
}

function validateRequirements(requirements: readonly RoleRequirement[]): void {
  const identifiers = new Set<string>();
  for (const requirement of requirements) {
    if (!requirement.id.trim() || identifiers.has(requirement.id)) {
      throw new Error(`Identificador inválido: recebido ${requirement.id}, esperado id único e não vazio`);
    }
    if (!Number.isFinite(requirement.weight) || requirement.weight <= 0) {
      throw new Error(`Peso inválido: recebido ${requirement.weight}, esperado número positivo e finito`);
    }
    if (!requirement.signals.length || requirement.signals.some((signal) => !signal.trim())) {
      throw new Error(`Sinais inválidos para ${requirement.id}: esperado ao menos um termo não vazio`);
    }
    identifiers.add(requirement.id);
  }
}

function findRisks(matches: TalentEvaluation["matches"]): readonly string[] {
  const missing = matches.filter(({ status }) => status === "missing");
  if (missing.length === 0) return ["Nenhuma lacuna crítica identificada nas evidências públicas."];
  return missing.map(({ label }) => `Evidência insuficiente para ${label.toLowerCase()}.`);
}

export function evaluateTalent(
  profile: CandidateProfile,
  requirements: readonly RoleRequirement[],
): TalentEvaluation {
  validateRequirements(requirements);
  const matches = requirements.map((requirement) => matchRequirement(profile, requirement));
  const overallScore = weightedScore(matches, requirements);
  const proven = matches.filter(({ status }) => status !== "missing").length;
  const evidenceCoverage = Math.round((proven / Math.max(matches.length, 1)) * 100);

  return {
    candidateName: profile.name,
    targetRole: profile.targetRole,
    overallScore,
    evidenceCoverage,
    recommendation: recommendationFor(overallScore, evidenceCoverage),
    matches,
    risks: findRisks(matches),
  };
}
