export const JOB_COMPANIES = [
  { key: "all", label: "全部公司", shortLabel: "全部" },
  { key: "bytedance", label: "字节跳动", shortLabel: "字节" },
  { key: "tencent", label: "腾讯", shortLabel: "腾讯" },
  { key: "alibaba", label: "阿里巴巴", shortLabel: "阿里" },
];

export function normalizeCompanyPayload(payload, company) {
  const items = (Array.isArray(payload) ? payload : payload?.items || []).map((item) => ({
    ...item,
    company: item.company || company.label,
    company_key: item.company_key || company.key,
  }));
  return {
    ...(Array.isArray(payload) ? {} : payload),
    total: items.length,
    items,
  };
}

export function combineJobPayloads(payloads, activeCompany = "all") {
  const matchingPayloads = activeCompany === "all"
    ? payloads
    : payloads.filter((payload) => payload.items[0]?.company_key === activeCompany);
  const items = matchingPayloads.flatMap((payload) => payload.items);
  return {
    source_url: matchingPayloads.map((payload) => payload.source_url).filter(Boolean).join(","),
    total: items.length,
    items,
    errors: matchingPayloads.flatMap((payload) => payload.errors || []),
  };
}
