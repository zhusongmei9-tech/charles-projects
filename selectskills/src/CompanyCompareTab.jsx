import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildJobGraph } from "./jobGraph.js";
import { combineJobPayloads, JOB_COMPANIES } from "./jobData.js";
import { ink } from "./theme.js";

// 数据的品牌色偏亮，浅色底上统一压成墨色版本。
const COMPANY_COLORS = Object.fromEntries(
  Object.entries({
    bytedance: "#39c5bb",
    tencent: "#5b8cff",
    alibaba: "#ff6fd8",
  }).map(([key, value]) => [key, ink(value)]),
);

const GRID_STROKE = "#efebe4";
const AXIS_STROKE = "#8d9199";
const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #d6d1c7",
  borderRadius: 4,
  color: "#17181c",
  fontSize: 12,
};

export function CompanyCompareTab({ payloads }) {
  const companyGraphs = useMemo(() => {
    const graphs = {};
    for (const payload of payloads) {
      const companyKey = payload.items[0]?.company_key;
      if (!companyKey) continue;
      const combined = combineJobPayloads([payload], companyKey);
      graphs[companyKey] = buildJobGraph(combined);
    }
    return graphs;
  }, [payloads]);

  const companyLabels = useMemo(() => {
    const labels = {};
    for (const company of JOB_COMPANIES) {
      if (company.key === "all") continue;
      labels[company.key] = company.shortLabel;
    }
    return labels;
  }, []);

  // 公司岗位数量对比
  const jobCountData = useMemo(() => {
    return Object.entries(companyGraphs).map(([key, graph]) => ({
      name: companyLabels[key] || key,
      key,
      岗位数: graph.stats.totalJobs,
      fill: COMPANY_COLORS[key] || "#666",
    }));
  }, [companyGraphs, companyLabels]);

  // 大类岗位分布对比
  const categoryCompareData = useMemo(() => {
    const allCategories = new Set();
    const categoryMap = {};

    for (const [companyKey, graph] of Object.entries(companyGraphs)) {
      categoryMap[companyKey] = {};
      for (const [categoryId, jobs] of graph.jobsByCategory.entries()) {
        const category = graph.nodeById.get(categoryId);
        const label = category?.label || categoryId;
        allCategories.add(label);
        categoryMap[companyKey][label] = jobs.length;
      }
    }

    return [...allCategories].map((label) => {
      const row = { category: label };
      for (const [companyKey] of Object.entries(companyGraphs)) {
        row[companyLabels[companyKey] || companyKey] = categoryMap[companyKey]?.[label] || 0;
      }
      return row;
    }).sort((a, b) => {
      const totalA = Object.values(companyGraphs).reduce((sum, _g, i) => {
        const key = Object.keys(companyGraphs)[i];
        return sum + (a[companyLabels[key] || key] || 0);
      }, 0);
      const totalB = Object.values(companyGraphs).reduce((sum, _g, i) => {
        const key = Object.keys(companyGraphs)[i];
        return sum + (b[companyLabels[key] || key] || 0);
      }, 0);
      return totalB - totalA;
    });
  }, [companyGraphs, companyLabels]);

  // 技能频次对比（取前20个热门技能）
  const skillCompareData = useMemo(() => {
    const allSkillCounts = {};
    const allSkillsSet = new Set();

    for (const [companyKey, graph] of Object.entries(companyGraphs)) {
      if (!allSkillCounts[companyKey]) allSkillCounts[companyKey] = {};
      for (const skill of graph.skills) {
        allSkillCounts[companyKey][skill.label] = skill.count;
        allSkillsSet.add(skill.label);
      }
    }

    // 计算每个技能的总提及次数来排序
    const skillTotals = [...allSkillsSet].map((label) => {
      let total = 0;
      for (const [companyKey] of Object.entries(companyGraphs)) {
        total += allSkillCounts[companyKey]?.[label] || 0;
      }
      return { label, total };
    });

    return skillTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 25)
      .map(({ label, total }) => {
        const row = { skill: label, total };
        for (const [companyKey] of Object.entries(companyGraphs)) {
          row[companyLabels[companyKey] || companyKey] = allSkillCounts[companyKey]?.[label] || 0;
        }
        return row;
      });
  }, [companyGraphs, companyLabels]);

  // 各公司 Top 技能
  const topSkillsPerCompany = useMemo(() => {
    const result = {};
    for (const [companyKey, graph] of Object.entries(companyGraphs)) {
      result[companyKey] = graph.skills.slice(0, 10);
    }
    return result;
  }, [companyGraphs]);

  // 完整度对比
  const completenessData = useMemo(() => {
    return Object.entries(companyGraphs).map(([key, graph]) => ({
      name: companyLabels[key] || key,
      key,
      完整度: graph.stats.completeRate,
      fill: COMPANY_COLORS[key] || "#666",
    }));
  }, [companyGraphs, companyLabels]);

  const companyKeys = Object.keys(companyGraphs);

  return (
    <section className="company-compare-shell">
      <div className="company-compare-grid">
        <div className="compare-intro">
          <p className="panel-kicker">公司对比</p>
          <h2>把三家公司的技术岗放在一起看</h2>
          <p className="muted">
            数据取自字节跳动、腾讯、阿里巴巴的公开招聘页。上方三张卡片是各自的规模概览，
            下面按照岗位数量、大类分布、技能频次和数据完整度逐项对比。
          </p>
        </div>

        {/* 概览卡片 */}
        <div className="company-compare-cards">
          {companyKeys.map((key) => {
            const graph = companyGraphs[key];
            return (
              <div
                key={key}
                className="company-compare-card"
                style={{ "--company-color": COMPANY_COLORS[key] }}
              >
                <div className="company-compare-card-header">
                  <span className="company-dot" />
                  <strong>{companyLabels[key] || key}</strong>
                </div>
                <div className="company-compare-card-stats">
                  <div>
                    <b>{graph.stats.totalJobs.toLocaleString("zh-CN")}</b>
                    <small>岗位</small>
                  </div>
                  <div>
                    <b>{graph.skills.length}</b>
                    <small>技能</small>
                  </div>
                  <div>
                    <b>{graph.categories.length}</b>
                    <small>大类</small>
                  </div>
                  <div>
                    <b>{graph.stats.completeRate}%</b>
                    <small>完整度</small>
                  </div>
                </div>
                {/* Top 技能预览 */}
                <div className="company-compare-card-top-skills">
                  <small>热门技能</small>
                  <div className="company-compare-mini-skills">
                    {(topSkillsPerCompany[key] || []).slice(0, 5).map((skill) => (
                      <span key={skill.id}>{skill.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 岗位数对比 */}
        <div className="compare-chart-panel">
          <div className="compare-chart-header">
            <p className="panel-kicker">规模</p>
            <h3>岗位数量</h3>
            <p className="muted">各家本次抓取到的技术岗位总数。</p>
          </div>
          <div className="compare-chart-body">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={jobCountData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis type="number" stroke={AXIS_STROKE} fontSize={11} />
                <YAxis dataKey="name" type="category" stroke={AXIS_STROKE} fontSize={12} width={50} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(23, 24, 28, 0.04)" }} />
                <Bar dataKey="岗位数" radius={[0, 3, 3, 0]}>
                  {jobCountData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 大类分布对比 */}
        <div className="compare-chart-panel">
          <div className="compare-chart-header">
            <p className="panel-kicker">结构</p>
            <h3>岗位大类分布</h3>
            <p className="muted">同一条目下比较三家公司在该大类的岗位数，能看出各自的招聘重心。</p>
          </div>
          <div className="compare-chart-body">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryCompareData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="category" stroke={AXIS_STROKE} fontSize={11} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke={AXIS_STROKE} fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(23, 24, 28, 0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {companyKeys.map((key) => (
                  <Bar key={key} dataKey={companyLabels[key] || key} fill={COMPANY_COLORS[key]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 技能频次对比 */}
        <div className="compare-chart-panel">
          <div className="compare-chart-header">
            <p className="panel-kicker">技能</p>
            <h3>技能频次</h3>
            <p className="muted">提及次数最多的 25 项技能，在三家公司之间的分布差异。</p>
          </div>
          <div className="compare-chart-body">
            <ResponsiveContainer width="100%" height={520}>
              <BarChart data={skillCompareData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis type="number" stroke={AXIS_STROKE} fontSize={11} />
                <YAxis dataKey="skill" type="category" stroke={AXIS_STROKE} fontSize={11} width={115} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(23, 24, 28, 0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {companyKeys.map((key) => (
                  <Bar key={key} dataKey={companyLabels[key] || key} fill={COMPANY_COLORS[key]} radius={[0, 3, 3, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 数据完整度 */}
        <div className="compare-chart-panel">
          <div className="compare-chart-header">
            <p className="panel-kicker">数据质量</p>
            <h3>文本完整度</h3>
            <p className="muted">同时包含职位描述与任职要求的岗位占比，越高说明文本越值得深挖。</p>
          </div>
          <div className="compare-chart-body">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={completenessData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke={AXIS_STROKE} fontSize={11} />
                <YAxis dataKey="name" type="category" stroke={AXIS_STROKE} fontSize={12} width={50} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "rgba(23, 24, 28, 0.04)" }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="完整度" radius={[0, 3, 3, 0]}>
                  {completenessData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
