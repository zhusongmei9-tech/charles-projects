import { useEffect, useMemo, useRef, useState } from "react";
import { buildSkillDagModel, evaluateSkillDag, suggestedSkillRowsForCategory } from "./skillDag.js";
import { ink, wash } from "./theme.js";

const VIEWBOX = { width: 1000, height: 1100 };
const CATEGORY_HIGHLIGHT_THRESHOLD = 2;
const CLUSTER_CENTERS = {
  "web-client": { x: 190, y: 430 },
  backend: { x: 500, y: 430 },
  data: { x: 810, y: 430 },
  quality: { x: 190, y: 690 },
  languages: { x: 500, y: 690 },
  systems: { x: 810, y: 690 },
  "ai-agent": { x: 190, y: 950 },
  "ai-model": { x: 500, y: 950 },
  cloud: { x: 810, y: 950 },
};

export function SkillDag({ graph, selectedSkillIds, onToggleSkill }) {
  const model = useMemo(() => buildSkillDagModel(graph), [graph]);
  const initialLayout = useMemo(() => buildInitialLayout(model), [model]);
  const motionBySkillId = useMemo(
    () => new Map(model.skills.map((skill) => [skill.id, buildBrownianMotion(skill.id)])),
    [model.skills],
  );
  const [positions, setPositions] = useState(initialLayout.positions);
  const [motionEnabled, setMotionEnabled] = useState(() =>
    typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const selected = useMemo(() => new Set(selectedSkillIds), [selectedSkillIds]);
  const matches = useMemo(() => evaluateSkillDag(model, selected), [model, selected]);
  const matchByCategoryId = new Map(matches.map((match) => [match.category.id, match]));
  const recommendedCategoryId = matches.find((match) => match.matchedCount >= CATEGORY_HIGHLIGHT_THRESHOLD)?.category.id || null;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionEnabled(!mediaQuery.matches);
    mediaQuery.addEventListener("change", updateMotion);
    return () => mediaQuery.removeEventListener("change", updateMotion);
  }, []);

  const startDrag = (event, nodeId) => {
    const point = clientPointToSvg(event, svgRef.current);
    const position = positions[nodeId];
    if (!point || !position) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      nodeId,
      pointerId: event.pointerId,
      offsetX: point.x - position.x,
      offsetY: point.y - position.y,
      startX: point.x,
      startY: point.y,
      moved: false,
    };
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = clientPointToSvg(event, svgRef.current);
    if (!point) return;
    if (Math.hypot(point.x - drag.startX, point.y - drag.startY) > 4) drag.moved = true;
    setPositions((current) => ({
      ...current,
      [drag.nodeId]: {
        x: clamp(point.x - drag.offsetX, 42, VIEWBOX.width - 42),
        y: clamp(point.y - drag.offsetY, 52, VIEWBOX.height - 48),
      },
    }));
  };

  const finishDrag = (event, skillId) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    if (!drag.moved && skillId) onToggleSkill(skillId);
  };

  return (
    <div className="skill-dag-shell">
      <div className="skill-dag-heading">
        <span>技能加点</span>
        <strong>{selected.size > 0 ? `已选 ${selected.size} 项技能` : "点一个技能开始规划"}</strong>
        <small>圆点可拖动，用来调整布局</small>
      </div>
      <svg
        ref={svgRef}
        className="skill-dag-map"
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        role="group"
        aria-label="技能到岗位大类的可拖动有向无环图"
      >
        <defs>
          <marker id="skill-dag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <text className="skill-dag-layer-label" x="36" y="32">岗位大类 · 路线终点</text>

        <g className="skill-dag-edges" aria-hidden="true">
          {model.edges.map((edge) => {
            const from = positions[edge.skillId];
            const to = positions[edge.categoryId];
            const match = matchByCategoryId.get(edge.categoryId);
            const active = selected.has(edge.skillId);
            if (!from || !to || (match?.matchedCount || 0) < CATEGORY_HIGHLIGHT_THRESHOLD) return null;
            return (
              <path
                key={edge.id}
                d={edgePath(from, to)}
                className={active ? "is-active" : ""}
                markerEnd={active ? "url(#skill-dag-arrow)" : undefined}
              />
            );
          })}
        </g>

        {model.categories.map((category) => {
          const position = positions[category.id];
          const match = matchByCategoryId.get(category.id);
          const highlighted = (match?.matchedCount || 0) >= CATEGORY_HIGHLIGHT_THRESHOLD;
          const recommended = category.id === recommendedCategoryId;
          return (
            <g
              key={category.id}
              className={`skill-dag-category${highlighted ? " is-matched" : ""}${recommended ? " is-recommended" : ""}${match?.unlocked ? " is-unlocked" : ""}`}
              transform={`translate(${position.x} ${position.y})`}
              aria-label={`${category.label}，匹配 ${match?.matchedCount || 0}/${match?.total || 3}`}
              onPointerDown={(event) => startDrag(event, category.id)}
              onPointerMove={moveDrag}
              onPointerUp={(event) => finishDrag(event)}
              onPointerCancel={(event) => finishDrag(event)}
            >
              <g className="skill-dag-category-visual">
                <circle className="skill-dag-category-halo" r="42" />
                <circle
                  className="skill-dag-category-core"
                  r="40"
                  style={{ "--cat-ink": ink(category.color), "--cat-wash": wash(category.color, 0.12) }}
                />
                <text className="skill-dag-category-label" textAnchor="middle" y="-3">{category.label}</text>
                <text className="skill-dag-category-score" textAnchor="middle" y="16">
                  {match?.unlocked ? "已点亮" : `${match?.matchedCount || 0}/${match?.total || 3}`}
                </text>
              </g>
            </g>
          );
        })}

        {model.skills.map((skill) => {
          const position = positions[skill.id];
          const active = selected.has(skill.id);
          const labelLines = skillLabelLines(skill.label);
          const motion = motionBySkillId.get(skill.id);
          return (
            <g
              key={skill.id}
              className={`skill-dag-skill${active ? " is-selected" : ""}`}
              transform={`translate(${position.x} ${position.y})`}
              role="button"
              tabIndex="0"
              aria-pressed={active}
              aria-label={`${skill.label}，${active ? "已选择" : "未选择"}`}
              onPointerDown={(event) => startDrag(event, skill.id)}
              onPointerMove={moveDrag}
              onPointerUp={(event) => finishDrag(event, skill.id)}
              onPointerCancel={(event) => finishDrag(event)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggleSkill(skill.id);
                }
              }}
            >
              {motionEnabled && (
                <animateTransform
                  className="skill-dag-brownian-motion"
                  attributeName="transform"
                  type="translate"
                  additive="sum"
                  values={motion.values}
                  dur={`${motion.duration}s`}
                  begin={`${motion.delay}s`}
                  repeatCount="indefinite"
                />
              )}
              <g className="skill-dag-skill-visual">
                <circle className="skill-dag-skill-core" r="28" />
                <text className="skill-dag-skill-label" textAnchor="middle">
                  {labelLines.map((line, index) => (
                    <tspan key={`${line}:${index}`} x="0" y={(index - (labelLines.length - 1) / 2) * 8 + 2}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SkillDagPanel({ graph, selectedSkillIds, onToggleSkill }) {
  const model = useMemo(() => buildSkillDagModel(graph), [graph]);
  const matches = useMemo(() => evaluateSkillDag(model, selectedSkillIds), [model, selectedSkillIds]);
  const selectedSkills = selectedSkillIds.map((skillId) => graph.nodeById.get(skillId)).filter(Boolean);
  const recommendations = matches.filter((match) => match.matchedCount > 0).slice(0, 3);

  return (
    <aside className="info-panel skill-dag-panel">
      <div className="panel-section">
        <p className="panel-kicker">技能加点</p>
        <h2>{selectedSkills.length > 0 ? `已选 ${selectedSkills.length} 项技能` : "规划职业方向"}</h2>
        <p className="muted">
          点击技能即可多选，不限先后顺序。系统会比对各大类的高频三技能组合，算出与你所选最接近的方向。
        </p>
      </div>

      <div className="panel-section">
        <h3>已选技能</h3>
        {selectedSkills.length > 0 ? (
          <div className="skill-dag-selected-list">
            {selectedSkills.map((skill) => (
              <button key={skill.id} type="button" onClick={() => onToggleSkill(skill.id)}>
                {skill.label}<span>×</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="muted">还没有选技能。任意一项都可以当作起点，没有前置要求。</p>
        )}
      </div>

      <div className="panel-section">
        <h3>推荐方向</h3>
        {recommendations.length > 0 ? (
          <div className="skill-dag-recommendations">
            {recommendations.map((match, index) => {
              const suggestedSkills = match.unlocked
                ? suggestedSkillRowsForCategory(graph, match.category.id, selectedSkillIds)
                : [];
              return (
                <div key={match.category.id} className={index === 0 ? "is-best" : ""}>
                  <span style={{ "--cat-ink": ink(match.category.color) }}>{index + 1}</span>
                  <strong>{match.category.label}</strong>
                  <em>{match.matchedCount}/{match.total}</em>
                  <small>
                    {match.unlocked
                      ? "三技能组合已齐"
                      : `还差：${match.best.missingSkills.map((skill) => skill.label).join("、")}`}
                  </small>
                  {suggestedSkills.length > 0 ? (
                    <div className="skill-dag-suggestions">
                      <b>该方向的其他高频技能</b>
                      <ol>
                        {suggestedSkills.map((skill, skillIndex) => (
                          <li key={skill.id} className={skill.isLanguageGroup ? "is-language-group" : ""}>
                            <span>{skillIndex + 1}</span>
                            <strong>{skill.label}</strong>
                            <em>{skill.countLabel}</em>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">点选技能后，这里会列出最匹配的三个大类。</p>
        )}
      </div>
    </aside>
  );
}

function buildInitialLayout(model) {
  const positions = {};
  model.categories.forEach((category, index) => {
    const secondRow = index >= 6;
    const rowIndex = secondRow ? index - 6 : index;
    positions[category.id] = {
      x: (secondRow ? 170 : 90) + rowIndex * 164,
      y: secondRow ? 202 : 104,
    };
  });

  const spacing = 52;
  model.skillGroups.forEach((group) => {
    const center = CLUSTER_CENTERS[group.id];
    const skills = group.skills
      .filter((skill) => model.skillMemberships.get(skill.id)?.length === 1)
      .sort((a, b) => hashString(a.id) - hashString(b.id));
    const columns = Math.max(1, Math.ceil(Math.sqrt(skills.length)));
    const rows = Math.max(1, Math.ceil(skills.length / columns));

    skills.forEach((skill, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const rowLength = Math.min(columns, skills.length - row * columns);
      const random = seededRandom(hashString(`${skill.id}:position`));
      positions[skill.id] = {
        x: center.x + (column - (rowLength - 1) / 2) * spacing + (random() - 0.5) * 8,
        y: center.y + (row - (rows - 1) / 2) * spacing + (random() - 0.5) * 8,
      };
    });

  });

  const sharedSkillsByBoundary = new Map();
  for (const skill of model.skills) {
    const memberships = model.skillMemberships.get(skill.id) || [];
    if (memberships.length < 2) continue;
    const boundaryId = [...memberships].sort().join(":");
    const boundarySkills = sharedSkillsByBoundary.get(boundaryId) || [];
    boundarySkills.push(skill);
    sharedSkillsByBoundary.set(boundaryId, boundarySkills);
  }

  for (const skills of sharedSkillsByBoundary.values()) {
    const memberships = model.skillMemberships.get(skills[0].id);
    const centers = memberships.map((groupId) => CLUSTER_CENTERS[groupId]);
    const dx = centers[1].x - centers[0].x;
    const dy = centers[1].y - centers[0].y;
    const length = Math.hypot(dx, dy) || 1;
    const languageIndex = memberships.indexOf("languages");
    let center;
    if (languageIndex >= 0) {
      const languageCenter = centers[languageIndex];
      const otherCenters = centers.filter((_, index) => index !== languageIndex);
      const otherCenter = {
        x: otherCenters.reduce((total, point) => total + point.x, 0) / otherCenters.length,
        y: otherCenters.reduce((total, point) => total + point.y, 0) / otherCenters.length,
      };
      const languageDx = otherCenter.x - languageCenter.x;
      const languageDy = otherCenter.y - languageCenter.y;
      const languageLength = Math.hypot(languageDx, languageDy) || 1;
      center = {
        x: languageCenter.x + (languageDx / languageLength) * 74,
        y: languageCenter.y + (languageDy / languageLength) * 74,
      };
    } else {
      center = {
        x: centers.reduce((total, point) => total + point.x, 0) / centers.length,
        y: centers.reduce((total, point) => total + point.y, 0) / centers.length,
      };
    }

    skills.sort((a, b) => hashString(a.id) - hashString(b.id)).forEach((skill, index) => {
      const offset = (index - (skills.length - 1) / 2) * 48;
      positions[skill.id] = {
        x: center.x - (dy / length) * offset,
        y: center.y + (dx / length) * offset,
      };
    });
  }

  return { positions };
}

function clientPointToSvg(event, svg) {
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEWBOX.width,
    y: ((event.clientY - rect.top) / rect.height) * VIEWBOX.height,
  };
}

function edgePath(from, to) {
  const startY = from.y - 27;
  const endY = to.y + 41;
  const controlY = (startY + endY) / 2;
  return `M ${from.x} ${startY} C ${from.x} ${controlY}, ${to.x} ${controlY}, ${to.x} ${endY}`;
}

function skillLabelLines(label) {
  const lines = [];
  for (const word of label.split(/\s+/).filter(Boolean)) {
    for (let start = 0; start < word.length; start += 7) {
      lines.push(word.slice(start, start + 7));
    }
  }
  return lines;
}

function buildBrownianMotion(skillId) {
  const random = seededRandom(hashString(`${skillId}:motion`));
  const values = ["0 0"];
  for (let index = 0; index < 7; index += 1) {
    const x = ((random() - 0.5) * 12).toFixed(1);
    const y = ((random() - 0.5) * 12).toFixed(1);
    values.push(`${x} ${y}`);
  }
  values.push("0 0");
  const duration = 8 + random() * 5;
  return {
    values: values.join(";"),
    duration: duration.toFixed(2),
    delay: (-random() * duration).toFixed(2),
  };
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
