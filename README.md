# 聚财众发基金交易系统 (Jucai Zhongfa Fund Trading System)

![React](https://img.shields.io/badge/React-19.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![PocketBase](https://img.shields.io/badge/PocketBase-0.22-orange)

专业的私募基金交易管理平台，包含面向投资者的**前台交易系统**和面向运营人员的**后台管理系统**。

## 📚 项目概况

本项目采用现代化的前后端分离架构，前端基于 **React 19** 生态构建，后端方案支持 **纯前端模拟 (Mock Mode)** 和 **PocketBase (BaaS)** 两种模式，旨在提供高性能、高安全性的金融交易体验。

### 核心功能模块

| 模块 | 功能特性 |
| :--- | :--- |
| **投资者端** | ✅ **基金超市**：多维度筛选、详情透视、业绩走势<br>✅ **交易系统**：申购/赎回/分红、电子合同签署、冷静态控制<br>✅ **资产中心**：持仓可视化分析、复利计算器<br>✅ **合规认证**：风险测评 (C1-C5)、合格投资者认证流程 |
| **管理端** | 🛡️ **全生命周期管理**：基金发行、存续、清算状态流转<br>📈 **净值管理**：净值录入、批量导入、异常波动监控<br>💰 **资金清算**：交易审核 (T+N)、大额预警、份额确认<br>👥 **用户管理**：账户冻结/解冻、权限分配、持仓修正 |

## 🛠 技术架构

*   **构建工具**: [Vite](https://vitejs.dev/)
*   **前端框架**: [React 19](https://react.dev/)
*   **语言**: [TypeScript](https://www.typescriptlang.org/)
*   **样式库**: [Tailwind CSS](https://tailwindcss.com/)
*   **图表库**: [Recharts](https://recharts.org/) (报表), [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) (K线/净值图)
*   **后端 (可选)**: [PocketBase](https://pocketbase.io/) (Go编写的超轻量级后端，含 SQLite 数据库)

---

## 🚀 本地开发指南

### 1. 前端启动

确保您的环境已安装 Node.js (v18+)。

```bash
# 1. 克隆或下载项目到本地
git clone <your-repo-url>
cd jucai-fund-system

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 即可看到系统。

> **注意**：默认情况下，`App.tsx` 使用本地 **Mock 数据** 运行。这意味着无需启动后端即可体验所有功能（数据存储在浏览器 LocalStorage 中）。

---

### 2. 后端搭建 (PocketBase 自动安装方案)

如果您希望使用真实的后端数据库，请按照以下步骤操作：

#### 第一步：下载 PocketBase
前往 [PocketBase 官网下载页](https://pocketbase.io/docs/) 下载适合您操作系统（Windows/macOS/Linux）的单文件可执行程序。

#### 第二步：启动服务
将下载的 `pocketbase.exe` (Windows) 或 `pocketbase` (Mac/Linux) 放入项目根目录（或其他任意位置），在终端运行：

```bash
./pocketbase serve
```

控制台将显示：
> Server started at http://127.0.0.1:8090
> ➜ REST API: http://127.0.0.1:8090/api/
> ➜ Admin UI: http://127.0.0.1:8090/_/

#### 第三步：一键导入数据库结构 (Schema)
为了免去手动建表的麻烦，本项目提供了自动化 Schema 文件。

1.  访问 Admin UI: `http://127.0.0.1:8090/_/` 并注册管理员账号。
2.  点击左侧菜单 **Settings** (设置) -> **Import collections** (导入集合)。
3.  点击 **Load from JSON file**。
4.  选择本项目根目录下的 **`pocketbase/pb_schema.json`** 文件。
5.  点击 **Import**。

🎉 **完成！** 系统已自动创建以下数据表及其字段、索引和关联关系：
*   `users`: 用户表（扩展字段：风险等级、实名认证状态等）
*   `fund_products`: 基金产品表
*   `transactions`: 交易流水表
*   `fund_nav_logs`: 净值历史表

#### 第四步：连接前端
修改前端代码以启用 API 模式：

1.  打开 `src/App.tsx`。
2.  找到 `// import { ApiService } from './api/services';` 并取消注释。
3.  将 `useState` 的初始 Mock 数据替换为 `useEffect` 调用 `ApiService` 获取数据（需根据实际需求进行少量代码调整，目前项目默认保留 Mock 模式以便演示）。

---

## 📂 目录结构说明

```text
src/
├── api/                # API 服务层
│   ├── fund.ts         # 基金相关接口
│   └── services.ts     # PocketBase 统一实现层
├── components/         # React 组件
│   ├── Admin*.tsx      # 管理端组件 (Dashboard, FundManager...)
│   ├── FundMarket.tsx  # 基金超市
│   ├── Portfolio.tsx   # 资产中心
│   ├── Login.tsx       # 登录页
│   └── ...
├── lib/
│   └── pocketbase.ts   # PocketBase 客户端实例
├── services/           # 业务逻辑服务
│   ├── simulationService.ts # 净值模拟与回测算法
│   └── newsService.ts       # 新闻资讯服务
├── types.ts            # TypeScript 类型定义
├── App.tsx             # 主入口 (路由与全局状态管理)
└── index.css           # Tailwind 全局样式
pocketbase/
└── pb_schema.json      # 数据库结构定义文件 (用于自动安装)
```

## 🔐 默认账号 (Mock 模式)

*   **管理员入口**: 点击登录页下方的“管理员入口”
    *   账号: `admin`
    *   密码: `admin`
*   **投资者账号**: 直接输入任意手机号注册，或点击登录页的“填充测试账号”

---

## 📄 许可证

MIT License
