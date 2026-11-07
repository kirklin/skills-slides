<p align="center"><img src="README.assets/hero.png" alt="kirklin-slides"></p>

# kirklin-slides

kirklin-slides 是一个供 AI Agent 使用的 Skill，可以把方案、汇报、立项材料等文档中的内容做成 16:9 的演示配图。

Skill 提供 27 种常见版式的样例页、所有风格共用的组件和文字规范、可以继续增加的风格，以及创建、渲染、检查、导出配图和截取社交媒体帖子的 TypeScript 脚本。


## 版式

27 种版式的样例页如下图所示，按从左到右、从上到下的顺序排列，页面上的文字全部是占位文字。

<p align="center"><img src="README.assets/layouts.png" alt="27 种版式的样例页"></p>

各版式的适用内容如下表，每种版式的内容和排版规则参见 [`references/kirklin-slides-layouts.md`](references/kirklin-slides-layouts.md)。

| 版式 | 英文名 | 适用内容 |
|-|-|-|
| 封面 | cover | 项目名、副标题、团队和日期 |
| 目录 | agenda | 三到六个部分的列表 |
| 章节页 | section | 新部分的开始 |
| 要点 | bullets | 三到六条并列的结论或事项 |
| 大数字 | hero | 一个关键数字和两到三个补充事实 |
| 数字方块 | tiles | 三到六个数字，每个数字对应一件事 |
| 对比 | compare | 两种做法的取舍 |
| 四象限 | matrix | 按两个维度分组的事项 |
| 表格 | table | 多个事项在多个方面的比较 |
| 横条 | bars | 多个对象的数值比较，或新旧两次数值的对比 |
| 柱状图 | columns | 一组时间段的数值 |
| 折线图 | line | 一到两个指标随时间的变化 |
| 环形图 | donut | 一个总数的构成 |
| 漏斗 | funnel | 逐级减少的多个阶段 |
| 时间轴 | timeline | 多个里程碑和当前进度 |
| 路线图 | roadmap | 多个阶段及各阶段的事项 |
| 甘特图 | gantt | 按周排期的任务 |
| 双轨 | tracks | 同时进行、时长不同的两件事 |
| 流程 | process | 三到六个先后进行的步骤 |
| 引述 | quote | 一段原话和说话人 |
| 图文 | image-text | 一张图片和图片说明 |
| 图标列表 | features | 三到六个特点或能力 |
| 团队 | team | 成员、角色和分工 |
| 截图 | posts | 社交媒体帖子或网页截图 |
| 标志墙 | logos | 合作方、客户等标志 |
| 代码 | code | 一段关键代码和说明 |
| 结束页 | closing | 结束语和联系方式 |

## 风格

风格决定配图的颜色、字体、字号和装饰，所有风格共用同一套样例页、组件类名和文字规范。目前提供的风格如下表：

| 风格 | 英文名 | 适用场景 |
|-|-|-|
| 黑底发布会风格 | `launch-dark` | 立项、方案汇报、投屏讲解 |
| 白底瑞士风格 | `swiss-light` | 方案汇报、数据分析、需要打印的材料 |

增加新风格的方法参见 [`references/kirklin-slides-new-style.md`](references/kirklin-slides-new-style.md)。

## 安装

运行脚本需要 Node 22.18 及以上版本、pnpm 和本机的 Chrome。将仓库克隆到 AI 编程助手的 Skills 目录，例如 `~/.claude/skills/`，再安装依赖：

```bash
git clone https://github.com/kirklin/skills-slides.git ~/.claude/skills/kirklin-slides
pnpm --dir ~/.claude/skills/kirklin-slides install
```

脚本默认使用 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`。Chrome 安装在其他位置时，通过环境变量 `CHROME` 指定路径。

## 使用

安装后，向 AI 编程助手描述需求即可，例如：

- 给这份方案配几张图
- 补一张图，说明新流程的五个步骤
- 把文档的全部配图导出来，汇总成一张图
- 截一张这个帖子的图，放进配图
- 以后照这几张图的样子做，加成一种新风格

Skill 会选定风格，按版式复制样例页并换成文档中的内容，渲染成 PNG 并运行检查，再把图片插入文档。配图保存在项目的 `slides/` 目录中，渲染结果在 `slides/out/`。

## 脚本

也可以直接运行脚本。各脚本的用途如下表，完整用法参见 [`references/kirklin-slides-workflow.md`](references/kirklin-slides-workflow.md)。

| 脚本 | 用途 |
|-|-|
| `scripts/use-style.ts` | 把风格的样式文件复制到项目的配图目录 |
| `scripts/add-page.ts` | 按版式复制一页样例 |
| `scripts/render.ts` | 把页面渲染为 3840×2160 的 PNG |
| `scripts/check-pages.ts` | 检查文字和版面 |
| `scripts/export-slides.ts` | 按文档中的顺序导出全部配图，并生成汇总图 |
| `scripts/preview-style.ts` | 生成一种风格全部样例的汇总图 |
| `scripts/post-shot.ts` | 截取社交媒体帖子 |

例如，在项目目录中新建一套配图，添加一页数字方块，换上自己的内容后渲染并检查：

```bash
SKILL=~/.claude/skills/kirklin-slides
node $SKILL/scripts/use-style.ts launch-dark slides
node $SKILL/scripts/add-page.ts slides tiles 01-status
# 修改 slides/pages/01-status.html 中的文字和数据
node $SKILL/scripts/render.ts slides
node $SKILL/scripts/check-pages.ts slides/pages
```

## 目录结构

| 路径 | 说明 |
|-|-|
| `SKILL.md` | Skill 的入口，列出必读的规范、快速决策和检查清单 |
| `references/` | 文字规范、版式目录、页面结构和组件、制作流程、增加新风格和各风格的规范 |
| `assets/pages/` | 27 种版式的共用样例页 |
| `assets/styles/` | 各风格的样式文件 |
| `scripts/` | 命令行脚本，逻辑和测试在 `scripts/lib/` |
| `README.assets/` | README 使用的图片 |

## 开发

修改脚本、样例页或风格后，运行以下命令检查代码并执行测试。测试会用本机的 Chrome 渲染每种风格的全部样例页，并逐页运行检查脚本。

```bash
pnpm lint
pnpm typecheck
pnpm test
```
