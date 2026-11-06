---
name: kirklin-slides
version: 1.0.0
description: "演示配图：把方案、汇报、立项材料和文档里的内容做成 16:9 的图片，每页是一个 1920×1080 的 HTML 页面，用无头浏览器渲染成 3840×2160 的 PNG。包括 27 种常见版式的共用样例页（封面、目录、要点、数字、表格、各类图表、时间轴、流程、团队、代码、结束页等）、所有风格通用的组件和文字规范、可以继续增加的多种风格，以及创建、渲染、检查、导出和截取帖子的 TypeScript 脚本。当用户需要给文档做配图、做幻灯片那样的图，改、补、检查、导出这类配图，或者要把一套新的配图风格加进来时使用。不负责 .pptx 文件、在线幻灯片、海报和文档正文。"
---

# 演示配图

演示配图使用 HTML 页面制作 16:9 的图片。每页为一个 1920×1080 的 HTML 页面，套用所选风格的样式后，由无头浏览器渲染为 3840×2160 的 PNG，用于插入方案、汇报和立项材料等文档。

**CRITICAL — 制作任何一页之前，MUST 先用 Read 工具读取以下规范：**
1. [`kirklin-slides-copy.md`](references/kirklin-slides-copy.md)：文字规范，适用于所有风格
2. [`kirklin-slides-layouts.md`](references/kirklin-slides-layouts.md)：27 种版式的内容和排版规则
3. [`kirklin-slides-components.md`](references/kirklin-slides-components.md)：页面结构和组件类名
4. 所选风格的规范：颜色、字号和各版式的尺寸，文件位置参见风格列表
5. 创建、渲染、检查、重新编号、导出、预览风格和截取帖子之前，必读 [`kirklin-slides-workflow.md`](references/kirklin-slides-workflow.md)。
6. 增加新风格之前，必读 [`kirklin-slides-new-style.md`](references/kirklin-slides-new-style.md)。

下文中的 `<skill 目录>` 指本文件所在的目录。

## 风格

风格决定配图的颜色、字体、字号和装饰。所有风格共用同一套样例页、组件类名和文字规范。目前提供的风格如下表：

| 风格 | 英文名 | 适用场景 | 规范 |
|-|-|-|-|
| 黑底发布会风格 | `launch-dark` | 立项、方案汇报、投屏讲解 | [`kirklin-slides-style-launch-dark.md`](references/kirklin-slides-style-launch-dark.md) |

样例页位于 `assets/pages/`，各风格的样式文件位于 `assets/styles/<英文名>/style.css`。执行 `node <skill 目录>/scripts/preview-style.ts <英文名> 汇总图.png`，可生成一种风格全部样例的汇总图。

## 适用场景

- 为方案、汇报、立项材料等文档制作配图
- 修改或补充已有的配图
- 制作封面、时间安排、团队介绍等单页
- 按文档顺序导出全部配图，并生成汇总图
- 截取社交媒体帖子并放入配图
- 根据用户提供的配图增加新风格，例如浅色风格

## 快速决策

- 项目中已有 `slides/style.css` 时，沿用该风格。文件第一行的注释为风格的英文名，按英文名读取对应的风格规范，新页面放入同一个 `pages/` 目录。
- 用户指定风格时，使用指定的风格。
- 项目中没有 `style.css` 且用户未指定风格时，若只有一种风格，直接使用；若有多种风格，根据内容和场合推荐一种，用户查看汇总图后再确定。
- 用户提供一套新的配图，并要求以后按此制作时，按 [`kirklin-slides-new-style.md`](references/kirklin-slides-new-style.md) 增加新风格，现有风格保持不变。
- 先确定每页的标题，再根据页面的主要内容选择版式。常见内容与版式的对应关系如下表，完整说明参见 [`kirklin-slides-layouts.md`](references/kirklin-slides-layouts.md)。

| 内容 | 版式 |
|-|-|
| 一个关键数字 | 大数字 |
| 多个数字 | 数字方块 |
| 多条并列的结论 | 要点 |
| 多个特点或能力 | 图标列表 |
| 两种做法的取舍 | 对比 |
| 按两个维度分组的事项 | 四象限 |
| 多个事项在多个方面的比较 | 表格 |
| 数值大小的比较 | 横条 |
| 按时间段统计的数值 | 柱状图 |
| 指标随时间的变化 | 折线图 |
| 总数的构成 | 环形图 |
| 逐级减少的阶段 | 漏斗 |
| 里程碑 | 时间轴 |
| 分阶段的计划 | 路线图 |
| 按周排期的任务 | 甘特图 |
| 同时进行的两件事 | 双轨 |
| 先后进行的步骤 | 流程 |
| 一段原话 | 引述 |
| 一张图片和说明 | 图文 |
| 外部帖子 | 截图 |
| 成员和分工 | 团队 |
| 合作方 | 标志墙 |
| 一段代码 | 代码 |

## 核心边界

- 所有风格的画布尺寸均为 1920×1080，渲染结果为 3840×2160。
- 文字位于风格规定的版心内，版心由 `style.css` 中的四个边距变量定义。
- 页面只包含结构、内容和由数据计算出的百分比，颜色、字号等样式由风格决定，颜色的含义以风格规范为准。
- 每页只表达一个主题，内容较多时拆分为多页。
- 数字、人名和日期来自用户材料，或由材料直接计算得出，例如总数、起止时间和最大值。计算得出的数字在页脚注明计算方法；材料中没有且无法计算的数字不写入配图，也不做估算。
- 样例页中的占位文字全部替换为用户的内容，用户未提供的部分整块删除。
- 可相互比较的图表使用同一个比例尺，并在页脚注明比例尺。
- 标题为完整的句子，以句号结尾。中文与英文、数字之间加空格，数值范围用「到」连接。
- 文档中配图的序号与出现顺序一致，插入新页后重新编号。
- 脚本使用 TypeScript 编写，项目中的辅助脚本同样使用 TypeScript。

## 示例

```text
# BAD：标题为话题，数字与汉字之间没有空格，范围使用波浪线
审批流程介绍
每个模块需要2~3人

# GOOD：标题为结论，以句号结尾
新流程让审批少等两天。
每个模块由 2 到 3 人负责

# BAD：两张横条图使用不同的比例尺，选用的方案使用了表示严重的颜色
# GOOD：两张横条图使用同一个比例尺并在页脚注明，选用的方案使用风格规范中表示选用的颜色
```

## 检查清单

- 每页修改后均已重新渲染，并用 Read 工具查看过 PNG。
- 检查脚本未报告问题，页面中没有遗留样例的占位文字。
- 数字、人名和日期均能在用户材料中找到，或能由材料计算得出。
- 文档中的图片说明与标题一致，序号与出现顺序一致。
- 用户要求导出时，导出脚本运行无误，并已查看汇总图。
- 修改本 skill 的脚本、样例页或风格后，`pnpm --dir <skill 目录> test` 全部通过。

## 不在本 skill 范围

- .pptx 文件和在线幻灯片
- 海报、社交媒体卡片和网页设计
- 文档正文的写作

## 参考

| 文件 | 说明 |
|-|-|
| [`kirklin-slides-copy.md`](references/kirklin-slides-copy.md) | 文字规范 |
| [`kirklin-slides-layouts.md`](references/kirklin-slides-layouts.md) | 版式目录 |
| [`kirklin-slides-components.md`](references/kirklin-slides-components.md) | 页面结构和组件 |
| [`kirklin-slides-workflow.md`](references/kirklin-slides-workflow.md) | 制作流程和脚本用法 |
| [`kirklin-slides-new-style.md`](references/kirklin-slides-new-style.md) | 增加新风格 |
| [`kirklin-slides-style-launch-dark.md`](references/kirklin-slides-style-launch-dark.md) | 黑底发布会风格 |
| `assets/pages/` | 27 种版式的共用样例页 |
| `assets/styles/` | 各风格的样式 |
| `scripts/use-style.ts` | 为项目设置风格 |
| `scripts/add-page.ts` | 按版式复制一页样例 |
| `scripts/render.ts` | 渲染页面 |
| `scripts/check-pages.ts` | 检查文字和版面 |
| `scripts/export-slides.ts` | 导出文档的全部配图和汇总图 |
| `scripts/preview-style.ts` | 生成一种风格的样例汇总图 |
| `scripts/post-shot.ts` | 截取社交媒体帖子 |
