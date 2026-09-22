import { useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { CourseGalaxy } from "./CourseGalaxy.jsx";
import { buildCourseGraph } from "./courseGraph.js";

const MATH_COURSE_LABELS = [
  "概率论 / 概率论与数理统计",
  "高等数学 / 微积分",
  "线性代数",
  "离散数学",
];
const MATH_COURSE_LABEL_SET = new Set(MATH_COURSE_LABELS);

export function CourseGraphTab({ payload }) {
  const model = useMemo(() => buildCourseGraph(payload), [payload]);
  const [selection, setSelection] = useState(() => model.majors[0] ? { id: model.majors[0].id, type: "major" } : null);
  const [showMathCourses, setShowMathCourses] = useState(true);
  const mathCourseIds = useMemo(
    () => new Set(model.courses.filter((course) => MATH_COURSE_LABEL_SET.has(course.label)).map((course) => course.id)),
    [model],
  );
  const selectedMajor = selection?.type === "major" ? model.majorById.get(selection.id) || null : null;
  const selectedCourse = selection?.type === "course" ? model.courseById.get(selection.id) || null : null;
  const selectedCourses = useMemo(
    () => (selectedMajor?.courseIds || [])
      .map((courseId) => model.courseById.get(courseId))
      .filter(Boolean)
      .sort((a, b) => b.mentionCount - a.mentionCount || a.label.localeCompare(b.label, "zh-CN")),
    [model, selectedMajor],
  );
  const selectedMajors = useMemo(
    () => (selectedCourse?.majorIds || []).map((majorId) => model.majorById.get(majorId)).filter(Boolean),
    [model, selectedCourse],
  );
  const groupedCourses = selectedMajor ? selectedCourses : model.courses;
  const mathCourses = useMemo(() => {
    const courseByLabel = new Map(groupedCourses.map((course) => [course.label, course]));
    return MATH_COURSE_LABELS.map((label) => courseByLabel.get(label)).filter(Boolean);
  }, [groupedCourses]);
  const professionalCourses = useMemo(
    () => groupedCourses.filter((course) => !MATH_COURSE_LABEL_SET.has(course.label)),
    [groupedCourses],
  );

  const handleSelect = (nextSelection) => {
    setSelection((current) =>
      current?.id === nextSelection?.id && current?.type === nextSelection?.type ? null : nextSelection,
    );
  };

  const handleCourseRowSelect = (course) => {
    if (mathCourseIds.has(course.id)) setShowMathCourses(true);
    handleSelect({ id: course.id, type: "course" });
  };

  const handleMathCourseVisibility = (event) => {
    const visible = event.target.checked;
    setShowMathCourses(visible);
    if (!visible) {
      setSelection((current) => current?.type === "course" && mathCourseIds.has(current.id) ? null : current);
    }
  };

  return (
    <section className="course-workspace" aria-label="专业与课程关系图">
      <div className="course-graph-main">
        <div className="course-graph-heading">
          <div>
            <p className="panel-kicker">课程图谱</p>
            <h2>专业 → 课程</h2>
            <p>拖动可旋转视角，滚轮缩放。点击任意球体，会同时点亮它两侧的关联。</p>
          </div>
          <div className="course-graph-controls">
            <label className="course-math-toggle">
              <input
                type="checkbox"
                checked={showMathCourses}
                onChange={handleMathCourseVisibility}
              />
              <span>显示数学课程</span>
            </label>
            <div className="course-size-legend" aria-label="课程球大小图例">
              <span className="is-label">球体大小 · 提及专业数</span>
              <span><i className="is-small" />1 个</span>
              <span><i className="is-large" />{model.stats.maxMentions} 个</span>
            </div>
          </div>
        </div>
        <div className="course-graph-stage">
          <CourseGalaxy
            model={model}
            selection={selection}
            mathCourseIds={mathCourseIds}
            showMathCourses={showMathCourses}
            onSelect={handleSelect}
          />
        </div>
      </div>

      <aside className={`info-panel course-info-panel${selectedMajor ? " is-major-selected" : ""}`}>
        <div className="panel-section">
          <p className="panel-kicker">课程数据</p>
          <div className="course-panel-title">
            <h2>{selectedCourse?.label || selectedMajor?.label || "全部专业与课程"}</h2>
            {selectedMajor?.code ? (
              <span className="course-major-code" aria-label={`专业代码 ${selectedMajor.code}`}>
                {selectedMajor.code}
              </span>
            ) : null}
          </div>
          <p className="muted">
            {selectedCourse
              ? `归在「${selectedCourse.field}」下，有 ${selectedMajors.length} 个专业把它列入培养方案。`
              : selectedMajor
              ? `共关联 ${selectedCourses.length} 门课程，下方按数学课与专业课分组列出。`
              : `共 ${model.stats.totalCourses} 门课程、${model.stats.totalMajors} 个专业。继续往下可看到全部课程的提及次数排行。`}
          </p>
        </div>
        {!selectedMajor ? (
          <div className="panel-section course-stat-grid" aria-label="课程图谱概览">
            <span><strong>{model.stats.totalMajors}</strong><small>专业</small></span>
            <span><strong>{model.stats.totalCourses}</strong><small>课程</small></span>
            <span><strong>{model.stats.totalLinks}</strong><small>关联</small></span>
          </div>
        ) : null}
        <div className="panel-section">
          <h3>{selectedCourse ? "关联专业" : selectedMajor ? "关联课程" : "高频课程"}</h3>
          {!selectedCourse ? (
            <div className="course-grouped-ranking">
              {mathCourses.length > 0 ? (
                <section className="course-ranking-group">
                  <h4>数学课程</h4>
                  <div className="course-ranking"><CourseRows courses={mathCourses} onSelect={handleCourseRowSelect} /></div>
                </section>
              ) : null}
              {professionalCourses.length > 0 ? (
                <section className="course-ranking-group">
                  <h4>专业课程</h4>
                  <div className="course-ranking"><CourseRows courses={professionalCourses} onSelect={handleCourseRowSelect} /></div>
                </section>
              ) : null}
            </div>
          ) : (
            <div className="course-ranking">
              {selectedMajors.map((major) => (
                <div key={major.id}>
                  <span>关联专业</span>
                  <strong>{major.label}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </section>
  );
}

function CourseRows({ courses, onSelect }) {
  return courses.map((course) => (
    <div className="course-ranking-course" key={course.id}>
      <div className="course-row-main">
        <span>{course.field}</span>
        <div className="course-row-title-line">
          <button
            type="button"
            className="course-row-select"
            aria-label={`选中课程：${course.label}`}
            onClick={() => onSelect(course)}
          >
            <strong>{course.label}</strong>
          </button>
          {course.description ? <CourseDescriptionInfo course={course} /> : null}
        </div>
      </div>
      <b>{course.mentionCount}</b>
    </div>
  ));
}

function CourseDescriptionInfo({ course }) {
  const tooltipId = useId();
  const [position, setPosition] = useState(null);

  const showTooltip = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    setPosition({
      below: rect.top < 160,
      left: Math.min(window.innerWidth - width - 12, Math.max(12, rect.left + rect.width / 2 - width / 2)),
      top: rect.top < 160 ? rect.bottom + 8 : rect.top - 8,
    });
  };

  return (
    <span className="course-description-info">
      <button
        type="button"
        aria-label={`${course.label}课程简介`}
        aria-describedby={position ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setPosition(null)}
        onFocus={showTooltip}
        onBlur={() => setPosition(null)}
      >
        <Info size={13} aria-hidden="true" />
      </button>
      {position ? createPortal(
        <div
          id={tooltipId}
          className={`course-description-tooltip${position.below ? " is-below" : ""}`}
          role="tooltip"
          style={{ left: position.left, top: position.top }}
        >
          <strong>课程简介</strong>
          <span>{course.description}</span>
        </div>,
        document.body,
      ) : null}
    </span>
  );
}
