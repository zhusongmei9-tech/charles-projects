export const PRODUCT_ROLE_CATEGORIES = [
  {
    id: "product_manager",
    label: "产品经理",
    color: "#ffe066",
    title: [
      "产品经理",
      "Product Manager",
      "产品负责人",
      "产品专家",
      "产品策划",
      "产品规划",
      "策略产品",
      "商业化产品",
      "平台产品",
      "B端产品",
      "C端产品",
      "数据产品",
      "AI产品",
    ],
    body: ["产品规划", "产品设计", "需求分析", "需求洞察", "PRD", "原型设计"],
  },
  {
    id: "data_analysis",
    label: "数据分析",
    color: "#4dd6ff",
    title: [
      "数据分析",
      "经营分析",
      "商业分析",
      "策略分析",
      "产品分析",
      "用户分析",
      "指标分析",
      "BI",
      "Data Analyst",
      "数据科学家",
      "数据科学",
      "数据洞察",
    ],
    body: ["SQL", "BI", "统计分析", "指标体系", "数据洞察", "经营分析", "商业分析"],
  },
  {
    id: "project_management",
    label: "项目管理",
    color: "#8b7cff",
    title: [
      "项目经理",
      "项目管理",
      "项目负责人",
      "PMO",
      "Program Manager",
      "Project Manager",
      "交付经理",
      "项目交付",
      "实施顾问",
      "实施经理",
      "流程规划",
      "流程管理",
      "计划交付",
      "资源交付",
    ],
    body: ["项目管理", "进度管理", "风险管理", "资源协调", "交付管理", "流程优化"],
  },
  {
    id: "operations",
    label: "运营",
    color: "#6ee7a8",
    title: [
      "运营",
      "增长",
      "SEO",
      "活动策划",
      "内容策略",
      "内容生态",
      "用户增长",
      "商家运营",
      "达人运营",
      "创作者运营",
      "社区运营",
      "社群运营",
      "治理策略",
      "审核",
      "流量策略",
    ],
    body: ["活动运营", "用户运营", "内容运营", "增长策略", "转化", "留存", "拉新", "SOP", "治理"],
  },
  {
    id: "design",
    label: "设计",
    color: "#ff8cc6",
    title: ["设计师", "设计专家", "设计负责人", "视觉设计", "交互设计", "体验设计", "UX", "UI", "Designer", "美术", "动效", "创意设计", "品牌设计"],
    body: ["视觉设计", "交互设计", "用户体验", "设计系统", "Figma", "Sketch"],
  },
];

export const PRODUCT_ROLE_OTHER_CATEGORY = {
  id: "other",
  label: "其他",
  color: "#9aa4b2",
  title: [],
  body: [],
};

export const PRODUCT_ROLE_ABILITIES = [
  ["需求分析", ["需求分析", "需求梳理", "需求洞察", "需求调研", "需求评审"]],
  ["产品设计", ["产品设计", "产品方案", "功能设计", "产品架构", "产品规划"]],
  ["PRD", ["PRD", "产品文档"]],
  ["原型设计", ["原型设计", "Axure", "墨刀"]],
  ["用户研究", ["用户研究", "用户调研", "用户洞察", "用户访谈"]],
  ["竞品分析", ["竞品分析", "行业分析", "市场分析"]],
  ["指标体系", ["指标体系", "指标建设", "指标设计", "北极星指标"]],
  ["A/B实验", ["A/B", "AB实验", "A/B实验", "实验设计"]],
  ["数据分析", ["数据分析", "数据洞察", "数据驱动", "SQL分析"]],
  ["SQL", ["SQL"]],
  ["Python", ["Python"]],
  ["BI", ["BI", "Tableau", "Power BI", "可视化看板", "数据看板"]],
  ["统计分析", ["统计分析", "统计学", "因果推断", "假设检验"]],
  ["经营分析", ["经营分析", "经营诊断", "经营复盘"]],
  ["商业分析", ["商业分析", "商业化分析", "商业洞察"]],
  ["策略制定", ["策略制定", "策略设计", "策略优化", "策略迭代"]],
  ["项目管理", ["项目管理", "项目推进", "项目统筹"]],
  ["进度管理", ["进度管理", "进度跟踪", "里程碑"]],
  ["风险管理", ["风险管理", "风险识别", "风险评估"]],
  ["资源协调", ["资源协调", "跨团队", "跨部门", "沟通协作", "沟通协调", "协同"]],
  ["交付管理", ["交付管理", "项目交付", "实施交付", "落地交付"]],
  ["流程优化", ["流程优化", "流程梳理", "流程建设", "SOP", "机制建设"]],
  ["活动策划", ["活动策划", "活动运营", "营销活动"]],
  ["用户增长", ["用户增长", "增长策略", "拉新", "留存", "转化", "裂变"]],
  ["内容运营", ["内容运营", "内容策略", "内容生态", "内容质量"]],
  ["商家运营", ["商家运营", "商家管理", "商家服务", "商户运营"]],
  ["达人运营", ["达人运营", "达人服务", "创作者运营"]],
  ["社区运营", ["社区运营", "社群运营", "社区治理"]],
  ["治理审核", ["治理", "审核", "风控策略", "反作弊", "安全策略"]],
  ["视觉设计", ["视觉设计", "平面设计", "品牌视觉", "创意视觉"]],
  ["交互设计", ["交互设计", "信息架构", "体验设计", "UX", "UI"]],
  ["设计系统", ["设计系统", "组件库", "Design System"]],
  ["动效设计", ["动效", "动效设计", "动画设计"]],
  ["Figma", ["Figma", "Sketch"]],
];

const allCategories = [...PRODUCT_ROLE_CATEGORIES, PRODUCT_ROLE_OTHER_CATEGORY];

export function buildProductRoleModel(payload) {
  const sourceItems = Array.isArray(payload) ? payload : payload?.items || [];
  const categories = allCategories.map((category, index) => ({
    ...category,
    index,
    count: 0,
  }));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const jobsByCategory = new Map(categories.map((category) => [category.id, []]));
  const abilityCountsByCategory = new Map(categories.map((category) => [category.id, new Map()]));
  const globalAbilityCounts = new Map();

  const jobs = sourceItems.map((item, index) => {
    const title = cleanText(item?.title);
    const description = cleanText(item?.description);
    const requirement = cleanText(item?.requirement);
    const categoryId = classifyProductRole(title, `${description}\n${requirement}`);
    const category = categoryById.get(categoryId) || PRODUCT_ROLE_OTHER_CATEGORY;
    const abilities = extractProductRoleAbilities(`${title}\n${description}\n${requirement}`);
    const job = {
      id: `product-job:${item?.job_id || index}`,
      jobId: item?.job_id || "",
      displayJobId: item?.display_job_id || "",
      label: cleanJobTitle(title) || title || `未命名岗位 ${index + 1}`,
      rawTitle: title,
      url: item?.url || "",
      description,
      requirement,
      categoryId: category.id,
      abilities,
      index,
    };

    category.count += 1;
    jobsByCategory.get(category.id).push(job);
    for (const ability of abilities) {
      increment(globalAbilityCounts, ability);
      increment(abilityCountsByCategory.get(category.id), ability);
    }
    return job;
  });

  const topAbilitiesByCategory = new Map(
    categories.map((category) => [category.id, rankingFromCounts(abilityCountsByCategory.get(category.id))]),
  );

  return {
    categories,
    jobs,
    jobsByCategory,
    categoryById,
    topAbilitiesByCategory,
    globalAbilityRanking: rankingFromCounts(globalAbilityCounts),
    stats: {
      totalJobs: jobs.length,
      sourceUrl: payload?.source_url || "",
      scrapedAt: payload?.scraped_at || "",
    },
  };
}

export function classifyProductRole(title, body = "") {
  let winner = PRODUCT_ROLE_OTHER_CATEGORY.id;
  let bestScore = 0;

  for (const rule of PRODUCT_ROLE_CATEGORIES) {
    const titleHits = countHits(title, rule.title);
    if (titleHits === 0) continue;
    const score = titleHits * 4 + countHits(body, rule.body);
    if (score > bestScore) {
      bestScore = score;
      winner = rule.id;
    }
  }

  return winner;
}

export function extractProductRoleAbilities(text) {
  const found = new Set();
  for (const [label, aliases] of PRODUCT_ROLE_ABILITIES) {
    if (aliases.some((alias) => aliasMatches(text, alias))) found.add(label);
  }
  return [...found];
}

function cleanJobTitle(title) {
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

function rankingFromCounts(counts) {
  return [...counts.entries()]
    .map(([label, count]) => ({ id: `ability:${slugify(label)}`, label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function countHits(text, terms) {
  return terms.reduce((total, term) => total + (aliasMatches(text, term) ? 1 : 0), 0);
}

function aliasMatches(text, aliasConfig) {
  const alias = typeof aliasConfig === "string" ? aliasConfig : aliasConfig.term;
  const flags = typeof aliasConfig === "string" || !aliasConfig.caseSensitive ? "i" : "";
  if (!text || !alias) return false;
  if (/^[A-Za-z0-9.+#/-]+$/.test(alias)) {
    const escaped = escapeRegExp(alias);
    return new RegExp(`(^|[^A-Za-z0-9.+#/-])${escaped}([^A-Za-z0-9.+#/-]|$)`, flags).test(text);
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
