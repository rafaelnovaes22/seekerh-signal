export type ProofKind = "live_product" | "repository" | "documented_delivery";

export type MatchStatus = "strong" | "partial" | "missing";

export interface EvidenceItem {
  readonly title: string;
  readonly summary: string;
  readonly url: string;
  readonly tags: readonly string[];
  readonly proofKind: ProofKind;
}

export interface CandidateProfile {
  readonly name: string;
  readonly targetRole: string;
  readonly summary: string;
  readonly evidence: readonly EvidenceItem[];
}

export interface RoleRequirement {
  readonly id: string;
  readonly label: string;
  readonly outcome: string;
  readonly weight: number;
  readonly signals: readonly string[];
}

export interface RequirementMatch {
  readonly requirementId: string;
  readonly label: string;
  readonly outcome: string;
  readonly score: number;
  readonly status: MatchStatus;
  readonly evidence: readonly EvidenceItem[];
}

export interface TalentEvaluation {
  readonly candidateName: string;
  readonly targetRole: string;
  readonly overallScore: number;
  readonly evidenceCoverage: number;
  readonly recommendation: string;
  readonly matches: readonly RequirementMatch[];
  readonly risks: readonly string[];
}
