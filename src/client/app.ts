import type { EvidenceItem, MatchStatus, RequirementMatch, TalentEvaluation } from "../domain/types.js";

const API_URL = "/api/demo";
const STATUS_LABELS: Readonly<Record<MatchStatus, string>> = {
  strong: "Sinal forte",
  partial: "Sinal parcial",
  missing: "Sinal insuficiente",
};

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Elemento obrigatório ausente: recebido ${id}, esperado um id presente no DOM`);
  return element as T;
}

function setText(id: string, value: string): void {
  requiredElement(id).textContent = value;
}

function setSystemStatus(mode: "ready" | "error", message: string): void {
  const status = requiredElement("api-status");
  status.classList.remove("is-ready", "is-error");
  status.classList.add(`is-${mode}`);
  const label = status.lastElementChild;
  if (label) label.textContent = message;
}

function createTextCell(label: string, value: string, className?: string): HTMLTableCellElement {
  const cell = document.createElement("td");
  cell.dataset.label = label;
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function createScoreCell(match: RequirementMatch): HTMLTableCellElement {
  const cell = createTextCell("Score", "");
  const score = document.createElement("span");
  score.className = `match-score status-${match.status}`;
  score.textContent = `${match.score} · ${STATUS_LABELS[match.status]}`;
  cell.append(score);
  return cell;
}

function proofLabel(item: EvidenceItem): string {
  if (item.proofKind === "live_product") return "Produto ao vivo";
  if (item.proofKind === "repository") return "Repositório público";
  return "Entrega documentada";
}

function createEvidenceLink(item: EvidenceItem): HTMLAnchorElement {
  const link = document.createElement("a");
  link.className = "evidence-link";
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noreferrer noopener";
  link.title = `${item.summary} (${proofLabel(item)})`;
  link.setAttribute("aria-label", `${item.title}, ${proofLabel(item)}, abre em nova aba`);
  link.append(document.createTextNode(item.title));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(arrow);
  return link;
}

function createEvidenceCell(items: readonly EvidenceItem[]): HTMLTableCellElement {
  const cell = createTextCell("Evidências", "");
  const stack = document.createElement("div");
  stack.className = "evidence-stack";
  if (items.length === 0) stack.textContent = "Nenhuma prova pública vinculada";
  items.forEach((item) => stack.append(createEvidenceLink(item)));
  cell.append(stack);
  return cell;
}

function createMatchRow(match: RequirementMatch): HTMLTableRowElement {
  const row = document.createElement("tr");
  row.append(
    createTextCell("Requisito", match.label),
    createTextCell("Resultado esperado", match.outcome),
    createScoreCell(match),
    createEvidenceCell(match.evidence),
  );
  return row;
}

function renderMatrix(matches: readonly RequirementMatch[]): void {
  const body = requiredElement<HTMLTableSectionElement>("evidence-matrix");
  body.replaceChildren(...matches.map(createMatchRow));
  requiredElement("matrix-wrap").setAttribute("aria-busy", "false");
}

function renderRisks(risks: readonly string[]): void {
  const list = requiredElement<HTMLUListElement>("risk-list");
  const items = risks.map((risk) => {
    const item = document.createElement("li");
    item.textContent = risk;
    return item;
  });
  list.replaceChildren(...items);
}

function distinctProofCount(matches: readonly RequirementMatch[]): number {
  const proofUrls = matches.flatMap(({ evidence }) => evidence.map(({ url }) => url));
  return new Set(proofUrls).size;
}

function renderEvaluation(result: TalentEvaluation): void {
  setText("overall-score", String(result.overallScore));
  setText("coverage-score", `${result.evidenceCoverage}%`);
  setText("candidate-role", `${result.candidateName} · ${result.targetRole}`);
  setText("requirement-count", String(result.matches.length));
  setText("proof-count", String(distinctProofCount(result.matches)));
  setText("recommendation", result.recommendation);
  setText("evaluation-summary", `${result.matches.length} critérios analisados para ${result.candidateName}.`);
  requiredElement("coverage-bar").style.width = `${result.evidenceCoverage}%`;
  renderMatrix(result.matches);
  renderRisks(result.risks);
  setSystemStatus("ready", "Exemplo carregado");
}

function renderError(error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  const cell = createTextCell("Estado", "Não foi possível atualizar a análise. A estrutura do piloto continua disponível.");
  cell.colSpan = 4;
  const body = requiredElement<HTMLTableSectionElement>("evidence-matrix");
  body.replaceChildren(Object.assign(document.createElement("tr"), { className: "error-row" }));
  body.firstElementChild?.append(cell);
  requiredElement("matrix-wrap").setAttribute("aria-busy", "false");
  setText("evaluation-summary", "API temporariamente indisponível. Tente novamente em instantes.");
  setSystemStatus("error", "API indisponível");
  console.error(JSON.stringify({ event: "demo.load_failed", detail }));
}

function isTalentEvaluation(value: unknown): value is TalentEvaluation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TalentEvaluation>;
  return (
    typeof candidate.candidateName === "string" &&
    typeof candidate.overallScore === "number" &&
    typeof candidate.evidenceCoverage === "number" &&
    typeof candidate.recommendation === "string" &&
    Array.isArray(candidate.matches) &&
    Array.isArray(candidate.risks)
  );
}

async function loadEvaluation(): Promise<void> {
  try {
    const response = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Resposta inválida da API: recebido HTTP ${response.status}, esperado HTTP 200`);
    const payload: unknown = await response.json();
    if (!isTalentEvaluation(payload)) throw new Error("Payload inválido: esperado TalentEvaluation completo");
    renderEvaluation(payload);
  } catch (error: unknown) {
    renderError(error);
  }
}

void loadEvaluation();
