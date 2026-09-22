import { useEffect, useMemo, useRef, useState } from "react";
import { sortRelatedJobs } from "./jobGraph.js";

export function CareerPath({
  routes,
  progressById,
  masteredSkillIds,
  activeCareerId,
  onCareerChange,
  onToggleSkill,
}) {
  const route = routes.find((item) => item.id === activeCareerId) || routes[0];
  const progress = progressById.get(route.id);
  const mastered = useMemo(() => new Set(masteredSkillIds), [masteredSkillIds]);
  const previousUnlockedRef = useRef(new Map(routes.map((item) => [item.id, progressById.get(item.id)?.unlocked || false])));
  const [celebratingCareerId, setCelebratingCareerId] = useState(null);

  useEffect(() => {
    let newlyUnlocked = null;
    for (const item of routes) {
      const unlocked = progressById.get(item.id)?.unlocked || false;
      if (unlocked && !previousUnlockedRef.current.get(item.id)) newlyUnlocked = item.id;
      previousUnlockedRef.current.set(item.id, unlocked);
    }
    if (!newlyUnlocked) return undefined;
    setCelebratingCareerId(newlyUnlocked);
    const timeout = window.setTimeout(() => setCelebratingCareerId(null), 900);
    return () => window.clearTimeout(timeout);
  }, [progressById, routes]);

  const tierLayouts = route.tiers.map((tier, index) => ({
    ...tier,
    y: [570, 405, 240][index] || 240,
    nodes: distributeTierNodes(tier.skills, [570, 405, 240][index] || 240),
  }));
  const endpoint = { x: 500, y: 82 };
  const edges = buildRouteEdges(tierLayouts, endpoint);
  const requiredIds = new Set(route.requiredSkills.map((skill) => skill.id));
  const unsatisfiedChoiceIds = new Set(
    progress.choiceGroups.filter((group) => !group.satisfied).flatMap((group) => group.skills.map((skill) => skill.id)),
  );
  const isCelebrating = celebratingCareerId === route.id;

  return (
    <div className="career-path-shell">
      <div className="career-overview" aria-label="职业方向进度">
        {routes.map((item) => {
          const itemProgress = progressById.get(item.id);
          const percent = itemProgress.total ? itemProgress.current / itemProgress.total : 0;
          return (
            <button
              key={item.id}
              type="button"
              className={`career-badge${item.id === route.id ? " is-active" : ""}${itemProgress.unlocked ? " is-unlocked" : ""}`}
              style={{ "--route-color": item.color, "--progress": `${percent * 360}deg` }}
              aria-pressed={item.id === route.id}
              onClick={() => onCareerChange(item.id)}
            >
              <span className="career-badge-ring"><i /></span>
              <strong>{item.shortLabel}</strong>
              <small>{itemProgress.unlocked ? "已点亮" : `${itemProgress.current}/${itemProgress.total}`}</small>
            </button>
          );
        })}
      </div>

      <div className={`career-route-stage${progress.unlocked ? " is-unlocked" : ""}${isCelebrating ? " is-celebrating" : ""}`}>
        <div className="career-route-heading">
          <span>当前路线</span>
          <strong>{route.label}</strong>
          <small>{progress.current}/{progress.total}</small>
        </div>
        <svg className="career-route-map" viewBox="0 0 1000 680" role="group" aria-label={`${route.label}技能路线`}>
          <g className="career-route-edges" aria-hidden="true">
            {edges.map((edge) => (
              <path
                key={edge.id}
                d={`M ${edge.from.x} ${edge.from.y} C ${edge.from.x} ${(edge.from.y + edge.to.y) / 2}, ${edge.to.x} ${(edge.from.y + edge.to.y) / 2}, ${edge.to.x} ${edge.to.y}`}
                className={mastered.has(edge.skillId) ? "is-mastered" : ""}
              />
            ))}
          </g>

          <g className="career-endpoint" transform={`translate(${endpoint.x} ${endpoint.y})`} aria-label={`${route.label} ${progress.current}/${progress.total}`}>
            <circle className="career-endpoint-halo" r="62" />
            <circle className="career-endpoint-core" r="46" style={{ "--route-color": route.color }} />
            <text className="career-endpoint-score" textAnchor="middle" y="5">{progress.unlocked ? "✓" : `${progress.current}/${progress.total}`}</text>
            <text className="career-endpoint-label" textAnchor="middle" y="78">{route.label}</text>
          </g>

          {tierLayouts.map((tier) => (
            <g key={tier.label} className="career-tier">
              <text className="career-tier-label" x="44" y={tier.y + 5}>{tier.label}</text>
              {tier.nodes.map((node) => {
                const isMastered = mastered.has(node.skill.id);
                const isNeeded = !isMastered && (requiredIds.has(node.skill.id) || unsatisfiedChoiceIds.has(node.skill.id));
                return (
                  <g
                    key={node.skill.id}
                    className={`career-skill-node${isMastered ? " is-mastered" : ""}${isNeeded ? " is-needed" : ""}`}
                    transform={`translate(${node.x} ${node.y})`}
                    role="button"
                    tabIndex="0"
                    aria-pressed={isMastered}
                    aria-label={`${node.skill.label}，${isMastered ? "已掌握" : "未掌握"}`}
                    onClick={() => onToggleSkill(node.skill.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onToggleSkill(node.skill.id);
                      }
                    }}
                  >
                    <circle className="career-skill-glow" r="38" />
                    <circle className="career-skill-core" r="30" />
                    <text className="career-skill-mark" textAnchor="middle" y="5">{skillMark(node.skill.label)}</text>
                    <text className="career-skill-label" textAnchor="middle" y="52">{node.skill.label}</text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function CareerPanel({ graph, route, progress, masteredSkillIds, onToggleSkill }) {
  const mastered = useMemo(() => new Set(masteredSkillIds), [masteredSkillIds]);
  const category = graph.categories.find((item) => item.key === route.categoryKey);
  const relatedJobs = category
    ? sortRelatedJobs(graph.jobsByCategory.get(category.id) || [], category.key)
    : [];

  return (
    <aside className="info-panel career-info-panel">
      <div className="panel-section career-panel-header" style={{ "--route-color": route.color }}>
        <p className="panel-kicker">职业路线</p>
        <h2>{route.label}</h2>
        <p className="muted">{route.description}</p>
        <div className="career-progress-row">
          <strong>{progress.unlocked ? "已点亮" : `${progress.current}/${progress.total}`}</strong>
          <span><i style={{ width: `${(progress.current / progress.total) * 100}%` }} /></span>
        </div>
      </div>

      <CareerRequirementGroup
        title="核心技能 · 需全部掌握"
        skills={route.requiredSkills}
        mastered={mastered}
        onToggleSkill={onToggleSkill}
      />

      {progress.choiceGroups.map((group) => (
        <CareerRequirementGroup
          key={group.label}
          title={`${group.label} · ${group.masteredCount}/${group.min}`}
          skills={group.skills}
          mastered={mastered}
          onToggleSkill={onToggleSkill}
        />
      ))}

      {!progress.unlocked ? (
        <div className="panel-section career-missing-section">
          <h3>下一步</h3>
          <p className="muted">{nextStepText(progress)}</p>
        </div>
      ) : (
        <div className="panel-section career-jobs-section">
          <p className="panel-kicker">已解锁岗位方向</p>
          <h3>{category?.label || route.shortLabel}相关岗位</h3>
          <div className="career-job-links">
            {relatedJobs.slice(0, 12).map((job) => (
              <a key={job.id} href={job.url} target="_blank" rel="noreferrer">
                <span>{job.label}</span>
                <small>查看岗位 ↗</small>
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function CareerRequirementGroup({ title, skills, mastered, onToggleSkill }) {
  return (
    <div className="panel-section career-requirement-group">
      <h3>{title}</h3>
      <div className="career-skill-checklist">
        {skills.map((skill) => {
          const active = mastered.has(skill.id);
          return (
            <button key={skill.id} type="button" className={active ? "is-mastered" : ""} aria-pressed={active} onClick={() => onToggleSkill(skill.id)}>
              <i>{active ? "✓" : "+"}</i>
              <span>{skill.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function distributeTierNodes(skills, y) {
  const minX = 150;
  const maxX = 850;
  if (skills.length === 1) return [{ skill: skills[0], x: 500, y }];
  return skills.map((skill, index) => ({
    skill,
    x: minX + (index / (skills.length - 1)) * (maxX - minX),
    y,
  }));
}

function buildRouteEdges(tiers, endpoint) {
  const edges = [];
  for (let index = 0; index < tiers.length; index += 1) {
    const sourceTier = tiers[index];
    const targetNodes = tiers[index + 1]?.nodes || [endpoint];
    for (const node of sourceTier.nodes) {
      const target = targetNodes.reduce((nearest, candidate) =>
        Math.abs(candidate.x - node.x) < Math.abs(nearest.x - node.x) ? candidate : nearest,
      targetNodes[0]);
      edges.push({ id: `${sourceTier.label}:${node.skill.id}`, from: node, to: target, skillId: node.skill.id });
    }
  }
  return edges;
}

function skillMark(label) {
  const latin = label.match(/[A-Za-z+#]+/g)?.join("");
  return (latin || label).slice(0, 3);
}

function nextStepText(progress) {
  if (progress.missingRequired.length > 0) {
    return `先补齐核心技能：${progress.missingRequired.map((skill) => skill.label).join("、")}。`;
  }
  const group = progress.choiceGroups.find((item) => !item.satisfied);
  return group ? `在「${group.label}」里再选 ${group.min - group.masteredCount} 项。` : "继续补齐这条路线上的技能。";
}
