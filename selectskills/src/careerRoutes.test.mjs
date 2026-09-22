import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateCareerRoute, evaluateCareerRoutes } from "./careerRoutes.js";

const skill = (id) => ({ id, label: id });

test("evaluates required skills and capped choice group progress", () => {
  const route = {
    id: "backend",
    requiredSkills: [skill("database"), skill("cache")],
    choiceGroups: [{ label: "language", min: 1, skills: [skill("go"), skill("java")] }],
  };

  assert.deepEqual(evaluateCareerRoute(route, ["database", "go"]), {
    current: 2,
    total: 3,
    unlocked: false,
    missingRequired: [skill("cache")],
    choiceGroups: [{ label: "language", min: 1, skills: [skill("go"), skill("java")], masteredCount: 1, satisfied: true, contribution: 1 }],
  });
  assert.equal(evaluateCareerRoute(route, ["database", "cache", "go", "java"]).current, 3);
  assert.equal(evaluateCareerRoute(route, ["database", "cache", "go"]).unlocked, true);
  assert.equal(evaluateCareerRoute(route, ["database", "go"]).unlocked, false);
});

test("updates every career that shares a mastered skill without unlocking incomplete routes", () => {
  const routes = [
    { id: "ai", requiredSkills: [skill("python"), skill("llm")], choiceGroups: [] },
    { id: "data", requiredSkills: [skill("python"), skill("sql")], choiceGroups: [] },
  ];
  const progress = evaluateCareerRoutes(routes, ["python"]);

  assert.equal(progress.get("ai").current, 1);
  assert.equal(progress.get("data").current, 1);
  assert.equal(progress.get("ai").unlocked, false);
  assert.equal(progress.get("data").unlocked, false);
});
