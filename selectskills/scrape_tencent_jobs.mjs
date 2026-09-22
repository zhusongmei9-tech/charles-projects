import fs from "node:fs/promises";

const LIST_ENDPOINT = "https://careers.tencent.com/tencentcareer/api/post/Query";
const DETAIL_ENDPOINT = "https://careers.tencent.com/tencentcareer/api/post/ByPostId";
const OUTPUT_PATH = new URL("./tencent_jobs.json", import.meta.url);
const WORKDAY_LIST_ENDPOINT = "https://tencent.wd1.myworkdayjobs.com/wday/cxs/tencent/Tencent_Careers/jobs";
const WORKDAY_DETAIL_BASE = "https://tencent.wd1.myworkdayjobs.com/wday/cxs/tencent/Tencent_Careers";
const CONCURRENCY = 16;
const WORKDAY_CONCURRENCY = 8;
const MAX_DETAIL_RETRIES = 3;

// 腾讯招聘的技术相关分类 ID 组合，尝试覆盖更广的技术岗位
// 40001 = 原本使用的技术分类
// 不传 parentCategoryId = 全量搜索然后按 CategoryName 筛选
const SEARCH_CONFIGS = [
  { parentCategoryId: "40001", attrId: "2", label: "应届生技术岗", recruitmentType: "应届生招聘" },
  { parentCategoryId: "40001", attrId: "3", label: "实习生技术岗", recruitmentType: "实习生招聘" },
  { parentCategoryId: "40001", attrId: "", label: "技术类全量", recruitmentType: "社会招聘" },
  { parentCategoryId: "", attrId: "", label: "全量校验", recruitmentType: "社会招聘" },
];

function apiUrl(endpoint, params) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }
  return url;
}

async function getJson(url, attempt = 1) {
  const response = await fetch(url, {
    headers: { "user-agent": "SelectSkills/1.0 (+public recruitment data importer)" },
  });
  if (!response.ok) {
    if (attempt < 3) {
      await sleep(1000 * attempt);
      return getJson(url, attempt + 1);
    }
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  const payload = await response.json();
  if (payload?.Code !== 200) throw new Error(`API ${payload?.Code || "unknown"}: ${url}`);
  return payload.Data;
}

async function getWorkdayJson(url, options = {}, attempt = 1) {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": "SelectSkills/1.0 (+public recruitment data importer)",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    if (attempt < 3) {
      await sleep(1_000 * attempt);
      return getWorkdayJson(url, options, attempt + 1);
    }
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  return response.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mapConcurrent(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        results[index] = { error: error.message, item: items[index] };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function decodeHtmlEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const radix = entity[1]?.toLowerCase() === "x" ? 16 : 10;
      const raw = radix === 16 ? entity.slice(2) : entity.slice(1);
      const codePoint = Number.parseInt(raw, radix);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function htmlToText(html = "") {
  return decodeHtmlEntities(String(html)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|ul|ol)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, ""))
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const STRONG_TECH_TITLE = /(?:engineer|engineering|develop(?:er|ment)|programmer|software|algorithm|research(?:er)?|scientist|machine learning|artificial intelligence|\bai\b|technical artist|technical director|cloud architect|solution architect|data (?:analyst|engineer|architect)|back.?end|front.?end|full.?stack|gameplay|graphics|rendering|computer vision|robotics|security|cyber|network|infrastructure|\bsre\b|devops|database|systems? analyst|quality assurance|\bqa\b|研发|开发|算法|技术|工程师|架构师|科学家|机器学习|人工智能|安全|运维|测试|程序员|数据库|网络)/i;
const NON_TECH_TITLE = /(?:\bbd\b|business development|sales|marketing|recruit|human resources|legal|procurement|administrative|executive assistant|account manager|finance|public relations|policy|investment|product manager|product management|project management|script editor|screenwriter|(?<!technical )designer|user research|strategic|talent management|partnership|content operations?|community operations?|商务|销售|市场|招聘|人力|法务|采购|行政|财务|公关|政策|投资|产品经理|产品管理|产品策划|项目管理|编剧|设计师|用户研究|战略|人才管理|合作|内容运营|社区运营)/i;
const DEFINITELY_NON_TECH_TITLE = /(?:business development|developer ecosystem|game production|game research|product manager|product management|产品经理|产品管理|产品策划|游戏研究)/i;
const TECH_TITLE_OVERRIDE = /(?:engineer|developer|programmer|software|algorithm|researcher|scientist|technical artist|technical director|architect|\bsre\b|devops|database|quality assurance|\bqa\b|研发|开发|算法|技术|工程师|架构师|科学家|安全|运维|测试|程序员|数据库)/i;

function isTechnicalWorkdayTitle(title = "") {
  if (DEFINITELY_NON_TECH_TITLE.test(title)) return false;
  return STRONG_TECH_TITLE.test(title) && (!NON_TECH_TITLE.test(title) || TECH_TITLE_OVERRIDE.test(title));
}

function extractReqId(value = "") {
  return String(value).match(/R\d+/i)?.[0]?.toUpperCase() || "";
}

function splitWorkdayDescription(html = "") {
  const text = htmlToText(html);
  const marker = /(?:Who We Look For|Who You Are|Requirements?|Qualifications?|任职要求|岗位要求|我们期待你)/i;
  const match = marker.exec(text);
  if (!match || match.index < 80) return { description: text, requirement: "" };
  return {
    description: text.slice(0, match.index).trim(),
    requirement: text.slice(match.index).trim(),
  };
}

async function fetchWorkdayTechnicalJobs(existingItems) {
  const summaries = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const payload = await getWorkdayJson(WORKDAY_LIST_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText: "" }),
    });
    total = Number(payload.total || 0);
    const page = payload.jobPostings || [];
    summaries.push(...page);
    console.log(`  Workday offset ${offset}: ${page.length} posts (${summaries.length}/${total})`);
    if (page.length === 0) break;
    offset += page.length;
  }

  const knownReqIds = new Set(existingItems.flatMap((job) => [job.display_job_id, job.url, job.title]).map(extractReqId).filter(Boolean));
  const candidates = summaries.filter((job) => isTechnicalWorkdayTitle(job.title) && !knownReqIds.has(extractReqId(job.bulletFields?.[0])));
  console.log(`  Workday: ${summaries.length} total, ${candidates.length} new technical candidates`);

  const detailResults = await mapConcurrent(candidates, WORKDAY_CONCURRENCY, async (summary, index) => {
    const detailPayload = await getWorkdayJson(`${WORKDAY_DETAIL_BASE}${summary.externalPath}`);
    const info = detailPayload.jobPostingInfo || {};
    if (!isTechnicalWorkdayTitle(info.title || summary.title)) return null;
    const reqId = String(info.jobReqId || extractReqId(summary.bulletFields?.[0]) || info.id || "");
    const { description, requirement } = splitWorkdayDescription(info.jobDescription);
    const title = info.title || summary.title || "";
    const recruitmentType = /intern|实习/i.test(title)
      ? "实习生招聘"
      : /graduate|应届|校招/i.test(title) ? "应届生招聘" : "社会招聘";
    return {
      page: Math.floor(index / 20) + 1,
      index_on_page: (index % 20) + 1,
      company: "腾讯",
      company_key: "tencent",
      title,
      job_id: `workday:${reqId || info.jobPostingId}`,
      display_job_id: reqId,
      url: info.externalUrl || `https://tencent.wd1.myworkdayjobs.com/Tencent_Careers${summary.externalPath}`,
      description,
      requirement,
      location: info.location || "",
      department: detailPayload.hiringOrganization?.name || "腾讯海外招聘",
      product: "",
      updated_at: info.startDate || info.postedOn || "",
      recruitment_type: recruitmentType,
      source_system: "Workday",
    };
  });

  return detailResults.filter(Boolean);
}

const timestamp = String(Date.now());

// 第一步：尝试多个搜索配置获取岗位列表，去重
const allPostsMap = new Map();

for (const config of SEARCH_CONFIGS) {
  console.log(`Fetching posts with config: ${config.label} (parentCategoryId=${config.parentCategoryId || "none"})`);

  let pageIndex = 1;
  let totalPages = 1;
  let configErrors = 0;

  while (pageIndex <= totalPages) {
    const listUrl = apiUrl(LIST_ENDPOINT, {
      timestamp: String(Date.now()),
      countryId: "",
      cityId: "",
      bgIds: "",
      productId: "",
      categoryId: "",
      parentCategoryId: config.parentCategoryId || "",
      attrId: config.attrId || "",
      keyword: "",
      pageIndex: String(pageIndex),
      pageSize: "200",
      language: "zh-cn",
      area: "cn",
    });

    try {
      const list = await getJson(listUrl);
      const posts = list?.Posts || [];
      const totalCount = Number(list?.Count ?? list?.TotalCount ?? posts.length);
      totalPages = Math.max(1, Math.ceil(totalCount / 200));

      for (const post of posts) {
        // 只保留技术类岗位
        if (post.CategoryName !== "技术") continue;
        const existing = allPostsMap.get(post.PostId);
        allPostsMap.set(post.PostId, {
          ...(existing || post),
          recruitment_type: existing?.recruitment_type || config.recruitmentType,
        });
      }

      console.log(`  Page ${pageIndex}/${totalPages}: ${posts.length} posts, ${allPostsMap.size} unique tech posts so far`);
      pageIndex += 1;
    } catch (error) {
      configErrors += 1;
      console.warn(`  Page ${pageIndex} failed: ${error.message}`);
      if (configErrors >= 3) break;
      await sleep(2000);
    }
  }
}

const posts = [...allPostsMap.values()];
console.log(`\nTotal unique tech posts: ${posts.length}`);

// 第二步：并发获取详情页
const errors = [];

const items = (await mapConcurrent(posts, CONCURRENCY, async (post, index) => {
  for (let attempt = 1; attempt <= MAX_DETAIL_RETRIES; attempt++) {
    try {
      const detail = await getJson(apiUrl(DETAIL_ENDPOINT, {
        timestamp: String(Date.now()),
        postId: post.PostId,
        language: "zh-cn",
      }));
      return {
        page: Math.floor(index / 200) + 1,
        index_on_page: (index % 200) + 1,
        company: "腾讯",
        company_key: "tencent",
        title: detail.RecruitPostName || post.RecruitPostName,
        job_id: String(post.PostId),
        display_job_id: String(detail.RecruitPostId || post.RecruitPostId || ""),
        url: (detail.PostURL || post.PostURL || `https://careers.tencent.com/jobdesc.html?postId=${post.PostId}`).replace(/^http:/, "https:"),
        description: detail.Responsibility || post.Responsibility || "",
        requirement: [detail.Requirement, detail.ImportantItem].filter(Boolean).join("\n\n加分项\n"),
        location: detail.LocationName || post.LocationName || "",
        department: detail.BGName || post.BGName || "",
        product: detail.ProductName || post.ProductName || "",
        updated_at: detail.LastUpdateTime || post.LastUpdateTime || "",
        recruitment_type: post.recruitment_type || "社会招聘",
      };
    } catch (error) {
      if (attempt === MAX_DETAIL_RETRIES) {
        errors.push({ job_id: String(post.PostId), message: error.message });
        return {
          page: Math.floor(index / 200) + 1,
          index_on_page: (index % 200) + 1,
          company: "腾讯",
          company_key: "tencent",
          title: post.RecruitPostName,
          job_id: String(post.PostId),
          display_job_id: String(post.RecruitPostId || ""),
          url: (post.PostURL || `https://careers.tencent.com/jobdesc.html?postId=${post.PostId}`).replace(/^http:/, "https:"),
          description: post.Responsibility || "",
          requirement: "",
          location: post.LocationName || "",
          department: post.BGName || "",
          product: post.ProductName || "",
          updated_at: post.LastUpdateTime || "",
          recruitment_type: post.recruitment_type || "社会招聘",
        };
      }
      await sleep(2000 * attempt);
    }
  }
})).filter(Boolean);

try {
  const workdayItems = await fetchWorkdayTechnicalJobs(items);
  items.push(...workdayItems);
  console.log(`Added ${workdayItems.length} Tencent Workday technical jobs.`);
} catch (error) {
  errors.push({ source: "workday", message: error.message });
  console.warn(`Workday source failed: ${error.message}`);
}

const dedupedItems = [...new Map(items.filter((job) => job.job_id).map((job) => [job.job_id, job])).values()];

const output = {
  source_url: "https://careers.tencent.com/zh-cn/search.html",
  source_urls: [
    "https://careers.tencent.com/zh-cn/search.html",
    "https://tencent.wd1.myworkdayjobs.com/Tencent_Careers",
  ],
  scraped_at: new Date().toISOString(),
  total: dedupedItems.length,
  items: dedupedItems,
  errors,
};

await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`\nSaved ${dedupedItems.length} Tencent technical jobs to ${OUTPUT_PATH.pathname} (${errors.length} errors).`);
