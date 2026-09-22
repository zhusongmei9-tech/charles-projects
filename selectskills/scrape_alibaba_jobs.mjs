import fs from "node:fs/promises";
import { chromium } from "playwright";

const OUTPUT_PATH = new URL("./alibaba_jobs.json", import.meta.url);
const CAMPUS_HOME = "https://campus-talent.alibaba.com/";
const CAMPUS_POSITION_PAGE = "https://campus-talent.alibaba.com/campus/position";
const SOCIAL_POSITION_PAGE = "https://talent.alibaba.com/off-campus/position-list?lang=zh";
const SOCIAL_SEARCH_ENDPOINT = "https://talent.alibaba.com/position/search";
const PAGE_SIZE = 500;

// 官方页面当前公开的招聘项目。首页动态发现失败时仍可覆盖这些批次。
const KNOWN_BATCHES = [
  { id: "100000540002", label: "2027届实习生" },
  { id: "100000560002", label: "日常/研究型实习生" },
  { id: "100000700001", label: "阿里星人才计划" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, attempt = 1) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return response;
  } catch (error) {
    if (attempt >= 3) throw error;
    await sleep(1_000 * attempt);
    return fetchWithRetry(url, options, attempt + 1);
  }
}

function normalizeCampusJob(job, batchId, fallbackBatchName, pageIndex, index) {
  return {
    page: pageIndex,
    index_on_page: index + 1,
    company: "阿里巴巴",
    company_key: "alibaba",
    title: job.name || "",
    job_id: String(job.id),
    display_job_id: String(job.code || job.id),
    url: `https://campus-talent.alibaba.com/campus/position/${job.id}`,
    description: job.description || "",
    requirement: job.requirement || "",
    location: (job.workLocations || []).join(" / "),
    department: (job.circleNames || []).join(" / "),
    updated_at: job.modifyTime ? new Date(job.modifyTime).toISOString() : "",
    recruitment_type: job.batchName || fallbackBatchName || "校园招聘",
    recruitment_batch_id: batchId,
  };
}

function normalizeSocialJob(job, pageIndex, index) {
  const categories = Array.isArray(job.categories) ? job.categories : [];
  return {
    page: pageIndex,
    index_on_page: index + 1,
    company: "阿里巴巴",
    company_key: "alibaba",
    title: job.name || "",
    job_id: String(job.id),
    display_job_id: String(job.code || job.id),
    url: `https://talent.alibaba.com/off-campus/position-detail?positionId=${job.id}`,
    description: job.description || "",
    requirement: job.requirement || "",
    location: (job.workLocations || []).join(" / "),
    department: categories.join(" / "),
    updated_at: job.modifyTime ? new Date(job.modifyTime).toISOString() : "",
    recruitment_type: "社会招聘",
    recruitment_batch_id: "social",
    source_system: "阿里巴巴社会招聘",
  };
}

function isTechnicalSocialJob(job) {
  return (job.categories || []).some((category) => String(category).trim().startsWith("技术"));
}

async function discoverBatches(browser) {
  const discovered = new Map(KNOWN_BATCHES.map((batch) => [batch.id, batch]));
  const page = await browser.newPage();
  try {
    await page.goto(CAMPUS_HOME, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await sleep(4_000);
    const links = await page.locator('a[href*="batchId="]').evaluateAll((anchors) =>
      anchors.map((anchor) => ({ href: anchor.href, label: anchor.innerText.trim() })),
    );
    for (const link of links) {
      const id = new URL(link.href).searchParams.get("batchId");
      if (id) discovered.set(id, { id, label: link.label || `招聘批次 ${id}` });
    }
  } catch (error) {
    console.warn(`Batch discovery failed; using known batches: ${error.message}`);
  } finally {
    await page.close();
  }
  return [...discovered.values()];
}

async function scrapeBatch(browser, batch) {
  const page = await browser.newPage();
  const pageUrl = `${CAMPUS_POSITION_PAGE}?batchId=${batch.id}`;
  try {
    const searchRequestPromise = page.waitForRequest(
      (request) => request.method() === "POST" && request.url().includes("/position/search"),
      { timeout: 45_000 },
    );
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const searchRequest = await searchRequestPromise;
    const searchUrl = searchRequest.url();
    const capturedBody = searchRequest.postDataJSON() || {};

    const jobs = [];
    for (let pageIndex = 1; ; pageIndex += 1) {
      const response = await page.request.post(searchUrl, {
        data: {
          ...capturedBody,
          batchId: Number(batch.id),
          pageIndex,
          pageSize: PAGE_SIZE,
          categoryCode: "",
        },
      });
      if (!response.ok()) throw new Error(`HTTP ${response.status()}`);
      const payload = await response.json();
      if (!payload?.success) throw new Error(payload?.errorMsg || "API returned success=false");

      const content = payload.content || {};
      const records = content.datas || [];
      const technical = records.filter((job) => job.categoryName === "技术类");
      technical.forEach((job, index) => jobs.push(normalizeCampusJob(job, batch.id, batch.label, pageIndex, index)));
      console.log(`  ${batch.label} (${batch.id}) page ${pageIndex}: ${records.length} total, ${technical.length} technical`);

      const totalCount = Number(content.totalCount || content.total || records.length);
      if (records.length === 0 || pageIndex * PAGE_SIZE >= totalCount || records.length < PAGE_SIZE) break;
      await sleep(600);
    }
    return jobs;
  } finally {
    await page.close();
  }
}

async function scrapeSocialRecruitment() {
  const landingResponse = await fetchWithRetry(SOCIAL_POSITION_PAGE, {
    headers: { "user-agent": "JobCloud/1.0 (+public recruitment data importer)" },
  });
  const html = await landingResponse.text();
  const token = html.match(/["']?__token__["']?\s*:\s*["']([^"']+)["']/)?.[1];
  if (!token) throw new Error("Alibaba social recruitment CSRF token was not found");
  const cookie = typeof landingResponse.headers.getSetCookie === "function"
    ? landingResponse.headers.getSetCookie().map((value) => value.split(";", 1)[0]).join("; ")
    : (landingResponse.headers.get("set-cookie") || "").split(/,(?=[^;,]+=)/).map((value) => value.split(";", 1)[0]).join("; ");

  const jobs = [];
  for (let pageIndex = 1; ; pageIndex += 1) {
    const response = await fetchWithRetry(`${SOCIAL_SEARCH_ENDPOINT}?_csrf=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        cookie,
        origin: "https://talent.alibaba.com",
        referer: "https://talent.alibaba.com/",
        "user-agent": "JobCloud/1.0 (+public recruitment data importer)",
      },
      body: JSON.stringify({
        batchId: "",
        corpCode: "",
        categoryType: "social",
        aliStar: "",
        pageIndex,
        pageSize: PAGE_SIZE,
        channel: "group_official_site",
        language: "zh",
        buCode: "",
      }),
    });
    const payload = await response.json();
    if (!payload?.success) throw new Error(payload?.errorMsg || "Social API returned success=false");

    const content = payload.content || {};
    const records = content.datas || content.data || [];
    const technical = records.filter(isTechnicalSocialJob);
    technical.forEach((job, index) => jobs.push(normalizeSocialJob(job, pageIndex, index)));
    console.log(`  Social page ${pageIndex}: ${records.length} total, ${technical.length} technical`);

    const totalCount = Number(content.totalCount || content.total || records.length);
    if (records.length === 0 || pageIndex * PAGE_SIZE >= totalCount || records.length < PAGE_SIZE) break;
    await sleep(500);
  }
  return jobs;
}

console.log("=== Alibaba multi-batch technical job scraper ===");
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const errors = [];
const allJobs = [];
try {
  const batches = await discoverBatches(browser);
  console.log(`Recruitment batches: ${batches.map((batch) => `${batch.label}(${batch.id})`).join(", ")}`);
  for (const batch of batches) {
    try {
      allJobs.push(...await scrapeBatch(browser, batch));
    } catch (error) {
      errors.push({ batch_id: batch.id, message: error.message });
      console.warn(`  Batch ${batch.id} failed: ${error.message}`);
    }
  }
  try {
    allJobs.push(...await scrapeSocialRecruitment());
  } catch (error) {
    errors.push({ source: "social", message: error.message });
    console.warn(`  Social recruitment failed: ${error.message}`);
  }
} finally {
  await browser.close();
}

let previousItems = [];
try {
  previousItems = JSON.parse(await fs.readFile(OUTPUT_PATH, "utf8")).items || [];
} catch {
  // The first successful run has no previous snapshot to preserve.
}
const protectedJobs = errors.length > 0 ? [...previousItems, ...allJobs] : allJobs;
const deduped = [...new Map(protectedJobs.filter((job) => job.job_id).map((job) => [job.job_id, job])).values()];
if (deduped.length === 0) {
  throw new Error("No Alibaba technical jobs were returned; existing dataset was left untouched.");
}

const output = {
  source_url: CAMPUS_POSITION_PAGE,
  source_urls: [CAMPUS_POSITION_PAGE, SOCIAL_POSITION_PAGE],
  scraped_at: new Date().toISOString(),
  total: deduped.length,
  items: deduped,
  errors,
};
await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Saved ${deduped.length} Alibaba technical jobs (${errors.length} batch errors).`);
