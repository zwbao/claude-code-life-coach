# 人生教练 · Claude Code 插件

[English](README.md) | 简体中文

一个住在 [Claude Code](https://claude.com/claude-code) 里的人生教练，以 mod（由函数钩子组成的插件）的形式运行。
它看得见你一天的工作节律，在自然的停顿处轻声提醒，陪你守住几件小事；想聊的时候，直接交给 Claude。

## 安装

需要 Claude Code 2.1.287 或更新版本（mod 默认开启）。

```
/plugin marketplace add zwbao/claude-code-life-coach
/plugin install life-coach@life-coach
/reload-plugins
```

装好后，输入框上方会出现一行邀请，花 1 分钟完成设置：语言、想改善的方面、几点收工、多久提醒休息。

教练保存承诺、打卡和笔记时会调用插件的工具，第一次会弹权限确认。不想每次确认，可以在 `/permissions` 里允许
`mcp__life-coach__*`。

## 用法

| | |
|---|---|
| **输入框上方那一行** | 同一时间只显示一样东西：先是提醒（该休息、该收工、回访、每周复盘），其次是今天的承诺（点一下打卡，或按 `ctrl+x tab` 后按 `a`/`b`/`c`），全部打完卡后换成今日一条 |
| `/coach` | 打开面板：**今天**（承诺、今天和 Claude 一起工作的情况、今日一条）· **本周** · **我**（设置、隐私） |
| `/coach 想说的话` | 和教练聊；你的资料、承诺和作息会一起交给 Claude，只有模型看得到 |
| `/coach tip [编号]` | 看今日一条，或书库里的任意一条（如 `/coach tip E.6`、`/coach tip 13.1`） |
| `/coach week` · `/coach me` · `/coach setup` | 打开某一页，或重新设置 |
| `/coach quiet` | 安静到明早 4 点，不再提醒（再输一次取消） |
| 直接聊 | 说起睡眠、精力、压力、习惯、钱……Claude 会自然进入教练模式 |

## 原理

- **作息节律**：根据你发消息的时间，推算你和 Claude 一起工作了多久。两次消息间隔不超过 12 分钟算作一直在；
  一天从凌晨 4 点算起，所以凌晨 1 点还算前一晚。会统计最长连续工作时长、休息次数、超过睡觉时间多少分钟。
  同时开多个会话也不会算乱。
- **提醒**：默认克制，主要显示在输入框上方那一行；弹出提示每天最多 3 次，绝不在 Claude 干活时打断。
- **承诺**：最多同时 3 个，写成「当……时，我就……」的形式。连续天数按「不连续错过两天」计算，偶尔漏一天不清零。
- **教练对话**：系统提示里有一小段说明，让 Claude 知道自己也是你的教练；通过 `/coach` 发出的消息会附上你的情况
  （资料、承诺、作息、笔记）。插件提供 6 个工具：`context`、`profile`、`commit`、`checkin`、`note`、`library`。
- **书库**：是教练回答的依据，Claude 会查、会引用，今日一条也从这里来；它不是一个让人翻的页面。
  - **基础篇**（全球通用，中英双语）：15 条，涵盖运动、睡眠、工作节奏、习惯、情绪和人际关系；每条标注 A/B/C
    证据等级，原始出处都对照摘要核对过。
  - **中国篇**：eternity4719 的《高性价比人生指南》（CC BY 4.0），544 条。只适用于中国大陆，
    除非你主动要求，否则只在这个地区使用。

产品思路见 [PRODUCT.md](PRODUCT.md)（英文）。

## 隐私

所有数据只存在你自己的电脑上（Claude Code 的插件存储，`~/.claude/plugins/store/`）。除非你和 Claude 聊，
否则什么都不会离开本机；插件自己从不调用模型。在面板「我」里可以**复制我的数据**导出，或者**清空全部数据**。

## 开发

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .          # 或把这个目录加成本地 marketplace；改完 /reload-plugins 生效
```

代码结构：所有用到引擎（`$`）的代码都在 `hooks/register.tsx`，其余模块都是纯函数：
`coach.ts`（日期、连续天数、作息、提醒、给模型的上下文）、`actions.ts`（工具和按钮改动数据）、
`ui.tsx`（输入框上方那一行和面板的界面）、`library.ts`、`i18n.ts`，数据在 `essentials.ts` 和 `book*.ts`。

用新版《高性价比人生指南》重新生成中国篇：
`node scripts/parse.mjs <HowToLiveBetter 仓库目录> hooks/book.ts`。

## 许可

代码和基础篇采用 MIT 许可。中国篇是第三方内容，采用 CC BY 4.0，详见 [NOTICE](NOTICE)。
本插件不构成医疗建议；需要就医时，教练会明确告诉你。
