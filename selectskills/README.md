# JobCloud 岗位技能星图

JobCloud 将真实招聘岗位中的职位描述和任职要求转换为可交互的技能图谱，帮助用户比较不同公司、岗位方向和技能组合，快速判断值得学习和投入的技术能力。

当前研发图谱整合了字节跳动、腾讯和阿里巴巴三家公司的技术岗位数据，并提供课程图谱、技能 DAG、产品岗位分析和公司对比等视图。

## 功能概览

- **多公司技术岗位**：汇总字节跳动、腾讯和阿里巴巴技术岗，支持按公司切换。
- **岗位技能图谱**：以 3D 星图展示岗位大类、具体岗位与技能之间的关系。
- **技能频次分析**：查看全局或指定岗位大类的热门技能与技能组合。
- **技能 DAG**：从技能出发观察能够解锁的岗位方向和学习路径。
- **岗位详情**：展示公司、地点、职位描述、任职要求及官方岗位链接。
- **课程图谱**：探索计算机相关专业、课程和知识领域之间的联系。
- **产品岗位分析**：分析产品经理、数据分析、项目管理、运营和设计等岗位能力。
- **公司对比**：横向对比字节跳动、腾讯、阿里巴巴在岗位数量、大类分布、技能频次和完整度上的差异。
- **按需数据加载**：岗位 JSON 独立于主程序加载，页面先展示基础界面，再生成对应公司的技能图谱；已生成的图谱会在本次访问中复用。

## 数据概览

| 公司 | 数据文件 | 岗位数量 | 数据范围 |
| --- | --- | ---: | --- |
| 字节跳动 | `bytedance_jobs.json` | 5,405 | 技术类社会招聘岗位 |
| 腾讯 | `tencent_jobs.json` | 882 | 国内官网技术岗及 Workday 海外技术岗 |
| 阿里巴巴 | `alibaba_jobs.json` | 1,207 | 官方校园招聘与社会招聘技术岗 |
| **合计** |  | **7,494** | 研发图谱数据 |

数据量对应仓库当前 JSON 文件，招聘官网更新后可能发生变化。

## 技术栈

- React 19
- Vite 8
- Three.js
- Recharts
- Lucide React
- Node.js Test Runner
- Playwright（岗位数据采集）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动本地开发服务

```bash
npm run dev
```

默认访问地址：<http://127.0.0.1:5000/>

### 3. 运行测试

```bash
npm test
```

### 4. 构建生产版本

```bash
npm run build
```

构建结果输出到 `dist/`。

### 5. 本地预览生产版本

```bash
npm run preview
```

终端会显示实际预览地址。

## 刷新岗位数据

项目包含三套数据采集脚本。运行脚本会覆盖对应 JSON 文件，建议在刷新后重新执行测试和构建。

### 字节跳动

```bash
node scrape_bytedance_jobs.mjs
```

脚本支持分页范围、输出文件和并发数等参数：

```bash
node scrape_bytedance_jobs.mjs --help
```

### 腾讯

```bash
node scrape_tencent_jobs.mjs
```

脚本先从腾讯招聘公开接口读取国内技术类岗位，分别覆盖应届生、实习生和技术岗全量条件，并使用接口返回的 `Count` 正确分页。随后读取腾讯官方 Workday 海外招聘数据，以技术岗位标题规则排除商务、产品、运营等岗位，再按腾讯职位编号跨来源去重。脚本会并发获取职责描述、任职要求、地点、事业群和招聘类型；详情请求失败时最多重试 3 次，并在 `errors` 字段中记录异常。

### 阿里巴巴

```bash
node scrape_alibaba_jobs.mjs
```

脚本通过 Google Chrome 访问 `campus-talent.alibaba.com`，从官网动态发现并抓取校园招聘批次；同时分页读取 `talent.alibaba.com` 的社会招聘岗位。校园招聘只保留“技术类”，社会招聘只保留分类名称以“技术”开头的岗位，最后按岗位 ID 合并去重。任何来源失败都会写入 `errors`，并自动合并上一版数据，避免一次临时接口故障导致岗位数意外缩水。

### 刷新后验证

```bash
npm test
npm run build
```

## 数据结构

三家公司岗位会统一为以下核心字段：

```json
{
  "company": "腾讯",
  "company_key": "tencent",
  "title": "高性能计算工程师",
  "job_id": "岗位唯一标识",
  "url": "官方岗位链接",
  "description": "职位描述",
  "requirement": "任职要求",
  "location": "工作地点",
  "department": "所属部门或事业群",
  "updated_at": "更新时间"
}
```

`src/jobData.js` 负责补齐公司信息、合并数据和按公司筛选；`src/jobGraph.js` 负责岗位分类、技能提取以及图谱节点和关系构建。三个技术岗 JSON 由 Vite 作为独立资源输出，避免把 7,494 条岗位全部编入首屏 JavaScript；加载失败时页面会显示可重试提示。

### 技能词典

`src/jobGraph.js` 中的 `SKILL_RULES` 定义了 72 个技能关键词的识别规则，覆盖以下领域：

- **编程语言**：Python、Java、Go、C/C++、JS/TS、Rust、Swift 等
- **前端框架**：React、ReAct、Vue、Svelte、Webpack/Vite、HTML/CSS
- **后端架构**：分布式系统、微服务、RPC、gRPC、Protobuf、Spring、Nginx
- **数据库**：MySQL、Redis、NoSQL、MongoDB、PostgreSQL、Elasticsearch、ClickHouse、Doris 等
- **云原生**：Kubernetes、Docker、监控告警、Prometheus、Grafana、CI/CD、Jenkins
- **AI/ML**：PyTorch、TensorFlow、Transformer、NLP、CV、LLM、机器学习、深度学习、推荐系统
- **AI 模型调优**：CUDA、Triton、vLLM、TensorRT、DeepSpeed、Megatron、LoRA、Fine-Tuning、SFT、RL、RLHF
- **AI Agent**：Agent、RAG、Prompt Engineering、LangGraph、LangChain、LlamaIndex、AutoGen、CrewAI、AIGC
- **大数据**：Spark、Flink、Hadoop、Hive、Kafka、数据仓库、数据湖、SQL
- **硬件/系统**：Linux、PCIe、RDMA、驱动开发、CUDA-GDB、NVML、NVIDIA-SMI 等

## 项目结构

```text
JobCloud-main/
├── src/
│   ├── main.jsx                 # 页面入口和主要交互
│   ├── JobGalaxy.jsx            # 3D 岗位技能星图
│   ├── jobGraph.js              # 岗位分类、技能提取和图谱模型
│   ├── jobData.js               # 多公司数据合并与筛选
│   ├── SkillDag.jsx             # 技能 DAG 视图
│   ├── skillDag.js              # 技能 DAG 分组与匹配逻辑
│   ├── CourseGraphTab.jsx       # 课程图谱
│   ├── CourseGalaxy.jsx         # 课程 3D 星图
│   ├── courseGraph.js           # 课程图谱模型
│   ├── courseData.js            # 课程与专业数据
│   ├── ProductRolesTab.jsx      # 产品岗位分析
│   ├── productRoleModel.js      # 产品岗位分类与能力提取
│   ├── CompanyCompareTab.jsx    # 公司对比分析
│   ├── CareerPath.jsx           # 职业路径视图
│   ├── careerRoutes.js          # 职业路径模型
│   ├── styles.css               # 全局样式
│   └── *.test.mjs               # 自动化测试
├── bytedance_jobs.json          # 字节技术岗数据
├── tencent_jobs.json            # 腾讯技术岗数据
├── alibaba_jobs.json            # 阿里技术岗数据
├── bytedance_jobs_532_pages.json # 产品岗位分析数据
├── scrape_bytedance_jobs.mjs    # 字节数据采集脚本
├── scrape_tencent_jobs.mjs      # 腾讯数据采集脚本
├── scrape_alibaba_jobs.mjs      # 阿里数据采集脚本
├── vite.config.mjs
└── package.json
```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务 |
| `npm test` | 运行全部测试 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 本地预览生产构建 |
| `node scrape_tencent_jobs.mjs` | 刷新腾讯岗位数据 |
| `node scrape_alibaba_jobs.mjs` | 刷新阿里岗位数据 |
| `node scrape_bytedance_jobs.mjs` | 刷新字节岗位数据 |

## 数据说明

- 岗位数据来自各公司的公开招聘页面，仅用于职位与技能趋势分析。
- 岗位可能随官网更新、下线或调整，请以原始招聘链接为准。
- 不同公司的招聘类型不完全一致，横向比较时应结合社会招聘、校园招聘或实习岗位范围理解。
- 若详情接口暂时不可用，采集脚本可能保留岗位列表信息，并在数据文件的 `errors` 字段中记录异常。

## License

ISC
