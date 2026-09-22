import assert from "node:assert/strict";
import test from "node:test";
import { buildCourse3dLayout, buildCourseGraph, courseRadius } from "./courseGraph.js";

const rows = [
  { name: "高等数学", majors: ["计算机科学与技术", "软件工程"], field: "数学基础", description: "函数、极限、微分与积分。" },
  { name: "数据结构", majors: ["计算机科学与技术", "软件工程", "人工智能"], field: "专业基础" },
  { name: "机器学习", majors: ["人工智能"], field: "人工智能" },
  { name: "程序设计实验", majors: ["网络工程"], field: "实验与实践教学环节" },
];

test("buildCourseGraph creates major-course links with field metadata", () => {
  const model = buildCourseGraph(rows);

  assert.equal(model.stats.totalMajors, 3);
  assert.equal(model.stats.totalFields, 3);
  assert.equal(model.stats.totalCourses, 3);
  assert.equal(model.stats.totalLinks, 6);
  assert.equal(model.courseFieldLinks.length, 3);
  assert.equal(model.majorFieldLinks.length, 6);
  assert.equal(model.stats.maxMentions, 3);
  assert.equal(model.fieldById.has("field:实验与实践教学环节"), false);
  assert.equal(model.courseById.has("course:程序设计实验"), false);
  assert.equal(model.courseById.get("course:高等数学 / 微积分").description, "函数、极限、微分与积分。");
  assert.deepEqual(
    [...model.courseById.get("course:数据结构").majorIds].sort(),
    ["major:人工智能", "major:计算机科学与技术", "major:软件工程"].sort(),
  );
  assert.deepEqual(model.courses.map((course) => course.label), ["数据结构", "高等数学 / 微积分", "机器学习"]);
  assert.equal(model.majorById.get("major:计算机科学与技术").code, "080901");
  assert.equal(model.majorById.get("major:人工智能").code, "080717T");
  assert.equal(model.majorById.get("major:人工智能").courseIds.length, 2);
});

test("courseRadius grows with the number of majors mentioning a course", () => {
  assert.ok(courseRadius(1, 16) < courseRadius(4, 16));
  assert.ok(courseRadius(4, 16) < courseRadius(16, 16));
});

test("buildCourseGraph merges advanced mathematics and calculus into one course", () => {
  const model = buildCourseGraph([
    { name: "高等数学", majors: ["计算机科学与技术", "软件工程"], field: "数学基础" },
    { name: "微积分", majors: ["软件工程", "人工智能"], field: "数学基础" },
  ]);
  const merged = model.courseById.get("course:高等数学 / 微积分");

  assert.equal(model.stats.totalCourses, 1);
  assert.equal(model.stats.totalLinks, 3);
  assert.equal(merged.mentionCount, 3);
  assert.equal(model.courseById.has("course:高等数学"), false);
  assert.equal(model.courseById.has("course:微积分"), false);
});

test("buildCourseGraph merges probability courses into one course", () => {
  const model = buildCourseGraph([
    { name: "概率论", majors: ["计算机科学与技术", "软件工程"], field: "数学基础" },
    { name: "概率论与数理统计", majors: ["软件工程", "人工智能"], field: "数学基础" },
  ]);
  const merged = model.courseById.get("course:概率论 / 概率论与数理统计");

  assert.equal(model.stats.totalCourses, 1);
  assert.equal(model.stats.totalLinks, 3);
  assert.equal(merged.mentionCount, 3);
  assert.equal(model.courseById.has("course:概率论"), false);
  assert.equal(model.courseById.has("course:概率论与数理统计"), false);
});

test("buildCourseGraph excludes removed elite-track majors and recalculates mentions", () => {
  const model = buildCourseGraph([
    {
      name: "数学分析",
      majors: [
        "计算机科学与技术（部分拔尖/荣誉班）",
        "智能科学与技术（部分强基/拔尖班）",
        "网络空间安全（部分英才班）",
        "人工智能（部分拔尖或数理强化项目）",
        "信息与计算科学（交叉培养方向）",
        "人工智能",
      ],
      field: "数学基础",
    },
  ]);

  assert.equal(model.majorById.has("major:计算机科学与技术（部分拔尖/荣誉班）"), false);
  assert.equal(model.majorById.has("major:智能科学与技术（部分强基/拔尖班）"), false);
  assert.equal(model.majorById.has("major:网络空间安全（部分英才班）"), false);
  assert.equal(model.majorById.has("major:人工智能（部分拔尖或数理强化项目）"), false);
  assert.equal(model.majorById.has("major:信息与计算科学（交叉培养方向）"), false);
  assert.equal(model.courseById.get("course:数学分析").mentionCount, 1);
});

test("buildCourse3dLayout keeps majors above courses in two vertical layers", () => {
  const model = buildCourseGraph(rows);
  const positions = buildCourse3dLayout(model);
  const majorYs = model.majors.map((major) => positions.get(major.id).y);
  const courseYs = model.courses.map((course) => positions.get(course.id).y);

  assert.ok(Math.max(...courseYs) < Math.min(...majorYs));
  assert.equal(model.fields.some((field) => positions.has(field.id)), false);
});
