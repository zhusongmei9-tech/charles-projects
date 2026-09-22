import assert from "node:assert/strict";
import test from "node:test";
import { combineJobPayloads, normalizeCompanyPayload } from "./jobData.js";

const bytedance = normalizeCompanyPayload({ source_url: "byte", items: [{ job_id: "1", title: "后端" }] }, {
  key: "bytedance",
  label: "字节跳动",
});
const tencent = normalizeCompanyPayload({ source_url: "tencent", items: [{ job_id: "1", title: "算法" }] }, {
  key: "tencent",
  label: "腾讯",
});

test("normalizes company metadata without mutating source jobs", () => {
  assert.equal(bytedance.items[0].company, "字节跳动");
  assert.equal(bytedance.items[0].company_key, "bytedance");
});

test("combines all companies and filters a single company", () => {
  assert.equal(combineJobPayloads([bytedance, tencent]).items.length, 2);
  assert.deepEqual(combineJobPayloads([bytedance, tencent], "tencent").items.map((job) => job.title), ["算法"]);
});
