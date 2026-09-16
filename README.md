# 时账 TimeLedger

把每一笔消费换算成对应的工作时间。

> 消费金额 ÷ 时薪 = 消费时间成本

## 现状

这是 v0.1 可交互 UI 原型：React + Vite + TypeScript + Tailwind CSS v4，数据存储在浏览器
localStorage（内置一份演示流水，首次打开即可看到效果）。完整产品需求见 [docs/PRD.md](docs/PRD.md)。

已实现（对应 PRD 第 13 节 P0，登录注册/云同步除外）：
- 首次使用设置时间价值（月收入 / 工作天数 / 每天工作小时数），自动计算时薪
- 记一笔：支出 / 收入 / 转账，分类、账户、商户、备注、时间，支持自定义分类
- 首页：今日数据（收入/支出/净值/消费时间）、本月数据、今日账单
- 账单列表：搜索、按日期/类型/分类/账户/金额筛选，按日期分组
- 统计：本月概览、环比上月、分类统计、近 14 天趋势图

后续按 PRD 规划：登录注册、云同步、OCR/分享记账、周报月报、AI 消费分析。

## 开发

```bash
npm install
npm run dev
```

## 技术栈

React 19 + Vite + TypeScript + Tailwind CSS v4 + react-router-dom + recharts。
选择这套技术栈是为了后续能直接接 Supabase 之类的后端做登录/云同步，并用 Capacitor
把同一套代码打包成 iOS/Android 安装包。
