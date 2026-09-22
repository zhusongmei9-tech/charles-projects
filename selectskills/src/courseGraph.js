const EXCLUDED_COURSE_FIELDS = new Set(["实验与实践教学环节"]);
const EXCLUDED_COURSE_MAJORS = new Set([
  "计算机科学与技术（部分拔尖/荣誉班）",
  "智能科学与技术（部分强基/拔尖班）",
  "网络空间安全（部分英才班）",
  "人工智能（部分拔尖或数理强化项目）",
  "信息与计算科学（交叉培养方向）",
]);
const MERGED_COURSE_LABELS = new Map([
  ["高等数学", "高等数学 / 微积分"],
  ["微积分", "高等数学 / 微积分"],
  ["概率论", "概率论 / 概率论与数理统计"],
  ["概率论与数理统计", "概率论 / 概率论与数理统计"],
]);
const MAJOR_CODES = new Map([
  ["人工智能", "080717T"],
  ["计算机科学与技术", "080901"],
  ["软件工程", "080902"],
  ["网络工程", "080903"],
  ["信息安全", "080904K"],
  ["物联网工程", "080905"],
  ["数字媒体技术", "080906"],
  ["智能科学与技术", "080907T"],
  ["空间信息与数字技术", "080908T"],
  ["电子与计算机工程", "080909T"],
  ["数据科学与大数据技术", "080910T"],
  ["网络空间安全", "080911TK"],
  ["服务科学与工程", "080915T"],
  ["虚拟现实技术", "080916T"],
  ["区块链工程", "080917T"],
  ["密码科学与技术", "080918TK"],
]);

export function buildCourseGraph(rows) {
  const majorMap = new Map();
  const fieldMap = new Map();
  const courses = [];
  const links = [];
  const courseFieldLinks = [];

  mergeCourseRows(rows).forEach(({ label, majorLabels, fieldLabel, description, index }) => {
    const fieldId = `field:${fieldLabel}`;
    const course = {
      id: `course:${label}`,
      type: "course",
      label,
      field: fieldLabel,
      description,
      fieldId,
      majorIds: majorLabels.map((major) => `major:${major}`),
      mentionCount: majorLabels.length,
      index,
    };
    courses.push(course);

    if (!fieldMap.has(fieldId)) {
      fieldMap.set(fieldId, {
        id: fieldId,
        type: "field",
        label: fieldLabel,
        courseIds: [],
      });
    }
    fieldMap.get(fieldId).courseIds.push(course.id);
    courseFieldLinks.push({
      id: `${course.id}->${fieldId}`,
      courseId: course.id,
      fieldId,
    });

    majorLabels.forEach((majorLabel) => {
      const majorId = `major:${majorLabel}`;
      if (!majorMap.has(majorId)) {
        majorMap.set(majorId, {
          id: majorId,
          type: "major",
          label: majorLabel,
          code: MAJOR_CODES.get(majorLabel) || null,
          courseIds: [],
        });
      }
      majorMap.get(majorId).courseIds.push(course.id);
      links.push({
        id: `${majorId}->${course.id}`,
        majorId,
        courseId: course.id,
      });
    });
  });

  const majors = [...majorMap.values()].sort(
    (a, b) => b.courseIds.length - a.courseIds.length || a.label.localeCompare(b.label, "zh-CN"),
  );
  const fields = [...fieldMap.values()].sort(
    (a, b) => b.courseIds.length - a.courseIds.length || a.label.localeCompare(b.label, "zh-CN"),
  );
  courses.sort(
    (a, b) => b.mentionCount - a.mentionCount || a.field.localeCompare(b.field, "zh-CN") || a.label.localeCompare(b.label, "zh-CN"),
  );
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const majorFieldLinks = majors.flatMap((major) => {
    const fieldIds = new Set(major.courseIds.map((courseId) => courseById.get(courseId)?.fieldId).filter(Boolean));
    return [...fieldIds].map((fieldId) => ({
      id: `${major.id}->${fieldId}`,
      majorId: major.id,
      fieldId,
    }));
  });

  return {
    majors,
    fields,
    courses,
    links,
    majorFieldLinks,
    courseFieldLinks,
    majorById: new Map(majors.map((major) => [major.id, major])),
    fieldById: new Map(fields.map((field) => [field.id, field])),
    courseById,
    stats: {
      totalMajors: majors.length,
      totalFields: fields.length,
      totalCourses: courses.length,
      totalLinks: links.length,
      maxMentions: Math.max(1, ...courses.map((course) => course.mentionCount)),
    },
  };
}

function mergeCourseRows(rows) {
  const merged = new Map();
  rows.forEach((row, index) => {
    const originalLabel = String(row?.name || "").trim();
    const label = MERGED_COURSE_LABELS.get(originalLabel) || originalLabel;
    const fieldLabel = String(row?.field || "未分类").trim() || "未分类";
    const description = String(row?.description || "").trim();
    const majorLabels = (row?.majors || [])
      .map((major) => String(major).trim())
      .filter((major) => major && !EXCLUDED_COURSE_MAJORS.has(major));
    if (!label || majorLabels.length === 0 || EXCLUDED_COURSE_FIELDS.has(fieldLabel)) return;

    if (!merged.has(label)) {
      merged.set(label, { label, fieldLabel, description, index, majorLabels: new Set() });
    } else if (!merged.get(label).description && description) {
      merged.get(label).description = description;
    }
    majorLabels.forEach((major) => merged.get(label).majorLabels.add(major));
  });

  return [...merged.values()].map((course) => ({
    ...course,
    majorLabels: [...course.majorLabels],
  }));
}

export function courseRadius(mentionCount, maxMentions) {
  if (maxMentions <= 1) return 7;
  const normalized = (Math.max(1, mentionCount) - 1) / (maxMentions - 1);
  return 5.5 + Math.sqrt(normalized) * 11.5;
}

export function buildCourse3dLayout(model) {
  const positions = new Map();
  model.majors.forEach((major, index) => {
    const angle = (index / model.majors.length) * Math.PI * 2 - Math.PI / 2;
    positions.set(major.id, {
      x: Math.cos(angle) * 58,
      y: 38,
      z: Math.sin(angle) * 42,
    });
  });

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  model.courses.forEach((course, index) => {
    const progress = (index + 0.5) / model.courses.length;
    const radius = 8 + Math.sqrt(progress) * 58;
    const angle = index * goldenAngle;
    positions.set(course.id, {
      x: Math.cos(angle) * radius,
      y: -38 + Math.sin(index * 1.71) * 3.2,
      z: Math.sin(angle) * radius * 0.72,
    });
  });

  return positions;
}
