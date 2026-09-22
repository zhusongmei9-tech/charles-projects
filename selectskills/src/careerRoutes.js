export const CAREER_ROUTE_DEFINITIONS = [
  {
    id: "frontend",
    label: "前端工程师",
    shortLabel: "前端",
    categoryKey: "frontend",
    color: "#39c5bb",
    description: "构建稳定、高性能、可维护的 Web 用户体验。",
    requiredSkills: ["JS/TS", "HTML/CSS", "Webpack/Vite", "性能优化"],
    choiceGroups: [{ label: "框架任选 1 项", min: 1, skills: ["React", "Vue", "Svelte"] }],
    tiers: [
      { label: "基础", skills: ["JS/TS", "HTML/CSS"] },
      { label: "工程", skills: ["Webpack/Vite", "性能优化"] },
      { label: "方向", skills: ["React", "Vue", "Svelte"] },
    ],
  },
  {
    id: "backend",
    label: "后端工程师",
    shortLabel: "后端",
    categoryKey: "backend",
    color: "#5b8cff",
    description: "设计可靠的服务、数据链路和分布式业务系统。",
    requiredSkills: ["分布式系统", "MySQL", "Redis"],
    choiceGroups: [
      { label: "语言任选 1 项", min: 1, skills: ["Go", "Java", "Python", "C/C++"] },
      { label: "架构任选 1 项", min: 1, skills: ["RPC", "微服务"] },
    ],
    tiers: [
      { label: "基础", skills: ["Go", "Java", "Python", "C/C++"] },
      { label: "工程", skills: ["MySQL", "Redis"] },
      { label: "方向", skills: ["分布式系统", "RPC", "微服务"] },
    ],
  },
  {
    id: "ai-agent",
    label: "AI Agent 工程师",
    shortLabel: "AI Agent",
    categoryKey: "ai_agent",
    color: "#ff6fd8",
    description: "把大模型、工具和知识连接成可执行的智能应用。",
    requiredSkills: ["LLM", "Agent", "Prompt Engineering", "Tool Use"],
    choiceGroups: [
      { label: "框架任选 1 项", min: 1, skills: ["RAG", "LangGraph", "CrewAI", "OpenClaw"] },
      { label: "语言任选 1 项", min: 1, skills: ["Python", "Go", "JS/TS"] },
    ],
    tiers: [
      { label: "基础", skills: ["Python", "Go", "JS/TS"] },
      { label: "工程", skills: ["LLM", "Agent", "Prompt Engineering", "Tool Use"] },
      { label: "方向", skills: ["RAG", "LangGraph", "CrewAI", "OpenClaw"] },
    ],
  },
  {
    id: "algorithm",
    label: "算法工程师",
    shortLabel: "算法",
    categoryKey: "algorithm",
    color: "#d96cff",
    description: "训练、评估并落地机器学习与深度学习模型。",
    requiredSkills: ["机器学习", "深度学习", "Python", "PyTorch"],
    choiceGroups: [
      { label: "领域任选 1 项", min: 1, skills: ["NLP", "CV", "推荐系统"] },
      { label: "模型任选 1 项", min: 1, skills: ["Transformer", "TensorFlow"] },
    ],
    tiers: [
      { label: "基础", skills: ["Python", "机器学习"] },
      { label: "工程", skills: ["深度学习", "PyTorch", "TensorFlow", "Transformer"] },
      { label: "方向", skills: ["NLP", "CV", "推荐系统"] },
    ],
  },
  {
    id: "data",
    label: "数据工程师",
    shortLabel: "数据工程",
    categoryKey: "data",
    color: "#4dd6ff",
    description: "建设可扩展的数据处理、分析与数仓体系。",
    requiredSkills: ["SQL", "Spark", "数据仓库"],
    choiceGroups: [
      { label: "计算任选 1 项", min: 1, skills: ["Hive", "Hadoop", "Flink"] },
      { label: "语言任选 1 项", min: 1, skills: ["Python", "Java", "Go"] },
      { label: "存储任选 1 项", min: 1, skills: ["数据湖", "ClickHouse", "Doris", "HBase"] },
    ],
    tiers: [
      { label: "基础", skills: ["SQL", "Python", "Java", "Go"] },
      { label: "工程", skills: ["Spark", "Hive", "Hadoop", "Flink"] },
      { label: "方向", skills: ["数据仓库", "数据湖", "ClickHouse", "Doris", "HBase"] },
    ],
  },
  {
    id: "sre",
    label: "SRE / 云原生工程师",
    shortLabel: "SRE",
    categoryKey: "ops",
    color: "#8ed36f",
    description: "用自动化、可观测性和云原生技术保障系统可靠性。",
    requiredSkills: ["Linux", "Docker", "Kubernetes", "监控告警"],
    choiceGroups: [
      { label: "语言任选 1 项", min: 1, skills: ["Python", "Go"] },
      { label: "治理任选 1 项", min: 1, skills: ["性能优化", "分布式系统"] },
    ],
    tiers: [
      { label: "基础", skills: ["Linux", "Python", "Go"] },
      { label: "工程", skills: ["Docker", "Kubernetes", "监控告警"] },
      { label: "方向", skills: ["性能优化", "分布式系统"] },
    ],
  },
  {
    id: "systems",
    label: "系统 / 网络工程师",
    shortLabel: "系统网络",
    categoryKey: "systems",
    color: "#9fb7d8",
    description: "深入操作系统、网络协议和高性能基础设施。",
    requiredSkills: ["C/C++", "Linux", "TCP/IP", "性能优化"],
    choiceGroups: [
      { label: "底层任选 1 项", min: 1, skills: ["RDMA", "PCIe", "驱动开发"] },
      { label: "系统任选 1 项", min: 1, skills: ["分布式系统", "监控告警"] },
    ],
    tiers: [
      { label: "基础", skills: ["C/C++", "Linux", "TCP/IP"] },
      { label: "工程", skills: ["性能优化", "监控告警", "分布式系统"] },
      { label: "方向", skills: ["RDMA", "PCIe", "驱动开发"] },
    ],
  },
  {
    id: "testing",
    label: "测试开发工程师",
    shortLabel: "测试开发",
    categoryKey: "testing",
    color: "#ff7474",
    description: "通过自动化、性能和稳定性体系持续保障质量。",
    requiredSkills: ["自动化测试", "性能优化", "监控告警"],
    choiceGroups: [
      { label: "语言任选 1 项", min: 1, skills: ["Python", "Java", "Go"] },
      { label: "环境任选 1 项", min: 1, skills: ["Linux", "Docker", "Kubernetes"] },
      { label: "系统任选 1 项", min: 1, skills: ["分布式系统", "RPC"] },
    ],
    tiers: [
      { label: "基础", skills: ["Python", "Java", "Go", "Linux"] },
      { label: "工程", skills: ["自动化测试", "Docker", "Kubernetes", "监控告警"] },
      { label: "方向", skills: ["性能优化", "分布式系统", "RPC"] },
    ],
  },
];

export function resolveCareerRoutes(graph, definitions = CAREER_ROUTE_DEFINITIONS) {
  const skillByLabel = new Map(graph.skills.map((skill) => [skill.label, skill]));
  const resolveSkill = (label) => {
    const skill = skillByLabel.get(label);
    if (!skill) throw new Error(`职业路线引用了不存在的技能：${label}`);
    return skill;
  };

  return definitions.map((definition) => ({
    ...definition,
    requiredSkills: definition.requiredSkills.map(resolveSkill),
    choiceGroups: definition.choiceGroups.map((group) => ({ ...group, skills: group.skills.map(resolveSkill) })),
    tiers: definition.tiers.map((tier) => ({ ...tier, skills: tier.skills.map(resolveSkill) })),
  }));
}

export function evaluateCareerRoute(route, masteredSkillIds) {
  const mastered = masteredSkillIds instanceof Set ? masteredSkillIds : new Set(masteredSkillIds);
  const requiredProgress = route.requiredSkills.filter((skill) => mastered.has(skill.id)).length;
  const choiceProgress = route.choiceGroups.map((group) => {
    const masteredCount = group.skills.filter((skill) => mastered.has(skill.id)).length;
    return {
      ...group,
      masteredCount,
      satisfied: masteredCount >= group.min,
      contribution: Math.min(masteredCount, group.min),
    };
  });
  const current = requiredProgress + choiceProgress.reduce((sum, group) => sum + group.contribution, 0);
  const total = route.requiredSkills.length + route.choiceGroups.reduce((sum, group) => sum + group.min, 0);
  const missingRequired = route.requiredSkills.filter((skill) => !mastered.has(skill.id));

  return {
    current,
    total,
    unlocked: missingRequired.length === 0 && choiceProgress.every((group) => group.satisfied),
    missingRequired,
    choiceGroups: choiceProgress,
  };
}

export function evaluateCareerRoutes(routes, masteredSkillIds) {
  return new Map(routes.map((route) => [route.id, evaluateCareerRoute(route, masteredSkillIds)]));
}
