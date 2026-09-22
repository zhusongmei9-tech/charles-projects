import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { buildProductRoleModel } from "./productRoleModel.js";
import { ink } from "./theme.js";

export function ProductRolesTab({ payload }) {
  const model = useMemo(() => buildProductRoleModel(payload), [payload]);
  const [activeCategoryId, setActiveCategoryId] = useState("product_manager");
  const [query, setQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);

  const activeCategory = model.categoryById.get(activeCategoryId) || model.categories[0];
  const activeJobs = model.jobsByCategory.get(activeCategory.id) || [];
  const visibleJobs = useMemo(() => filterJobs(activeJobs, query), [activeJobs, query]);
  const selectedJob = visibleJobs.find((job) => job.id === selectedJobId) || visibleJobs[0] || null;
  const topAbilities = model.topAbilitiesByCategory.get(activeCategory.id) || [];

  useEffect(() => {
    setSelectedJobId(null);
  }, [activeCategoryId, query]);

  return (
    <section className="product-workspace" aria-label="产品职能分类">
      <div className="product-role-main">
        <div className="product-role-summary">
          <div>
            <p className="panel-kicker">产品岗位</p>
            <h2>产品职能分类</h2>
            <p className="muted">
              把产品岗按职能重新归类：产品经理、数据分析、项目管理、运营、设计各自成类，其余并入「其他」。
              点卡片即切换分类，右侧岗位列表随之更新。
            </p>
          </div>
          <div className="product-role-stats" aria-label="产品职能数据概览">
            <span>
              <strong>{model.stats.totalJobs}</strong>
              <small>岗位</small>
            </span>
            <span>
              <strong>{model.categories.length}</strong>
              <small>大类</small>
            </span>
            <span>
              <strong>{model.globalAbilityRanking.length}</strong>
              <small>能力球</small>
            </span>
          </div>
        </div>

        <div className="product-category-grid">
          {model.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={category.id === activeCategory.id ? "is-active" : ""}
              style={{ "--role-ink": ink(category.color) }}
              onClick={() => setActiveCategoryId(category.id)}
            >
              <span>{category.label}</span>
              <strong>{category.count}</strong>
              <i style={{ width: `${Math.max(6, category.count / (model.stats.totalJobs || 1) * 100)}%` }} />
            </button>
          ))}
        </div>

        <div className="product-ability-section">
          <div className="product-section-heading">
            <p className="panel-kicker">能力球</p>
            <h3>{activeCategory.label}</h3>
          </div>
          {topAbilities.length > 0 ? (
            <div className="product-ability-cloud">
              {topAbilities.slice(0, 24).map((ability) => (
                <span key={ability.id}>
                  {ability.label}
                  <b>{ability.count}</b>
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">这类岗位的职位描述里没有命中能力词。</p>
          )}
        </div>
      </div>

      <aside className="info-panel product-role-panel">
        <div className="panel-section product-role-panel-header">
          <p className="panel-kicker">岗位列表</p>
          <h2>{activeCategory.label}</h2>
          <p className="muted">
            {visibleJobs.length} / {activeJobs.length} 个岗位
          </p>
          <label className="product-search">
            <Search size={16} />
            <input
              value={query}
              type="search"
              placeholder="搜索岗位名称或描述"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="panel-section">
          <div className="job-list product-job-list">
            {visibleJobs.slice(0, 80).map((job) => (
              <button
                key={job.id}
                type="button"
                className={selectedJob?.id === job.id ? "active" : ""}
                onClick={() => setSelectedJobId(job.id)}
              >
                {job.label}
              </button>
            ))}
          </div>
        </div>

        {selectedJob ? (
          <div className="panel-section selected-job-card">
            <p className="panel-kicker">岗位信息</p>
            <h3>{selectedJob.label}</h3>
            {selectedJob.url ? (
              <a className="primary-link" href={selectedJob.url} target="_blank" rel="noreferrer">
                查看原始岗位
              </a>
            ) : null}
            {selectedJob.abilities.length > 0 ? (
              <div className="skill-cloud product-selected-abilities">
                {selectedJob.abilities.map((ability) => (
                  <span key={ability}>{ability}</span>
                ))}
              </div>
            ) : null}
            <div className="job-detail-block">
              <h4>职位描述</h4>
              <p>{selectedJob.description || "暂无职位描述文本。"}</p>
            </div>
            <div className="job-detail-block">
              <h4>职位要求</h4>
              <p>{selectedJob.requirement || "暂无职位要求文本。"}</p>
            </div>
          </div>
        ) : (
          <div className="panel-section">
            <p className="muted">没有匹配的岗位，换个关键词试试。</p>
          </div>
        )}
      </aside>
    </section>
  );
}

function filterJobs(jobs, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return jobs;
  return jobs.filter((job) =>
    `${job.label}\n${job.description}\n${job.requirement}`.toLowerCase().includes(normalized),
  );
}
