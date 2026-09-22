import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const DEFAULT_URL =
  "https://jobs.bytedance.com/experienced/position?keywords=&category=6704215862557018372%2C6704215886108035339%2C6704215888985327886%2C6704215897130666254%2C6704215956018694411%2C6704215957146962184%2C6704215958816295181%2C6704216109274368264%2C6704216296701036811%2C6704216635923761412%2C6704217321877014787%2C6704219452277262596%2C6704219534724696331%2C6938376045242353957%2C6704215963966900491%2C6704215862603155720&location=&project=&type=&job_hot_flag=&current=1&limit=10&functionCategory=&tag=";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "bytedance_jobs.json");
const PARTIAL_PATH = path.join(__dirname, "bytedance_jobs.partial.json");
const PAGE_LIMIT = 10;
const MAX_RETRIES = 3;

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    output: OUTPUT_PATH,
    maxPages: null,
    startPage: 1,
    endPage: null,
    detailConcurrency: 10,
    headful: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--url") options.url = argv[++i];
    else if (arg === "--output") options.output = path.resolve(argv[++i]);
    else if (arg === "--max-pages") options.maxPages = Number(argv[++i]);
    else if (arg === "--start-page") options.startPage = Number(argv[++i]);
    else if (arg === "--end-page") options.endPage = Number(argv[++i]);
    else if (arg === "--detail-concurrency") options.detailConcurrency = Number(argv[++i]);
    else if (arg === "--headful") options.headful = true;
    else if (arg === "--help") {
      console.log(`Usage: node scrape_bytedance_jobs.mjs [--max-pages N] [--start-page N] [--end-page N] [--output file] [--detail-concurrency N] [--headful]`);
      process.exit(0);
    }
  }

  return options;
}

function listPageUrl(baseUrl, pageNumber) {
  const url = new URL(baseUrl);
  url.searchParams.set("current", String(pageNumber));
  url.searchParams.set("limit", String(PAGE_LIMIT));
  return url.toString();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(label, fn) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`${label} failed (${attempt}/${MAX_RETRIES}): ${error.message}`);
      await sleep(1000 * attempt);
    }
  }
  throw lastError;
}

async function waitForJobList(page) {
  await page.waitForFunction(
    () => document.body.innerText.includes("开启新的工作") &&
      document.querySelectorAll('a[href*="/position/"][href*="/detail"]').length > 0,
    { timeout: 30_000 },
  );
}

async function readListPage(page, baseUrl, pageNumber) {
  await page.goto(listPageUrl(baseUrl, pageNumber), {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  await waitForJobList(page);

  return page.evaluate(() => {
    const bodyText = document.body.innerText;
    const countMatch = bodyText.match(/开启新的工作（(\d+)）/);
    const total = countMatch ? Number(countMatch[1]) : null;
    const links = [...document.querySelectorAll('a[href*="/position/"][href*="/detail"]')];
    const seen = new Set();

    const jobs = links
      .map((link) => {
        const href = link.href;
        if (seen.has(href)) return null;
        seen.add(href);
        const lines = (link.innerText || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        const idLine = lines.find((line) => line.includes("职位 ID"));
        const jobId = href.match(/\/position\/([^/]+)\/detail/)?.[1] || "";
        return {
          title: lines[0] || "",
          job_id: jobId,
          display_job_id: idLine?.replace(/^.*职位 ID[:：]\s*/, "") || "",
          url: href,
        };
      })
      .filter(Boolean);

    return { total, jobs };
  });
}

async function readDetailPage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForFunction(
    () => document.body.innerText.includes("职位描述") &&
      document.body.innerText.includes("职位要求"),
    { timeout: 30_000 },
  );

  const detail = await page.evaluate(() => {
    const normalize = (value) =>
      (value || "")
        .replace(/\u200b/g, "")
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    const lines = normalize(document.body.innerText)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const descStart = lines.indexOf("职位描述");
    const reqStart = lines.indexOf("职位要求");
    const applyStart = lines.indexOf("投递");
    const idIndex = lines.findIndex((line) => /^职位 ID[:：]/.test(line));
    const displayJobId = idIndex >= 0
      ? lines[idIndex].replace(/^职位 ID[:：]\s*/, "").trim()
      : "";
    const title = idIndex >= 4 ? lines[idIndex - 4] : "";
    const description = descStart >= 0 && reqStart > descStart
      ? normalize(lines.slice(descStart + 1, reqStart).join("\n"))
      : "";
    const requirement = reqStart >= 0
      ? normalize(lines.slice(reqStart + 1, applyStart > reqStart ? applyStart : undefined).join("\n"))
      : "";

    return {
      title,
      display_job_id: displayJobId,
      description,
      requirement,
    };
  });

  if (!detail.description || !detail.requirement) {
    throw new Error("detail page parsed empty description or requirement");
  }

  return detail;
}

async function scrapePageDetails(context, jobs, pageNumber, detailConcurrency) {
  const results = new Array(jobs.length);
  let nextIndex = 0;

  async function worker() {
    const page = await context.newPage();
    try {
      while (nextIndex < jobs.length) {
        const index = nextIndex;
        nextIndex += 1;

        const listJob = jobs[index];
        const position = { page: pageNumber, index_on_page: index + 1 };
        try {
          const detail = await withRetry(
            `detail page ${pageNumber}-${index + 1}`,
            () => readDetailPage(page, listJob.url),
          );
          results[index] = {
            ok: true,
            item: {
              ...position,
              title: detail.title || listJob.title,
              job_id: listJob.job_id,
              display_job_id: detail.display_job_id || listJob.display_job_id,
              url: listJob.url,
              description: detail.description,
              requirement: detail.requirement,
            },
          };
          console.log(`  ${pageNumber}-${index + 1}: ${detail.title || listJob.title}`);
        } catch (error) {
          results[index] = {
            ok: false,
            error: {
              ...position,
              title: listJob.title,
              job_id: listJob.job_id,
              url: listJob.url,
              error: error.message,
            },
          };
        }
      }
    } finally {
      await page.close();
    }
  }

  const workerCount = Math.min(Math.max(detailConcurrency, 1), jobs.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const partialPath = options.output === OUTPUT_PATH
    ? PARTIAL_PATH
    : `${options.output}.partial`;

  const browser = await chromium.launch({
    channel: "chrome",
    headless: !options.headful,
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "media", "font"].includes(type)) route.abort();
    else route.continue();
  });
  const listPage = await context.newPage();

  const result = {
    source_url: options.url,
    scraped_at: new Date().toISOString(),
    total: null,
    items: [],
    errors: [],
  };

  try {
    const firstPage = await withRetry("list page 1", () => readListPage(listPage, options.url, 1));
    result.total = firstPage.total;
    const totalPages = Math.ceil((result.total || firstPage.jobs.length) / PAGE_LIMIT);
    const startPage = Math.max(options.startPage, 1);
    const requestedEndPage = options.endPage ?? totalPages;
    const endPage = options.maxPages
      ? Math.min(startPage + options.maxPages - 1, requestedEndPage, totalPages)
      : Math.min(requestedEndPage, totalPages);

    console.log(`Detected ${result.total ?? "unknown"} jobs across ${totalPages} pages. Scraping pages ${startPage}-${endPage}.`);

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      const pageData = pageNumber === 1
        ? firstPage
        : await withRetry(`list page ${pageNumber}`, () => readListPage(listPage, options.url, pageNumber));

      console.log(`Page ${pageNumber}: found ${pageData.jobs.length} jobs.`);

      const detailResults = await scrapePageDetails(
        context,
        pageData.jobs,
        pageNumber,
        options.detailConcurrency,
      );
      for (const detailResult of detailResults) {
        if (detailResult.ok) result.items.push(detailResult.item);
        else result.errors.push(detailResult.error);
      }

      await writeJson(partialPath, result);
    }

    await writeJson(options.output, result);
    console.log(`Wrote ${result.items.length} items and ${result.errors.length} errors to ${options.output}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
