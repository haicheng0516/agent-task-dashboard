# Agent Task Dashboard

Agent任务流管理与监控系统 - 实时展示多个Agent的工作状态、任务分配和工作流编排。

## 功能特性

- 📊 **实时监控** - 实时展示所有Agent的todo/doing/done/progress
- ➕ **任务分配** - 支持给单个Agent分配任务
- 🚀 **工作流编排** - 创建任务链，批量分发到多个Agent
- 🔄 **自动刷新** - 每5秒自动刷新数据
- 🎨 **现代UI** - 精美的深色主题界面

## 快速开始

### 安装

```bash
git clone https://github.com/haicheng0516/agent-task-dashboard.git
cd agent-task-dashboard
npm install
```

### 启动

```bash
npm start
```

访问 http://localhost:3456

## 配置

### 数据源

默认读取以下位置的任务数据：

- 静态配置: `/Users/seacity/.openclaw/workspace/agent_communication.json`
- 各Agent任务: `{AGENT_BASE_PATH}/{agent_name}/workspace/agent_tasks.json`

如需修改，编辑 `server.js` 中的路径常量：

```javascript
const AGENT_JSON_PATH = '/your/path/to/agent_communication.json';
const AGENT_BASE_PATH = '/your/path/to/agents';
```

### 任务文件格式

各Agent的 `agent_tasks.json` 格式：

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "任务标题",
      "description": "任务描述",
      "status": "pending|in-progress|completed"
    }
  ]
}
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/agents | 获取所有Agent状态 |
| GET | /api/agents/:name | 获取单个Agent详情 |
| POST | /api/agents/:name/tasks | 给Agent分配任务 |
| PUT | /api/agents/:name | 更新Agent状态 |
| POST | /api/workflows | 创建工作流 |

## 目录结构

```
agent-dashboard/
├── server.js          # Express API服务
├── package.json       # 项目配置
├── public/
│   └── index.html     # 前端页面
└── README.md
```

## 技术栈

- 后端: Node.js + Express
- 前端: Vanilla JavaScript + CSS3

## License

MIT
