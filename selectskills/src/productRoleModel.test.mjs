import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildProductRoleModel,
  classifyProductRole,
  extractProductRoleAbilities,
} from "./productRoleModel.js";

test("classifies only the product role tab categories and other", () => {
  const model = buildProductRoleModel({
    items: [
      { job_id: "pm", title: "保险平台产品经理-财经" },
      { job_id: "da", title: "数据分析师（产品方向）-TRAE" },
      { job_id: "project", title: "人事产品应用实施顾问-飞书" },
      { job_id: "ops", title: "产品运营（资源规划与成本优化）-基础设施" },
      { job_id: "design", title: "效果创意设计师（画质/美颜方向）-抖音" },
      { job_id: "engineering", title: "后端研发工程师-国际广告数据" },
    ],
  });

  assert.deepEqual(model.categories.map((category) => category.id), [
    "product_manager",
    "data_analysis",
    "project_management",
    "operations",
    "design",
    "other",
  ]);
  assert.deepEqual(model.categories.map((category) => category.count), [1, 1, 1, 1, 1, 1]);
});

test("keeps product manager titles from being pulled into operations by business nouns", () => {
  assert.equal(classifyProductRole("商家达人撮合交易链路产品经理（内容电商联盟生态）-TikTok Shop"), "product_manager");
  assert.equal(classifyProductRole("商家运营专家-抖音电商"), "operations");
});

test("classifies role-function examples", () => {
  assert.equal(classifyProductRole("经营分析师（酒旅方向）-抖音生活服务"), "data_analysis");
  assert.equal(classifyProductRole("营销策略与项目管理专家-抖音生活服务"), "project_management");
  assert.equal(classifyProductRole("资深策略运营（日本）-国际化直播"), "operations");
  assert.equal(classifyProductRole("交互设计师-飞书"), "design");
  assert.equal(classifyProductRole("Android研发工程师-电商C端"), "other");
});

test("extracts product role abilities without department tags", () => {
  const abilities = extractProductRoleAbilities("负责需求分析、PRD、SQL 数据分析、项目推进、用户增长和 Figma 设计协作。");

  assert.ok(abilities.includes("需求分析"));
  assert.ok(abilities.includes("PRD"));
  assert.ok(abilities.includes("SQL"));
  assert.ok(abilities.includes("数据分析"));
  assert.ok(abilities.includes("项目管理"));
  assert.ok(abilities.includes("用户增长"));
  assert.ok(abilities.includes("Figma"));
  assert.equal(abilities.includes("TikTok"), false);
});
