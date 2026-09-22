export const CATEGORY_RULES = [
  {
    id: "frontend",
    label: "前端",
    color: "#39c5bb",
    title: ["前端", "web", "Web", "React", "Vue"],
    body: ["JavaScript", "TypeScript", "React", "Vue", "Node.js", "HTML", "CSS"],
  },
  {
    id: "backend",
    label: "后端",
    color: "#5b8cff",
    title: ["后端", "服务端", "后台", "Server", "Golang", "Go", "Java", "Spring", "Spring Boot"],
    body: ["服务端", "分布式", "RPC", "gRPC", "微服务", "高并发", "Golang", "Java", "C++", "Spring", "Spring Boot", "Spring Cloud", "Nginx", "MQ", "消息队列", "RocketMQ"],
  },
  {
    id: "ops",
    label: "运维",
    color: "#8ed36f",
    title: ["运维", "SRE", "DevOps", "稳定性", "交付", "云原生", "容器", "K8s"],
    body: ["K8s", "Kubernetes", "Docker", "自动化部署", "稳定性治理", "监控", "告警", "Prometheus", "Grafana", "CI/CD", "Jenkins", "Helm", "Terraform", "Ansible", "GitLab"],
  },
  {
    id: "ai_agent",
    label: "AI&Agent",
    color: "#ff6fd8",
    title: ["AI Agent方向", "AI Agent", "大模型", "AIGC", "LLM", "Agent", "智能体", "RAG", "Prompt", "Fine-Tuning", "LangGraph", "LangChain", "CrewAI", "OpenClaw", "AI应用", "LlamaIndex", "AutoGen", "vLLM", "Triton"],
    body: [
      "大模型",
      "大语言模型",
      "AIGC",
      "LLM",
      "Agent",
      "智能体",
      "RAG",
      "Prompt Engineering",
      "Prompt engineering",
      "Fine-Tuning",
      "fine-tuning",
      "LangGraph",
      "Lang Chain",
      "LangChain",
      "CrewAI",
      "OpenClaw",
      "LlamaIndex",
      "Llama Index",
      "AutoGen",
      "vLLM",
      "Triton",
      "TensorRT",
      "DeepSpeed",
      "Megatron",
      "LoRA",
      "CUDA",
    ],
  },
  {
    id: "algorithm",
    label: "算法",
    color: "#d96cff",
    title: ["风控算法工程师", "检测算法", "反作弊算法", "高级算法工程师", "算法", "机器学习", "推荐", "搜索", "NLP", "CV"],
    body: ["机器学习", "深度学习", "推荐算法", "Transformer", "PyTorch", "TensorFlow"],
  },
  {
    id: "testing",
    label: "测试",
    color: "#ff7474",
    title: ["测试开发工程师", "测试开发", "测试", "质量", "QA"],
    body: ["测试开发", "自动化测试", "质量保障", "测试用例", "缺陷", "灰度"],
  },
  {
    id: "security",
    label: "安全",
    color: "#ff9861",
    title: ["安全", "风控", "反作弊", "隐私", "合规"],
    body: ["安全", "风控", "反欺诈", "反作弊", "权限", "漏洞", "隐私"],
  },
  {
    id: "data",
    label: "数据",
    color: "#4dd6ff",
    title: ["数据", "大数据", "数仓", "BI", "Data", "数据库", "DBA", "MySQL", "Redis", "HBase", "ClickHouse", "ByteTable", "MongoDB", "Elasticsearch", "ES"],
    body: ["Spark", "Flink", "Hadoop", "Hive", "数据湖", "数据仓库", "数据分析", "ETL", "数据库", "MySQL", "Redis", "HBase", "ClickHouse", "Doris", "OLAP", "SQL", "MongoDB", "Elasticsearch", "PostgreSQL"],
  },
  {
    id: "client",
    label: "客户端",
    color: "#7bdf9b",
    title: ["客户端", "Android", "iOS", "Flutter", "移动端", "跨端", "Camera", "游戏研发", "游戏开发", "游戏客户端", "XR"],
    body: ["Android", "iOS", "Flutter", "移动端", "跨平台", "端侧", "相机", "游戏研发", "游戏开发", "游戏客户端", "XR"],
  },
  {
    id: "hardware",
    label: "硬件",
    color: "#c7ccd6",
    title: ["芯片", "SoC", "NPU", "GPU", "硬件", "PCIe", "DMA", "驱动"],
    body: ["芯片", "SoC", "NPU", "GPU", "硬件", "PCIe", "DMA", "驱动", "Sensor", "传感器"],
  },
  {
    id: "systems",
    label: "系统/网络",
    color: "#9fb7d8",
    title: ["Linux", "内核", "系统内核", "系统软件", "弹性计算系统", "高性能计算平台", "AI存储", "RISC-V", "编译器", "AI基础设施", "高性能网络", "数据中心网络", "网络研发", "网络", "AI性能优化", "训练性能优化"],
    body: ["Linux内核", "系统内核", "系统软件", "弹性计算系统", "高性能计算平台", "AI存储", "RISC-V", "编译器", "AI基础设施", "高性能网络", "数据中心网络", "网络协议", "网络研发", "高性能通信", "AI性能优化", "训练性能优化"],
  },
  {
    id: "product",
    label: "产品/项目",
    color: "#ffe066",
    title: ["产品", "项目", "PM", "解决方案", "交付"],
    body: ["产品设计", "项目管理", "需求分析", "客户", "解决方案"],
  },
];

export const OTHER_CATEGORY = {
  id: "other",
  label: "其他",
  color: "#9aa4b2",
  title: [],
  body: [],
};

const JOB_CATEGORY_OVERRIDES = new Map([
  ["7592888600183163141", "systems"],
  ["7582540133448173829", "systems"],
  ["7545071295689263367", "systems"],
  ["7535723120025454855", "systems"],
  ["7506356839475808519", "systems"],
  ["7483354724784670994", "systems"],
  ["7103498806301509919", "systems"],
  ["7654903858576034053", "systems"],
  ["7431586759971146023", "systems"],
  ["7496016995936373000", "systems"],
  ["7630814091124328757", "systems"],
  ["7629638570849323317", "systems"],
  ["7623376910307641605", "systems"],
  ["7366450100144523570", "systems"],
  ["7542438897859938568", "systems"],
  ["7647381821422029061", "systems"],
  ["7599960070339987765", "systems"],
  ["7649232613291247925", "systems"],
  ["7649232361355839797", "systems"],
  ["7649230345385691397", "systems"],
  ["7649230264456366389", "systems"],
  ["7649228574625417525", "systems"],
  ["7649227839954864437", "systems"],
  ["7647747126361131317", "systems"],
  ["7628882548761610501", "systems"],
  ["7622955042161248565", "systems"],
  ["7622954227891865909", "systems"],
  ["7622953785719802165", "systems"],
  ["7622952931436841269", "systems"],
  ["7261946883973974332", "systems"],
  ["6792568569717590286", "systems"],
  ["7582165993067874565", "testing"],
  ["7582165993066662149", "testing"],
  ["7582165348822550837", "testing"],
  ["7582165348083763509", "testing"],
]);

export const SKILL_RULES = [
  ["Python", ["Python"]],
  ["Java", ["Java"]],
  ["Go", ["Golang", "Go语言", "Go"]],
  ["C/C++", ["C++", "CPP", "C语言", { term: "C", excludeSuffixes: ["端"] }]],
  ["JS/TS", ["JavaScript", "TypeScript", "JS", "TS", "Node.js", "NodeJS", "Node"]],
  ["iOS", ["iOS", "IOS"]],
  ["Android", ["Android"]],
  ["Flutter", ["Flutter"]],
  ["Swift", ["Swift"]],
  ["Rust", ["Rust"]],
  ["React", [{ term: "React", caseSensitive: true }, { term: "react", caseSensitive: true }]],
  ["ReAct", [{ term: "ReAct", caseSensitive: true }]],
  ["Vue", ["Vue"]],
  ["Svelte", ["Svelte"]],
  ["Webpack/Vite", ["Webpack", "Vite"]],
  ["HTML/CSS", ["HTML", "CSS"]],
  ["Linux", ["Linux"]],
  ["RTOS", ["RTOS"]],
  ["Sensor", ["Sensor", "传感器"]],
  ["驱动开发", ["驱动开发"]],
  ["PCIe", ["PCIe", "PCIE"]],
  ["RDMA", ["RDMA"]],
  ["TCP/IP", ["TCP/IP", "TCP IP", "TCPIP"]],
  ["BGP", ["BGP"]],
  ["VXLAN", ["VXLAN", "VxLAN"]],
  ["MySQL", ["MySQL", "Mysql"]],
  ["Redis", ["Redis", "消息队列", "MQ"]],
  ["NoSQL", ["NoSQL", "NOSQL", "nosql"]],
  ["RocksDB", ["RocksDB", "Rocks DB"]],
  ["Pika", ["Pika", "pika"]],
  ["Ceph", ["Ceph"]],
  ["Kafka", ["Kafka"]],
  ["Spark", ["Spark"]],
  ["Flink", ["Flink"]],
  ["Hadoop", ["Hadoop"]],
  ["Hive", ["Hive"]],
  ["ClickHouse", ["ClickHouse"]],
  ["Doris", ["Doris"]],
  ["HBase", ["HBase"]],
  ["Kubernetes", ["Kubernetes", "K8s"]],
  ["Docker", ["Docker"]],
  ["TensorFlow", ["TensorFlow"]],
  ["PyTorch", ["PyTorch", "Pytorch"]],
  ["Transformer", ["Transformer", "Transformers"]],
  ["NLP", ["NLP", "自然语言处理"]],
  ["CV", ["CV", "计算机视觉"]],
  ["LLM", ["LLM", "大语言模型", "大模型"]],
  ["AIGC", ["AIGC", "生成式"]],
  ["Multi Agent", ["Multi Agent", "Multi-Agent", "多智能体", "多Agent"]],
  ["Agent Infra", ["Agent Infra", "Agent Infrastructure", "Agent基础设施", "Agent 基础设施"]],
  ["Tool Use", ["Tool Use", "Tool-Use", "工具使用", "工具调用"]],
  ["Prompt Engineering", ["Prompt Engineering", "Prompt engineering", "提示词工程"]],
  ["Fine-Tuning", ["Fine-Tuning", "Fine Tuning", "fine-tuning", "fine tuning", "微调"]],
  ["LangGraph", ["LangGraph", "Lang Graph"]],
  ["CrewAI", ["CrewAI", "Crew AI"]],
  ["OpenClaw", ["OpenClaw", "Open Claw"]],
  ["Agent", ["Agent", "智能体"]],
  ["RAG", ["RAG", "检索增强"]],
  ["SFT", ["SFT"]],
  ["RL", ["RL", "强化学习", "Reinforcement Learning"]],
  ["RLHF", ["RLHF"]],
  ["SQL", ["SQL"]],
  ["分布式系统", ["分布式系统", "分布式"]],
  ["微服务", ["微服务"]],
  ["RPC", ["RPC"]],
  ["机器学习", ["机器学习", "ML"]],
  ["深度学习", ["深度学习"]],
  ["推荐系统", ["推荐系统", "推荐算法"]],
  ["数据仓库", ["数据仓库", "数仓"]],
  ["数据湖", ["数据湖", "湖仓"]],
  ["自动化测试", ["自动化测试", "测试自动化"]],
  ["性能优化", ["性能优化", "性能调优"]],
  ["监控告警", ["监控", "告警", "可观测性"]],
  ["IDA", ["IDA", "IDA Pro"]],
  ["WinDBG", ["WinDBG", "WinDbg"]],
  ["XPERF", ["XPERF", "xperf"]],
  ["NVML", ["NVML", "Nvml", "nvml"]],
  ["NVIDIA-SMI", ["NVIDIA-SMI", "NVIDIA-smi", "nvidia-smi"]],
  ["CUDA", ["CUDA"]],
  ["Triton", ["Triton Inference Server", "Triton Server", "Triton"]],
  ["vLLM", ["vLLM"]],
  ["TensorRT", ["TensorRT", "Tensor RT"]],
  ["DeepSpeed", ["DeepSpeed", "Deep Speed"]],
  ["Megatron", ["Megatron", "Megatron-LM"]],
  ["LoRA", ["LoRA", "Low-Rank Adaptation"]],
  ["LangChain", ["LangChain", "Lang Chain"]],
  ["LlamaIndex", ["LlamaIndex", "Llama Index"]],
  ["AutoGen", ["AutoGen"]],
  ["MongoDB", ["MongoDB", "Mongo DB"]],
  ["PostgreSQL", ["PostgreSQL", "Postgres"]],
  ["Elasticsearch", ["Elasticsearch", "ES搜索引擎", "Elastic Search"]],
  ["Prometheus", ["Prometheus"]],
  ["Grafana", ["Grafana"]],
  ["CI/CD", ["CI/CD", "CI / CD", "持续集成", "持续交付"]],
  ["Jenkins", ["Jenkins"]],
  ["Nginx", ["Nginx"]],
  ["gRPC", ["gRPC", "GRPC"]],
  ["Protobuf", ["Protobuf", "Protocol Buffers", "Proto Buffer"]],
  ["Spring", ["Spring Boot", "Spring Cloud", "Spring框架", "Spring"]],
  ["CUDA-GDB", ["CUDA-GDB", "CUDA-gdb", "cuda-gdb"]],
];

const allCategories = [...CATEGORY_RULES, OTHER_CATEGORY];
const SKILL_LEVEL_COLORS = ["#6ee7a8", "#d6e85f", "#ffb347", "#ff5f57"];
const SKILL_COMBINATION_EXCLUSIVE_GROUPS = [
  new Set(["Python", "Java", "Go", "C/C++", "JS/TS", "Rust", "Swift"]),
  new Set(["React", "Vue", "Svelte"]),
  new Set(["PyTorch", "TensorFlow"]),
];

export function buildJobGraph(payload) {
  const sourceItems = Array.isArray(payload) ? payload : payload?.items || [];
  const categories = allCategories.map((rule, index) => ({
    id: `category:${rule.id}`,
    key: rule.id,
    type: "category",
    label: rule.label,
    color: rule.color,
    layer: 1,
    index,
  }));

  const categoryByKey = new Map(categories.map((category) => [category.key, category]));
  const skillMap = new Map();
  const jobs = [];
  const links = [];
  const jobsByCategory = new Map(categories.map((category) => [category.id, []]));
  const jobsBySkill = new Map();
  const jobsBySkillAndCategory = new Map();
  const skillCountByCategory = new Map(categories.map((category) => [category.id, new Map()]));
  const globalSkillCount = new Map();

  for (const [index, item] of sourceItems.entries()) {
    const title = cleanText(item?.title);
    const displayTitle = cleanJobTitle(title);
    const description = cleanText(item?.description);
    const requirement = cleanText(item?.requirement);
    const text = `${title}\n${description}\n${requirement}`;
    const categoryKey = JOB_CATEGORY_OVERRIDES.get(String(item?.job_id || "")) || classifyJob(title, `${description}\n${requirement}`);
    const category = categoryByKey.get(categoryKey) || categoryByKey.get("other");
    const skillLabels = new Set(extractSkills(text));
    if (category.key === "frontend") {
      skillLabels.add("JS/TS");
    }
    const companyKey = cleanText(item?.company_key);
    const company = cleanText(item?.company);
    const sourceJobId = item?.job_id || index;
    const jobId = `job:${companyKey ? `${companyKey}:` : ""}${sourceJobId}`;

    const job = {
      id: jobId,
      type: "job",
      label: displayTitle || title || `未命名岗位 ${index + 1}`,
      rawTitle: title,
      jobId: item?.job_id || "",
      displayJobId: item?.display_job_id || "",
      company,
      companyKey,
      url: item?.url || "",
      description,
      requirement,
      location: cleanText(item?.location),
      department: cleanText(item?.department),
      categoryId: category.id,
      categoryKey: category.key,
      skillIds: [],
      layer: 0,
      index,
    };

    jobs.push(job);
    jobsByCategory.get(category.id).push(job);
    links.push({ id: `${category.id}->${job.id}`, source: category.id, target: job.id, type: "category-job" });

    for (const label of skillLabels) {
      const id = `skill:${slugify(label)}`;
      if (!skillMap.has(id)) {
        skillMap.set(id, {
          id,
          type: "skill",
          label,
          color: "#f8f4df",
          count: 0,
          layer: -1,
          index: skillMap.size,
        });
      }

      const skill = skillMap.get(id);
      skill.count += 1;
      job.skillIds.push(id);
      if (!jobsBySkill.has(id)) jobsBySkill.set(id, []);
      jobsBySkill.get(id).push(job);
      if (!jobsBySkillAndCategory.has(id)) jobsBySkillAndCategory.set(id, new Map());
      const skillCategoryMap = jobsBySkillAndCategory.get(id);
      if (!skillCategoryMap.has(category.id)) skillCategoryMap.set(category.id, []);
      skillCategoryMap.get(category.id).push(job);
      links.push({ id: `${job.id}->${id}`, source: job.id, target: id, type: "job-skill" });
      increment(globalSkillCount, id);
      increment(skillCountByCategory.get(category.id), id);
    }
  }

  const skills = [...skillMap.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  skills.forEach((skill, index) => {
    skill.index = index;
  });

  const nodes = [...categories, ...jobs, ...skills];
  assignPositions(categories, jobs, skills, jobsByCategory);

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const globalSkillRanking = rankingFromCounts(globalSkillCount, nodeById);
  const skillRankingByCategory = new Map(
    categories.map((category) => [category.id, rankingFromCounts(skillCountByCategory.get(category.id), nodeById)]),
  );
  const skillTripleRankingByCategory = new Map(
    categories.map((category) => [category.id, rankSkillTriples(jobsByCategory.get(category.id), nodeById)]),
  );
  const globalSkillVisuals = buildSkillVisualMap(skills, globalSkillCount);
  const skillVisualsByCategory = new Map(
    categories.map((category) => [category.id, buildSkillVisualMap(skills, skillCountByCategory.get(category.id))]),
  );

  return {
    categories,
    jobs,
    skills,
    nodes,
    links,
    nodeById,
    jobsByCategory,
    jobsBySkill,
    jobsBySkillAndCategory,
    globalSkillRanking,
    skillRankingByCategory,
    skillTripleRankingByCategory,
    globalSkillVisuals,
    skillVisualsByCategory,
    stats: {
      totalJobs: jobs.length,
      completeJobs: sourceItems.filter((item) => cleanText(item?.description) && cleanText(item?.requirement)).length,
      completeRate: jobs.length
        ? Math.round((sourceItems.filter((item) => cleanText(item?.description) && cleanText(item?.requirement)).length / jobs.length) * 100)
        : 0,
      sourceUrl: payload?.source_url || "",
      companies: new Set(sourceItems.map((item) => cleanText(item?.company)).filter(Boolean)).size,
    },
  };
}

export function classifyJob(title, body) {
  if (isOtherDomainJob(title)) {
    return OTHER_CATEGORY.id;
  }

  let winner = OTHER_CATEGORY.id;
  let bestScore = 0;

  for (let index = 0; index < CATEGORY_RULES.length; index += 1) {
    const rule = CATEGORY_RULES[index];
    const titleHits = countHits(title, rule.title);
    const bodyHits = countHits(body, rule.body);
    const score = titleHits * 4 + bodyHits;
    if (score > bestScore) {
      bestScore = score;
      winner = rule.id;
    }
  }

  return winner;
}

export function cleanJobTitle(title) {
  const normalized = cleanText(title);
  const separatorIndex = findDepartmentSeparator(normalized);
  if (separatorIndex < 0) return normalized.replaceAll("豆包", "").trim();

  const suffix = normalized.slice(separatorIndex).replace(/^\s*[-－–—]\s*/, "").trim();
  if (!looksLikeDepartmentSuffix(suffix)) return normalized.replaceAll("豆包", "").trim();
  return normalized.slice(0, separatorIndex).replaceAll("豆包", "").trim();
}

function findDepartmentSeparator(title) {
  const separators = title.matchAll(/[-－–—]/g);
  for (const match of separators) {
    const index = match.index;
    const before = title[index - 1] || "";
    const after = title[index + 1] || "";
    if (/[A-Za-z]/.test(before) && /[A-Za-z]/.test(after)) continue;
    return title.slice(0, index).trimEnd().length;
  }
  return -1;
}

function looksLikeDepartmentSuffix(suffix) {
  if (!suffix) return false;
  if (/[\u4e00-\u9fff]/.test(suffix)) return true;
  return /^(Data|TikTok|CapCut|Lark|PICO|Seed|Flow|Live|Ecommerce|Ads|Global|TRAE)$/i.test(suffix);
}

function isOtherDomainJob(title) {
  return ["CADD", "AI制药", "AI 制药"].some((term) => aliasMatches(title, term));
}

export function extractSkills(text) {
  const found = new Set();
  for (const [label, aliases] of SKILL_RULES) {
    if (aliases.some((alias) => aliasMatches(text, alias))) {
      found.add(label);
    }
  }
  return [...found];
}

export function jobsMatchingAllSkills(graph, skillIds) {
  if (!skillIds.length) return [];
  const [firstSkillId, ...remainingSkillIds] = skillIds;
  return (graph.jobsBySkill.get(firstSkillId) || []).filter((job) =>
    remainingSkillIds.every((skillId) => job.skillIds.includes(skillId)),
  );
}

export function sortRelatedJobs(jobs, categoryKey) {
  if (categoryKey !== "frontend") return jobs;
  const isFullStack = (job) => /全栈|full[-_\s]*stack/i.test(job.label || job.rawTitle || "");
  return [...jobs].sort((a, b) => Number(isFullStack(b)) - Number(isFullStack(a)));
}

export function rankSkillTriples(jobs, nodeById) {
  const counts = new Map();

  for (const job of jobs) {
    const skills = [...new Set(job.skillIds)]
      .map((skillId) => nodeById.get(skillId))
      .filter(Boolean);

    for (let first = 0; first < skills.length - 2; first += 1) {
      for (let second = first + 1; second < skills.length - 1; second += 1) {
        for (let third = second + 1; third < skills.length; third += 1) {
          const combination = [skills[first], skills[second], skills[third]].sort((a, b) =>
            a.label.localeCompare(b.label, "zh-CN"),
          );
          const labels = combination.map((skill) => skill.label);
          const hasExclusiveOverlap = SKILL_COMBINATION_EXCLUSIVE_GROUPS.some(
            (group) => labels.filter((label) => group.has(label)).length > 1,
          );
          if (hasExclusiveOverlap) continue;

          const id = combination.map((skill) => skill.id).join("|");
          const current = counts.get(id);
          counts.set(id, current ? { ...current, count: current.count + 1 } : { id, skills: combination, count: 1 });
        }
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .map((combination) => ({
      ...combination,
      share: jobs.length ? combination.count / jobs.length : 0,
    }));
}

function assignPositions(categories, jobs, skills, jobsByCategory) {
  const categoryRadius = 34;
  const jobRadiusBase = 13;
  const skillRadius = Math.max(34, Math.sqrt(skills.length) * 3.4);
  const categoryCounts = categories.map((category) => jobsByCategory.get(category.id)?.length || 0);
  const maxCategoryCount = Math.max(...categoryCounts, 1);
  const maxJobSkillCount = Math.max(...jobs.map((job) => job.skillIds.length), 0);
  const maxSkillCount = Math.max(...skills.map((skill) => skill.count), 1);

  const categoriesBySize = [...categories].sort((a, b) => {
    const countDiff = (jobsByCategory.get(b.id)?.length || 0) - (jobsByCategory.get(a.id)?.length || 0);
    return countDiff || a.label.localeCompare(b.label);
  });

  categoriesBySize.forEach((category, index) => {
    const jobCount = jobsByCategory.get(category.id)?.length || 0;
    const angle = (index / categoriesBySize.length) * Math.PI * 2 - Math.PI / 2;
    category.x = Math.cos(angle) * categoryRadius;
    category.y = 26;
    category.z = Math.sin(angle) * categoryRadius;
    category.radius = Math.max(0.82, Math.cbrt(Math.max(jobCount, 1) / maxCategoryCount) * 3.08);
  });

  for (const category of categories) {
    const categoryJobs = jobsByCategory.get(category.id) || [];
    const columns = Math.max(4, Math.ceil(Math.sqrt(categoryJobs.length)));
    const spread = Math.max(jobRadiusBase, Math.sqrt(categoryJobs.length) * 2.1);
    categoryJobs.forEach((job, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const localX = (col - (columns - 1) / 2) * (spread / columns);
      const localZ = (row - Math.ceil(categoryJobs.length / columns) / 2) * (spread / columns);
      job.x = category.x * 0.45 + localX;
      job.y = 0 + ((index % 5) - 2) * 0.7;
      job.z = category.z * 0.45 + localZ;
      job.color = heatColor(job.skillIds.length, maxJobSkillCount);
      job.radius = 0.82;
    });
  }

  skills.forEach((skill, index) => {
    const angle = (index / Math.max(skills.length, 1)) * Math.PI * 2;
    const ring = 0.35 + (index % 5) * 0.16;
    const visual = skillVisual(skill.count, maxSkillCount);
    skill.x = Math.cos(angle) * skillRadius * ring;
    skill.y = -26 - (index % 4) * 0.8;
    skill.z = Math.sin(angle) * skillRadius * ring;
    skill.level = visual.level;
    skill.color = visual.color;
    skill.radius = visual.radius;
  });

  repelLayer(jobs, 1.45, 36);
  repelLayer(skills, 1.05, 32);
}

function skillLevel(count, maxCount) {
  if (maxCount <= 1) return 0;
  const ratio = count / maxCount;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.45) return 2;
  if (ratio >= 0.18) return 1;
  return 0;
}

function skillVisual(count, maxCount) {
  const level = skillLevel(count, maxCount);
  return {
    count,
    level: level + 1,
    color: SKILL_LEVEL_COLORS[level],
    radius: 0.42 + Math.sqrt(count / maxCount) * 1.05,
  };
}

function heatColor(count, maxCount) {
  const ratio = maxCount > 0 ? Math.min(Math.max(count / maxCount, 0), 1) : 0;
  const position = ratio * (SKILL_LEVEL_COLORS.length - 1);
  const startIndex = Math.floor(position);
  const endIndex = Math.min(startIndex + 1, SKILL_LEVEL_COLORS.length - 1);
  return interpolateHexColor(SKILL_LEVEL_COLORS[startIndex], SKILL_LEVEL_COLORS[endIndex], position - startIndex);
}

function interpolateHexColor(start, end, amount) {
  const startValue = Number.parseInt(start.slice(1), 16);
  const endValue = Number.parseInt(end.slice(1), 16);
  const channels = [16, 8, 0].map((shift) => {
    const startChannel = (startValue >> shift) & 0xff;
    const endChannel = (endValue >> shift) & 0xff;
    return Math.round(startChannel + (endChannel - startChannel) * amount);
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function buildSkillVisualMap(skills, counts) {
  const maxCount = Math.max(...counts.values(), 1);
  return new Map(
    skills.map((skill) => {
      const count = counts.get(skill.id) || 0;
      return [skill.id, skillVisual(count, maxCount)];
    }),
  );
}

function repelLayer(nodes, minDistance, rounds) {
  for (let round = 0; round < rounds; round += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const distance = Math.sqrt(dx * dx + dz * dz) || 0.001;
        if (distance < minDistance) {
          const push = (minDistance - distance) * 0.08;
          const nx = dx / distance;
          const nz = dz / distance;
          a.x -= nx * push;
          a.z -= nz * push;
          b.x += nx * push;
          b.z += nz * push;
        }
      }
    }
  }
}

function rankingFromCounts(counts, nodeById) {
  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: nodeById.get(id)?.label || id, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function countHits(text, terms) {
  return terms.reduce((total, term) => total + (aliasMatches(text, term) ? 1 : 0), 0);
}

function aliasMatches(text, aliasConfig) {
  const alias = typeof aliasConfig === "string" ? aliasConfig : aliasConfig.term;
  const flags = typeof aliasConfig === "string" || !aliasConfig.caseSensitive ? "i" : "";
  if (!text || !alias) return false;
  if (/^[A-Za-z0-9.+#-]+$/.test(alias)) {
    const escaped = escapeRegExp(alias);
    const excludeSuffixes = typeof aliasConfig === "string" ? [] : aliasConfig.excludeSuffixes || [];
    const suffixGuard = excludeSuffixes.length
      ? `(?!\\s*(?:${excludeSuffixes.map(escapeRegExp).join("|")}))`
      : "";
    return new RegExp(`(^|[^A-Za-z0-9.+#-])${escaped}${suffixGuard}([^A-Za-z0-9.+#-]|$)`, flags).test(text);
  }
  return flags === "i" ? text.toLowerCase().includes(alias.toLowerCase()) : text.includes(alias);
}

function cleanText(value) {
  return String(value || "").replace(/\u200b/g, "").trim();
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function slugify(value) {
  return encodeURIComponent(value).replace(/%/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
