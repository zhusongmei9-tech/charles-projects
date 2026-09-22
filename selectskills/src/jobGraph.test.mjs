import assert from "node:assert/strict";
import { test } from "node:test";
import jobsPayload from "../example.json" with { type: "json" };
import {
  buildJobGraph,
  classifyJob,
  cleanJobTitle,
  extractSkills,
  jobsMatchingAllSkills,
  rankSkillTriples,
  sortRelatedJobs,
} from "./jobGraph.js";

test("builds graph from example.json", () => {
  const graph = buildJobGraph(jobsPayload);

  assert.equal(graph.jobs.length, 490);
  assert.equal(graph.stats.completeJobs, 490);
  assert.ok(graph.categories.length >= 10);
  assert.ok(graph.skills.length > 20);
  assert.equal(graph.jobsByCategory.get("category:frontend").every((job) => job.categoryId === "category:frontend"), true);
});

test("classifies game development jobs as client", () => {
  assert.equal(classifyJob("抖音游戏研发专家", ""), "client");
  assert.equal(classifyJob("XR系统应用开发工程师", ""), "client");
});

test("classifies compiler infrastructure and high performance network jobs as systems", () => {
  assert.equal(classifyJob("RISC-V高级编译器工程师", ""), "systems");
  assert.equal(classifyJob("AI基础设施架构师/高级AI基础设施研究员", ""), "systems");
  assert.equal(classifyJob("高性能网络研发工程师", ""), "systems");
  assert.equal(classifyJob("AI性能优化工程师/专家", ""), "systems");
  assert.equal(classifyJob("系统内核工程师", ""), "systems");
  assert.equal(classifyJob("训练性能优化专家", ""), "systems");
  assert.equal(classifyJob("数据中心网络架构师", ""), "systems");
  assert.equal(classifyJob("弹性计算系统高级研发工程师/专家", ""), "systems");
  assert.equal(classifyJob("AI存储研发工程师", ""), "systems");
  assert.equal(classifyJob("高性能计算平台开发工程师", ""), "systems");
});

test("splits hardware jobs from system and network jobs", () => {
  assert.equal(classifyJob("GPU驱动开发工程师", ""), "hardware");
  assert.equal(classifyJob("芯片SoC硬件工程师", ""), "hardware");
  assert.equal(classifyJob("Linux内核系统软件工程师", ""), "systems");
});

test("classifies server-side test development jobs as testing", () => {
  assert.equal(classifyJob("测试开发工程师（服务端）", ""), "testing");
});

test("applies manual job category review overrides", () => {
  const graph = buildJobGraph({
    items: [
      { job_id: "7592888600183163141", title: "显示驱动工程师-PICO", description: "", requirement: "" },
      { job_id: "7582165993067874565", title: "高级测试开发工程师-AI芯片", description: "", requirement: "" },
    ],
  });

  assert.equal(graph.jobs[0].categoryKey, "systems");
  assert.equal(graph.jobs[1].categoryKey, "testing");
});

test("splits ai agent jobs from general algorithm", () => {
  assert.equal(classifyJob("大模型Agent算法工程师-火山方舟", ""), "ai_agent");
  assert.equal(classifyJob("后端开发工程师（AI Agent方向）-安全与风控", ""), "ai_agent");
  assert.equal(classifyJob("推荐算法工程师-番茄", ""), "algorithm");
});

test("classifies risk control algorithm engineer as algorithm", () => {
  assert.equal(classifyJob("信贷风控算法工程师-国际支付", ""), "algorithm");
  assert.equal(classifyJob("机器学习/检测算法高级工程师/专家-安全与风控", ""), "algorithm");
  assert.equal(classifyJob("机器流量反作弊算法工程师-Data", ""), "algorithm");
  assert.equal(classifyJob("高级算法工程师-抖音风控", ""), "algorithm");
});

test("merges database jobs into data category", () => {
  assert.equal(classifyJob("数据库管控资深架构师", ""), "data");
});

test("classifies CADD AI pharma jobs as other", () => {
  assert.equal(classifyJob("CADD专家-AI制药", ""), "other");
});

test("removes department suffix from displayed job titles", () => {
  assert.equal(cleanJobTitle("后端开发工程师-抖音直播"), "后端开发工程师");
  assert.equal(cleanJobTitle("机器流量反作弊算法工程师-Data"), "机器流量反作弊算法工程师");
  assert.equal(cleanJobTitle("前端开发工程师-TRAE"), "前端开发工程师");
  assert.equal(cleanJobTitle("AI-Agent 工程师"), "AI-Agent 工程师");
  assert.equal(cleanJobTitle("豆包后端开发工程师-抖音直播"), "后端开发工程师");
});

test("deduplicates aliases inside one job", () => {
  const skills = extractSkills("熟悉 Go / Golang / Go语言，了解 K8s 和 Kubernetes。");

  assert.equal(skills.filter((skill) => skill === "Go").length, 1);
  assert.equal(skills.filter((skill) => skill === "Kubernetes").length, 1);
});

test("merges Webpack and Vite into one skill per job", () => {
  assert.deepEqual(extractSkills("熟悉 Webpack 构建优化。"), ["Webpack/Vite"]);
  assert.deepEqual(extractSkills("熟悉 vite 工程化配置。"), ["Webpack/Vite"]);

  const skills = extractSkills("熟悉 Webpack 和 Vite 构建优化。");
  assert.equal(skills.filter((skill) => skill === "Webpack/Vite").length, 1);
});

test("merges JavaScript TypeScript and Node.js into JS/TS once per job", () => {
  assert.deepEqual(extractSkills("熟悉 JavaScript 开发。"), ["JS/TS"]);
  assert.deepEqual(extractSkills("熟悉 TypeScript 开发。"), ["JS/TS"]);
  assert.deepEqual(extractSkills("熟悉 Node.js 服务端开发。"), ["JS/TS"]);

  const skills = extractSkills("熟悉 JavaScript、TypeScript、NodeJS、JS 和 TS。");
  assert.equal(skills.filter((skill) => skill === "JS/TS").length, 1);
  assert.equal(skills.includes("Node.js"), false);
});

test("merges C and C++ into one skill per job", () => {
  assert.deepEqual(extractSkills("熟悉 C 开发。"), ["C/C++"]);
  assert.deepEqual(extractSkills("熟悉 C语言开发。"), ["C/C++"]);
  assert.deepEqual(extractSkills("熟悉 C++ 和 CPP 开发。"), ["C/C++"]);

  const skills = extractSkills("熟悉 C/C++ 系统开发。");
  assert.equal(skills.filter((skill) => skill === "C/C++").length, 1);
});

test("does not extract C from client-side product terms", () => {
  const skills = extractSkills("负责电商 C端、B/C端产品和用户体验建设。");

  assert.equal(skills.includes("C/C++"), false);
});

test("extracts ios swift and rust skills", () => {
  const skills = extractSkills("熟悉 IOS、Swift、Rust、Flutter 开发。");

  assert.ok(skills.includes("iOS"));
  assert.ok(skills.includes("Swift"));
  assert.ok(skills.includes("Rust"));
  assert.ok(skills.includes("Flutter"));
});

test("extracts mobile embedded and driver skills", () => {
  const skills = extractSkills("熟悉 Android/Linux/RTOS/Sensor/驱动开发。");

  assert.ok(skills.includes("Android"));
  assert.ok(skills.includes("Linux"));
  assert.ok(skills.includes("RTOS"));
  assert.ok(skills.includes("Sensor"));
  assert.ok(skills.includes("驱动开发"));
});

test("does not extract driver development from technology-driven phrases", () => {
  const skills = extractSkills("坚持技术驱动、数据驱动，并具备较强的自我驱动力。");

  assert.equal(skills.includes("驱动开发"), false);
});

test("extracts hardware io skills", () => {
  const skills = extractSkills("熟悉 PCIe、RDMA、TCP/IP、BGP、VXLAN 高性能通信。");

  assert.ok(skills.includes("PCIe"));
  assert.ok(skills.includes("RDMA"));
  assert.ok(skills.includes("TCP/IP"));
  assert.ok(skills.includes("BGP"));
  assert.ok(skills.includes("VXLAN"));
});

test("keeps ReAct and React as separate skills", () => {
  assert.deepEqual(extractSkills("熟悉 ReAct Agent 推理范式。").filter((skill) => /React|ReAct/.test(skill)), ["ReAct"]);
  assert.deepEqual(extractSkills("熟悉 React 前端框架。").filter((skill) => /React|ReAct/.test(skill)), ["React"]);
});

test("extracts Svelte as a frontend skill", () => {
  assert.ok(extractSkills("熟悉 Svelte 和现代前端工程化。").includes("Svelte"));
});

test("extracts reverse engineering and profiling tools", () => {
  const skills = extractSkills("熟悉 IDA/WinDBG/XPERF 等调试和性能分析工具。");

  assert.ok(skills.includes("IDA"));
  assert.ok(skills.includes("WinDBG"));
  assert.ok(skills.includes("XPERF"));
});

test("extracts nvidia gpu debugging tools", () => {
  const skills = extractSkills("熟悉 Nvml/NVIDIA-smi/CUDA-gdb 等 GPU 调试工具。");

  assert.ok(skills.includes("NVML"));
  assert.ok(skills.includes("NVIDIA-SMI"));
  assert.ok(skills.includes("CUDA-GDB"));
});

test("extracts storage middleware from slash-separated text", () => {
  const skills = extractSkills("熟悉 Redis/RocksDB/pika/Ceph/NoSQL 等存储组件。");

  assert.ok(skills.includes("Redis"));
  assert.ok(skills.includes("RocksDB"));
  assert.ok(skills.includes("Pika"));
  assert.ok(skills.includes("Ceph"));
  assert.ok(skills.includes("NoSQL"));
});

test("merges message queue mentions into Redis without double counting", () => {
  assert.deepEqual(extractSkills("熟悉消息队列和 MQ。"), ["Redis"]);

  const graph = buildJobGraph({
    items: [
      { job_id: "queue-only", title: "后端开发工程师", requirement: "熟悉消息队列" },
      { job_id: "redis-and-queue", title: "后端开发工程师", requirement: "熟悉 Redis 和 MQ" },
    ],
  });
  const redis = graph.skills.find((skill) => skill.label === "Redis");

  assert.equal(graph.skills.some((skill) => skill.label === "消息队列"), false);
  assert.equal(redis.count, 2);
});

test("extracts specific agent and AIGC skills independently", () => {
  const skills = extractSkills("负责 AIGC、Multi Agent、Agent Infra 和 Tool Use 能力建设。");

  assert.ok(skills.includes("AIGC"));
  assert.ok(skills.includes("Multi Agent"));
  assert.ok(skills.includes("Agent Infra"));
  assert.ok(skills.includes("Tool Use"));
  assert.ok(skills.includes("Agent"));
});

test("keeps RL and RLHF as separate skills", () => {
  const skills = extractSkills("熟悉 RL、RLHF 和强化学习训练流程。");

  assert.ok(skills.includes("RL"));
  assert.ok(skills.includes("RLHF"));
});

test("extracts Transformer skill", () => {
  const skills = extractSkills("熟悉 Transformer / Transformers 架构和训练优化。");

  assert.ok(skills.includes("Transformer"));
});

test("does not extract security risk control as a skill", () => {
  const skills = extractSkills("负责安全、风控、反作弊、反欺诈策略建设。");

  assert.equal(skills.includes("安全风控"), false);
});

test("does not extract search as a skill", () => {
  const skills = extractSkills("负责搜索引擎和 AI 搜索产品建设。");

  assert.equal(skills.includes("搜索"), false);
});

test("extracts prompt and agent framework skills", () => {
  const skills = extractSkills("有 Prompt engineering、Fine-Tuning、Lang Graph、CrewAI、OpenClaw 实践经验。");

  assert.ok(skills.includes("Prompt Engineering"));
  assert.ok(skills.includes("Fine-Tuning"));
  assert.ok(skills.includes("LangGraph"));
  assert.ok(skills.includes("CrewAI"));
  assert.ok(skills.includes("OpenClaw"));
});

test("scales category and skill radii by frequency", () => {
  const graph = buildJobGraph(jobsPayload);
  const backend = graph.categories.find((category) => category.key === "backend");
  const frontend = graph.categories.find((category) => category.key === "frontend");
  const other = graph.categories.find((category) => category.key === "other");
  const backendCount = graph.jobs.filter((job) => job.categoryId === backend.id).length;
  const frontendCount = graph.jobs.filter((job) => job.categoryId === frontend.id).length;
  const topSkill = graph.skills[0];
  const bottomSkill = graph.skills.at(-1);

  assert.ok(backend.radius > other.radius);
  assert.ok(backend.radius ** 3 > frontend.radius ** 3 * (backendCount / frontendCount) * 0.9);
  assert.ok(topSkill.radius > bottomSkill.radius);
});

test("builds category-specific skill colors and radii", () => {
  const graph = buildJobGraph(jobsPayload);
  const category = [...graph.categories].sort(
    (a, b) => (graph.skillRankingByCategory.get(a.id)?.length || 0) - (graph.skillRankingByCategory.get(b.id)?.length || 0),
  )[0];
  const ranking = graph.skillRankingByCategory.get(category.id);
  const categoryVisuals = graph.skillVisualsByCategory.get(category.id);
  const topSkill = ranking[0];
  const rankedIds = new Set(ranking.map((skill) => skill.id));
  const missingSkill = graph.skills.find((skill) => !rankedIds.has(skill.id));

  assert.equal(categoryVisuals.get(topSkill.id).count, topSkill.count);
  assert.equal(categoryVisuals.get(topSkill.id).color, "#ff5f57");
  assert.ok(Math.abs(categoryVisuals.get(topSkill.id).radius - 1.47) < 0.0001);
  assert.ok(missingSkill);
  assert.equal(categoryVisuals.get(missingSkill.id).count, 0);
  assert.equal(categoryVisuals.get(missingSkill.id).color, "#6ee7a8");
  assert.equal(categoryVisuals.get(missingSkill.id).radius, 0.42);
  assert.ok(graph.globalSkillVisuals.get(missingSkill.id).radius > categoryVisuals.get(missingSkill.id).radius);
});

test("places category ring in descending job count order", () => {
  const graph = buildJobGraph(jobsPayload);
  const positionedCategories = [...graph.categories].sort((a, b) => {
    const normalizedA = (Math.atan2(a.z, a.x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    const normalizedB = (Math.atan2(b.z, b.x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    return normalizedA - normalizedB;
  });
  const expectedCategories = [...graph.categories].sort((a, b) => {
    const countDiff = (graph.jobsByCategory.get(b.id)?.length || 0) - (graph.jobsByCategory.get(a.id)?.length || 0);
    return countDiff || a.label.localeCompare(b.label);
  });

  assert.deepEqual(
    positionedCategories.map((category) => category.id),
    expectedCategories.map((category) => category.id),
  );
});

test("assigns skill colors by frequency level", () => {
  const graph = buildJobGraph(jobsPayload);
  const topSkill = graph.skills[0];
  const bottomSkill = graph.skills.at(-1);

  assert.equal(topSkill.level, 4);
  assert.equal(topSkill.color, "#ff5f57");
  assert.equal(bottomSkill.level, 1);
  assert.equal(bottomSkill.color, "#6ee7a8");
});

test("assigns job colors by global skill count on a continuous heat scale", () => {
  const graph = buildJobGraph({
    items: [
      { job_id: "zero", title: "通用工程师", requirement: "" },
      { job_id: "one-a", title: "通用工程师", requirement: "Python" },
      { job_id: "one-b", title: "通用工程师", requirement: "Java" },
      { job_id: "two", title: "通用工程师", requirement: "Python Java" },
      { job_id: "four", title: "通用工程师", requirement: "Python Java Go Rust" },
      { job_id: "six", title: "通用工程师", requirement: "Python Java Go Rust C++ SQL" },
    ],
  });
  const colorByJobId = new Map(graph.jobs.map((job) => [job.jobId, job.color]));

  assert.equal(colorByJobId.get("zero"), "#6ee7a8");
  assert.equal(colorByJobId.get("one-a"), "#a2e884");
  assert.equal(colorByJobId.get("one-a"), colorByJobId.get("one-b"));
  assert.equal(colorByJobId.get("two"), "#d6e85f");
  assert.equal(colorByJobId.get("four"), "#ffb347");
  assert.equal(colorByJobId.get("six"), "#ff5f57");
});

test("indexes jobs by skill and category", () => {
  const graph = buildJobGraph(jobsPayload);
  const python = graph.skills.find((skill) => skill.label === "Python");
  const pythonJobs = graph.jobsBySkill.get(python.id);
  const groupedCount = [...graph.jobsBySkillAndCategory.get(python.id).values()].reduce((total, jobs) => total + jobs.length, 0);

  assert.equal(pythonJobs.length, python.count);
  assert.equal(groupedCount, python.count);
});

test("finds only jobs that contain every selected skill", () => {
  const graph = buildJobGraph({
    items: [
      { job_id: "python", title: "通用工程师", requirement: "Python" },
      { job_id: "java", title: "通用工程师", requirement: "Java" },
      { job_id: "both", title: "通用工程师", requirement: "Python Java" },
    ],
  });
  const python = graph.skills.find((skill) => skill.label === "Python");
  const java = graph.skills.find((skill) => skill.label === "Java");

  assert.deepEqual(jobsMatchingAllSkills(graph, [python.id, java.id]).map((job) => job.jobId), ["both"]);
});

test("ranks three-skill combinations and filters substitute piles", () => {
  const skills = ["Go", "Java", "MySQL", "Redis"].map((label) => ({ id: `skill:${label}`, label }));
  const nodeById = new Map(skills.map((skill) => [skill.id, skill]));
  const jobs = [
    { skillIds: ["skill:Go", "skill:MySQL", "skill:Redis"] },
    { skillIds: ["skill:Go", "skill:MySQL", "skill:Redis"] },
    { skillIds: ["skill:Go", "skill:Java", "skill:MySQL", "skill:Redis"] },
  ];

  const ranking = rankSkillTriples(jobs, nodeById);

  assert.deepEqual(ranking[0].skills.map((skill) => skill.label), ["Go", "MySQL", "Redis"]);
  assert.equal(ranking[0].count, 3);
  assert.equal(ranking[0].share, 1);
  assert.equal(ranking.some((combination) => combination.skills.every((skill) => ["Go", "Java", "MySQL"].includes(skill.label))), false);
});

test("builds category-specific three-skill rankings", () => {
  const graph = buildJobGraph({
    items: [
      { job_id: "one", title: "后端开发工程师", requirement: "Go MySQL Redis" },
      { job_id: "two", title: "后端开发工程师", requirement: "Go MySQL Redis Kafka" },
      { job_id: "three", title: "后端开发工程师", requirement: "Java MySQL Redis" },
    ],
  });
  const backendRanking = graph.skillTripleRankingByCategory.get("category:backend");

  assert.deepEqual(backendRanking[0].skills.map((skill) => skill.label), ["Go", "MySQL", "Redis"]);
  assert.equal(backendRanking[0].count, 2);
  assert.equal(backendRanking[0].share, 2 / 3);
});

test("adds JS/TS to every frontend job", () => {
  const graph = buildJobGraph(jobsPayload);
  const javascript = graph.skills.find((skill) => skill.label === "JS/TS");
  const frontendJobs = graph.jobsByCategory.get("category:frontend");
  const frontendJavaScriptJobs = graph.jobsBySkillAndCategory.get(javascript.id).get("category:frontend");

  assert.equal(frontendJavaScriptJobs.length, frontendJobs.length);
  assert.ok(javascript.count >= frontendJobs.length);
});

test("prioritizes full-stack titles only in frontend related jobs", () => {
  const jobs = [
    { id: "frontend", label: "前端开发工程师" },
    { id: "english", label: "Senior Full-Stack Engineer" },
    { id: "normal", label: "Web 工程师" },
    { id: "chinese", label: "全栈研发工程师" },
  ];

  assert.deepEqual(sortRelatedJobs(jobs, "frontend").map((job) => job.id), ["english", "chinese", "frontend", "normal"]);
  assert.deepEqual(sortRelatedJobs(jobs, "backend").map((job) => job.id), ["frontend", "english", "normal", "chinese"]);
});

test("handles empty descriptions and requirements", () => {
  const graph = buildJobGraph({
    items: [{ title: "前端开发工程师", job_id: "1", url: "", description: "", requirement: "" }],
  });

  assert.equal(graph.jobs.length, 1);
  assert.equal(graph.jobs[0].categoryId, "category:frontend");
  assert.equal(graph.stats.completeRate, 0);
});
