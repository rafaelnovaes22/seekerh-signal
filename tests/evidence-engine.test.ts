import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { evaluateTalent } from "../src/domain/evidence-engine.js";
import type { CandidateProfile, RoleRequirement } from "../src/domain/types.js";

const requirements: readonly RoleRequirement[] = [
  {
    id: "governance",
    label: "Governança de IA",
    outcome: "Operar agentes com controle e auditoria",
    weight: 3,
    signals: ["governança", "auditoria", "evals"],
  },
  {
    id: "production",
    label: "Produto em produção",
    outcome: "Transformar tese em produto utilizável",
    weight: 2,
    signals: ["produção", "produto", "railway"],
  },
];

describe("evaluateTalent", () => {
  it("recommends executive alignment when public evidence covers the role", () => {
    const profile: CandidateProfile = {
      name: "Rafael",
      targetRole: "CAIO",
      summary: "Construtor de produtos de IA",
      evidence: [
        {
          title: "Framework de governança",
          summary: "Governança, auditoria e evals para agentes",
          url: "https://example.com/governance",
          tags: ["governança", "auditoria", "evals"],
          proofKind: "repository",
        },
        {
          title: "Produto Railway",
          summary: "Produto de IA em produção no Railway",
          url: "https://example.com/product",
          tags: ["produto", "produção", "railway"],
          proofKind: "live_product",
        },
      ],
    };

    const result = evaluateTalent(profile, requirements);

    assert.equal(result.overallScore, 94);
    assert.equal(result.evidenceCoverage, 100);
    assert.equal(result.recommendation, "Avançar para alinhamento executivo");
  });

  it("surfaces missing proof instead of inventing experience", () => {
    const profile: CandidateProfile = {
      name: "Candidato",
      targetRole: "CAIO",
      summary: "Perfil sem evidências",
      evidence: [],
    };

    const result = evaluateTalent(profile, requirements);

    assert.equal(result.overallScore, 0);
    assert.equal(result.evidenceCoverage, 0);
    assert.equal(result.risks.length, 2);
  });
});
