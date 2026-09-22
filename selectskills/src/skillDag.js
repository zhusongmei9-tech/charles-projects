const EXCLUDED_CATEGORY_KEYS = new Set(["product", "other"]);
const PROGRAMMING_LANGUAGE_LABELS = new Set(["Python", "C/C++", "Go", "Java", "JS/TS", "Rust"]);
const SKILL_GROUPS = [
  { id: "languages", label: "基础语言", color: "#5b8cff", skills: ["Python", "C/C++", "Go", "Java", "JS/TS", "Rust"] },
  { id: "web-client", label: "Web 与客户端", color: "#32d6c7", skills: ["Android", "iOS", "Flutter", "Swift", "React", "Vue", "Svelte", "Webpack/Vite", "HTML/CSS", "JS/TS"] },
  { id: "backend", label: "后端架构", color: "#8b7cff", skills: ["分布式系统", "微服务", "RPC", "gRPC", "Protobuf", "Spring", "Nginx", "JS/TS", "Go", "Java", "MySQL", "Redis", "Kafka", "Elasticsearch", "MongoDB", "PostgreSQL"] },
  { id: "data", label: "数据工程", color: "#4dc9ff", skills: ["MySQL", "Redis", "NoSQL", "RocksDB", "Pika", "Ceph", "Kafka", "Spark", "Flink", "Hadoop", "Hive", "ClickHouse", "Doris", "HBase", "SQL", "数据仓库", "数据湖"] },
  { id: "cloud", label: "云原生环境", color: "#6ee7a8", skills: ["Kubernetes", "Docker", "监控告警", "Prometheus", "Grafana", "CI/CD", "Jenkins", "Linux"] },
  { id: "ai-model", label: "AI 模型与算法", color: "#cf67ff", skills: ["TensorFlow", "PyTorch", "Transformer", "NLP", "CV", "LLM", "Fine-Tuning", "SFT", "RL", "RLHF", "机器学习", "深度学习", "推荐系统", "Python", "CUDA", "Triton", "vLLM", "TensorRT", "DeepSpeed", "Megatron", "LoRA"] },
  { id: "ai-agent", label: "AI Agent 应用", color: "#ff66c4", skills: ["AIGC", "Multi Agent", "Agent Infra", "Tool Use", "Prompt Engineering", "LangGraph", "LangChain", "LlamaIndex", "AutoGen", "CrewAI", "OpenClaw", "Agent", "RAG", "ReAct", "LLM"] },
  { id: "systems", label: "系统、网络与硬件", color: "#ffad5c", skills: ["Linux", "RTOS", "Sensor", "驱动开发", "PCIe", "RDMA", "TCP/IP", "BGP", "VXLAN", "IDA", "WinDBG", "XPERF", "NVML", "NVIDIA-SMI", "CUDA-GDB", "C/C++", "Rust"] },
  { id: "quality", label: "测试与性能", color: "#ff6f78", skills: ["自动化测试", "性能优化", "CI/CD"] },
];

export function buildSkillDagModel(graph) {
  const categories = graph.categories
    .filter((category) => !EXCLUDED_CATEGORY_KEYS.has(category.key))
    .map((category) => ({
      ...category,
      combinations: (graph.skillTripleRankingByCategory.get(category.id) || []).slice(0, 3),
    }));
  const edges = categories.flatMap((category) => {
    const skillIds = new Set(category.combinations.flatMap((combination) => combination.skills.map((skill) => skill.id)));
    return [...skillIds].map((skillId) => ({
      id: `${skillId}->${category.id}`,
      skillId,
      categoryId: category.id,
    }));
  });
  const skillByLabel = new Map(graph.skills.map((skill) => [skill.label, skill]));
  const skillGroups = SKILL_GROUPS.map(({ skills, ...group }) => ({
    ...group,
    skills: skills.map((label) => skillByLabel.get(label)).filter(Boolean),
  }));
  const skillMemberships = new Map(graph.skills.map((skill) => [
    skill.id,
    skillGroups.filter((group) => group.skills.some((item) => item.id === skill.id)).map((group) => group.id),
  ]));

  return { categories, skills: graph.skills, skillGroups, skillMemberships, edges };
}

export function evaluateSkillDag(model, selectedSkillIds) {
  const selected = selectedSkillIds instanceof Set ? selectedSkillIds : new Set(selectedSkillIds);
  return model.categories
    .map((category) => {
      const combinations = category.combinations
        .map((combination) => {
          const matchedSkills = combination.skills.filter((skill) => selected.has(skill.id));
          return {
            ...combination,
            matchedSkills,
            missingSkills: combination.skills.filter((skill) => !selected.has(skill.id)),
            matchedCount: matchedSkills.length,
          };
        })
        .sort((a, b) => b.matchedCount - a.matchedCount || b.count - a.count);
      const best = combinations[0] || null;
      return {
        category,
        best,
        matchedCount: best?.matchedCount || 0,
        total: best?.skills.length || 3,
        unlocked: Boolean(best && best.missingSkills.length === 0),
      };
    })
    .sort((a, b) =>
      b.matchedCount / b.total - a.matchedCount / a.total ||
      (b.best?.count || 0) - (a.best?.count || 0) ||
      a.category.label.localeCompare(b.category.label),
    );
}

export function suggestedSkillRowsForCategory(graph, categoryId, selectedSkillIds, limit = 5) {
  const selected = selectedSkillIds instanceof Set ? selectedSkillIds : new Set(selectedSkillIds);
  const ranking = (graph.skillRankingByCategory.get(categoryId) || [])
    .filter((skill) => !selected.has(skill.id));
  const languages = ranking.filter((skill) => PROGRAMMING_LANGUAGE_LABELS.has(skill.label));
  const rows = [];
  let addedLanguages = false;

  ranking.forEach((skill) => {
    if (PROGRAMMING_LANGUAGE_LABELS.has(skill.label)) {
      if (!addedLanguages) {
        rows.push({
          id: `languages:${categoryId}`,
          label: `编程语言：${languages.map((language) => language.label).join(" / ")}`,
          countLabel: `${languages.length} 门`,
          isLanguageGroup: true,
        });
        addedLanguages = true;
      }
      return;
    }
    rows.push({ ...skill, countLabel: String(skill.count), isLanguageGroup: false });
  });

  return rows.slice(0, limit);
}
