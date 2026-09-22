import assert from "node:assert/strict";
import { test } from "node:test";
import jobsPayload from "../example.json" with { type: "json" };
import { buildJobGraph } from "./jobGraph.js";
import { buildSkillDagModel, evaluateSkillDag, suggestedSkillRowsForCategory } from "./skillDag.js";

test("builds a DAG with every skill and without product or other endpoints", () => {
  const graph = buildJobGraph(jobsPayload);
  const model = buildSkillDagModel(graph);

  assert.equal(model.skills.length, graph.skills.length);
  assert.equal(model.categories.some((category) => category.key === "product"), false);
  assert.equal(model.categories.some((category) => category.key === "other"), false);
  assert.ok(model.edges.length > 0);
});

test("covers every skill while allowing shared capability group memberships", () => {
  const graph = buildJobGraph(jobsPayload);
  const model = buildSkillDagModel(graph);
  const clusteredSkillIds = model.skillGroups.flatMap((group) => group.skills.map((skill) => skill.id));
  const python = graph.skills.find((skill) => skill.label === "Python");

  assert.equal(new Set(clusteredSkillIds).size, graph.skills.length);
  assert.ok(clusteredSkillIds.length > graph.skills.length);
  assert.deepEqual(model.skillMemberships.get(python.id), ["languages", "ai-model"]);
  assert.deepEqual(model.skillGroups.slice(0, 2).map((group) => group.label), ["基础语言", "Web 与客户端"]);
});

test("ranks only categories matched by selected skills", () => {
  const graph = buildJobGraph(jobsPayload);
  const model = buildSkillDagModel(graph);
  const backend = model.categories.find((category) => category.key === "backend");
  const selectedIds = backend.combinations[0].skills.slice(0, 2).map((skill) => skill.id);
  const matches = evaluateSkillDag(model, selectedIds);
  const backendMatch = matches.find((match) => match.category.id === backend.id);

  assert.equal(backendMatch.matchedCount, 2);
  assert.equal(backendMatch.unlocked, false);
  assert.equal(matches.filter((match) => match.matchedCount > 0).length < model.categories.length, true);
});

test("lights a category when one complete high-frequency combination is selected", () => {
  const graph = buildJobGraph(jobsPayload);
  const model = buildSkillDagModel(graph);
  const frontend = model.categories.find((category) => category.key === "frontend");
  const selectedIds = frontend.combinations[0].skills.map((skill) => skill.id);
  const match = evaluateSkillDag(model, selectedIds).find((item) => item.category.id === frontend.id);

  assert.equal(match.matchedCount, 3);
  assert.equal(match.unlocked, true);
  assert.deepEqual(match.best.missingSkills, []);
});

test("suggests five rows while combining unselected programming languages", () => {
  const graph = buildJobGraph(jobsPayload);
  const model = buildSkillDagModel(graph);
  const backend = model.categories.find((category) => category.key === "backend");
  const selectedIds = backend.combinations[0].skills.map((skill) => skill.id);
  const suggestions = suggestedSkillRowsForCategory(graph, backend.id, selectedIds);
  const languageRow = suggestions.find((skill) => skill.isLanguageGroup);
  const programmingLanguages = new Set(["Python", "C/C++", "Go", "Java", "JS/TS", "Rust"]);
  const ranking = graph.skillRankingByCategory.get(backend.id).filter((skill) => !selectedIds.includes(skill.id));
  const expectedLanguages = ranking.filter((skill) => programmingLanguages.has(skill.label));
  const expectedOtherSkills = ranking.filter((skill) => !programmingLanguages.has(skill.label)).slice(0, 4);

  assert.equal(suggestions.length, 5);
  assert.equal(suggestions.filter((skill) => skill.isLanguageGroup).length, 1);
  assert.equal(languageRow.label, `编程语言：${expectedLanguages.map((skill) => skill.label).join(" / ")}`);
  assert.equal(languageRow.label.includes("Go"), false);
  assert.deepEqual(
    suggestions.filter((skill) => !skill.isLanguageGroup).map((skill) => skill.label),
    expectedOtherSkills.map((skill) => skill.label),
  );
});
