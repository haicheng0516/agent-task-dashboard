const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3456;
const AGENT_JSON_PATH = '/Users/seacity/.openclaw/workspace/agent_communication.json';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const AGENT_BASE_PATH = '/Users/seacity/.openclaw/agents';

// 读取agent状态
function getAgents() {
    try {
        // 先读取静态配置
        const configData = fs.readFileSync(AGENT_JSON_PATH, 'utf8');
        const config = JSON.parse(configData);
        
        // 然后读取各个agent的真实任务状态
        const agentNames = Object.keys(config.agents);
        const realAgents = {};
        
        agentNames.forEach(name => {
            const agent = config.agents[name];
            const taskFile = path.join(AGENT_BASE_PATH, name, 'workspace', 'agent_tasks.json');
            
            realAgents[name] = {
                ...agent,
                realTasks: []
            };
            
            // 尝试读取真实任务文件
            try {
                if (fs.existsSync(taskFile)) {
                    const taskData = JSON.parse(fs.readFileSync(taskFile, 'utf8'));
                    realAgents[name].realTasks = taskData.tasks || [];
                }
            } catch (e) {
                // 忽略读取错误
            }
        });
        
        return realAgents;
    } catch (e) {
        return {};
    }
}

// 保存agent状态
function saveAgents(agentData) {
    try {
        fs.writeFileSync(AGENT_JSON_PATH, JSON.stringify(agentData, null, 2));
        return true;
    } catch (e) {
        console.error('保存失败:', e);
        return false;
    }
}

// API: 获取所有agent状态
app.get('/api/agents', (req, res) => {
    const agents = getAgents();
    res.json(agents);
});

// API: 获取单个agent详情
app.get('/api/agents/:name', (req, res) => {
    const data = getAgents();
    const agent = data.agents[req.params.name];
    if (agent) {
        res.json(agent);
    } else {
        res.status(404).json({ error: 'Agent不存在' });
    }
});

// API: 给agent分配任务
app.post('/api/agents/:name/tasks', (req, res) => {
    const { task } = req.body;
    const agentName = req.params.name;
    
    const data = getAgents();
    if (!data.agents[agentName]) {
        return res.status(404).json({ error: 'Agent不存在' });
    }
    
    // 添加到todo列表
    data.agents[agentName].todo = data.agents[agentName].todo || [];
    data.agents[agentName].todo.push({
        id: Date.now(),
        task: task,
        createdAt: new Date().toISOString()
    });
    
    if (saveAgents(data)) {
        res.json({ success: true, message: `任务已分配给 ${agentName}` });
    } else {
        res.status(500).json({ error: '保存失败' });
    }
});

// API: 更新agent状态
app.put('/api/agents/:name', (req, res) => {
    const agentName = req.params.name;
    const updates = req.body;
    
    const data = getAgents();
    if (!data.agents[agentName]) {
        return res.status(404).json({ error: 'Agent不存在' });
    }
    
    data.agents[agentName] = { ...data.agents[agentName], ...updates };
    
    if (saveAgents(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: '保存失败' });
    }
});

// API: 创建工作流
app.post('/api/workflows', (req, res) => {
    const { name, tasks } = req.body; // tasks: [{agent, task}]
    
    const data = getAgents();
    
    // 为每个agent添加任务
    tasks.forEach(t => {
        if (data.agents[t.agent]) {
            data.agents[t.agent].todo = data.agents[t.agent].todo || [];
            data.agents[t.agent].todo.push({
                id: Date.now() + Math.random(),
                task: t.task,
                workflow: name,
                createdAt: new Date().toISOString()
            });
        }
    });
    
    if (saveAgents(data)) {
        res.json({ success: true, message: `工作流 "${name}" 已创建，任务已分发` });
    } else {
        res.status(500).json({ error: '保存失败' });
    }
});

// API: 获取任务队列
app.get('/api/queue', (req, res) => {
    const data = getAgents();
    res.json(data.task_queue || []);
});

app.listen(PORT, () => {
    console.log(`🚀 Agent任务流仪表板已启动: http://localhost:${PORT}`);
});
