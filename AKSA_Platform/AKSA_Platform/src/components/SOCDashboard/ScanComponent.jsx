import React, { useState, useEffect } from "react";
import axios from 'axios';
import { runFimScan, getFimResults, clearFimResults, getLastFimScanDatetime, fetchAssignedAgents } from '../../services/SOCservices';
import { getOpenAIApiKey } from '../../utils/apiKey';

// OpenAI API integration for FIM scan assistant
const OPENAI_API_KEY = getOpenAIApiKey();
const ASSISTANT_ID = 'asst_sMop8t3yxFEFynVJCBpt5bQC';
const OPENAI_BETA_HEADER = { 'OpenAI-Beta': 'assistants=v2' };
const BASE_URL = 'https://api.openai.com/v1';
const fimApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        ...OPENAI_BETA_HEADER,
    },
});
async function createThread() {
    const res = await fimApi.post('/threads', {});
    return res.data.id;
}
async function createMessage(threadId, content) {
    const res = await fimApi.post(`/threads/${threadId}/messages`, {
        role: 'user',
        content,
    });
    return res.data.id;
}
async function createRun(threadId, assistantId) {
    const res = await fimApi.post(`/threads/${threadId}/runs`, {
        assistant_id: assistantId,
    });
    return res.data.id;
}
async function getRun(threadId, runId) {
    const res = await fimApi.get(`/threads/${threadId}/runs/${runId}`);
    return res.data;
}
async function getMessages(threadId) {
    const res = await fimApi.get(`/threads/${threadId}/messages`);
    return res.data.data;
}

// Utility to aggressively trim FIM result JSON before sending to assistant
function trimFimResult(data, depth = 0) {
    if (depth > 2) return '[Truncated]';
    if (Array.isArray(data)) {
        if (data.length > 2) {
            return data.slice(0, 2).map(item => trimFimResult(item, depth + 1)).concat(['...omitted']);
        }
        return data.map(item => trimFimResult(item, depth + 1));
    }
    if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        const trimmed = {};
        keys.slice(0, 2).forEach(key => {
            trimmed[key] = trimFimResult(data[key], depth + 1);
        });
        if (keys.length > 2) trimmed['...omitted'] = true;
        return trimmed;
    }
    return data;
}

const ScanComponent = () => {
    const [agentId, setAgentId] = useState('');
    const [agents, setAgents] = useState([]);
    const [assignedAgentIds, setAssignedAgentIds] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [lastScan, setLastScan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('result');
    const [fimThreadId, setFimThreadId] = useState(null);
    const [fimAssistantReply, setFimAssistantReply] = useState('');
    const [agentThreads, setAgentThreads] = useState({});

    // Fetch assigned agent IDs for user
    useEffect(() => {
        const fetchAssignedAgentsForUser = async () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('role');
            if (userRole === 'admin') {
                setAssignedAgentIds([]); // Admin sees all
                return;
            }
            const userEmail = localStorage.getItem('soc_email');
            if (!userEmail) {
                setAssignedAgentIds([]);
                return;
            }
            const assignedAgents = await fetchAssignedAgents(userEmail, token);
            // Normalize IDs to 3-digit strings
            const ids = (assignedAgents || []).map(a => String(a.agentId).padStart(3, '0'));
            setAssignedAgentIds(ids);
        };
        fetchAssignedAgentsForUser();
    }, []);

    // Fetch all agents, then filter for assigned if needed
    useEffect(() => {
        const loadAgents = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get('http://localhost:3000/api/wazuh/agents', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                let wazuhAgents = res.data.data.affected_items || [];
                // If not admin, filter for assigned agents only
                if (assignedAgentIds.length > 0) {
                    wazuhAgents = wazuhAgents.filter(agent => assignedAgentIds.includes(String(agent.id).padStart(3, '0')));
                }
                setAgents(wazuhAgents);
                if (wazuhAgents.length > 0) setAgentId(wazuhAgents[0].id);
            } catch (err) {
                console.error('Failed to fetch agents from Wazuh:', err);
                setAgents([]);
            }
        };
        loadAgents();
    }, [assignedAgentIds]);

    useEffect(() => {
        if (!fimThreadId) {
            createThread().then(setFimThreadId);
        }
    }, [fimThreadId]);

    useEffect(() => {
        setFimAssistantReply('');
        setScanResult(null);
    }, [agentId]);

    const getOrCreateThreadForAgent = async (agentId) => {
        if (agentThreads[agentId]) return agentThreads[agentId];
        const newThreadId = await createThread();
        setAgentThreads((prev) => ({ ...prev, [agentId]: newThreadId }));
        return newThreadId;
    };

    const handleAction = async (action) => {
        setLoading(true);
        setError('');
        setSuccess('');
        setFimAssistantReply('');
        try {
            const threadIdToUse = await getOrCreateThreadForAgent(agentId);
            if (action === 'scan') {
                await runFimScan();
            } else if (action === 'get') {
                const res = await getFimResults(agentId);
                setScanResult(res);
                setActiveTab('result');
                if (threadIdToUse && res) {
                    setFimAssistantReply('Loading...');
                    try {
                        const msgToSend = `Summarize the following FIM scan result in simple terms:\n\n${JSON.stringify(trimFimResult(res), null, 2)}`;
                        await createMessage(threadIdToUse, msgToSend);
                        const runId = await createRun(threadIdToUse, ASSISTANT_ID);
                        let runStatus = 'queued';
                        while (runStatus !== 'completed' && runStatus !== 'failed') {
                            await new Promise((res) => setTimeout(res, 1500));
                            const run = await getRun(threadIdToUse, runId);
                            runStatus = run.status;
                        }
                        const allMsgs = await getMessages(threadIdToUse);
                        const assistantMsgs = allMsgs.filter((m) => m.role === 'assistant');
                        const lastMsg = assistantMsgs.sort((a, b) => b.created_at - a.created_at)[0];
                        if (lastMsg) setFimAssistantReply(lastMsg.content[0].text.value);
                        else setFimAssistantReply('No assistant reply received.');
                    } catch (err) {
                        setFimAssistantReply('Assistant error: ' + (err?.response?.data?.error?.message || err.message || 'Unknown error'));
                    }
                }
            } else if (action === 'clear') {
                await clearFimResults(agentId);
                setScanResult(null);
            } else if (action === 'last') {
                const res = await getLastFimScanDatetime(agentId);
                if (threadIdToUse && res) {
                    setFimAssistantReply('Loading...');
                    try {
                        const msgToSend = `Summarize the following FIM last scan datetime:\n\n${JSON.stringify(trimFimResult(res), null, 2)}`;
                        await createMessage(threadIdToUse, msgToSend);
                        const runId = await createRun(threadIdToUse, ASSISTANT_ID);
                        let runStatus = 'queued';
                        while (runStatus !== 'completed' && runStatus !== 'failed') {
                            await new Promise((res) => setTimeout(res, 1500));
                            const run = await getRun(threadIdToUse, runId);
                            runStatus = run.status;
                        }
                        const allMsgs = await getMessages(threadIdToUse);
                        const assistantMsgs = allMsgs.filter((m) => m.role === 'assistant');
                        const lastMsg = assistantMsgs.sort((a, b) => b.created_at - a.created_at)[0];
                        if (lastMsg) setFimAssistantReply(lastMsg.content[0].text.value);
                        else setFimAssistantReply('No assistant reply received.');
                    } catch (err) {
                        setFimAssistantReply('Assistant error: ' + (err?.response?.data?.error?.message || err.message || 'Unknown error'));
                    }
                }
            }
        } catch (err) {
            setError('Action failed: ' + (err?.response?.data?.error?.message || err.message || 'Unknown error'));
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">FIM Scan Manager</h2>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    className="border rounded-lg px-4 py-2 text-lg w-150"
                    disabled={loading}
                >
                    {agents.length === 0 && <option>Loading agents...</option>}
                    {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                            {agent.name ? `${agent.name} (${agent.id})` : agent.id}
                        </option>
                    ))}
                </select>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                        onClick={() => handleAction('scan')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm"
                        disabled={loading}
                    >
                        Run Scan
                    </button>
                    <button
                        onClick={() => handleAction('get')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm"
                        disabled={loading || !agentId}
                    >
                        Get Result
                    </button>
                    <button
                        onClick={() => handleAction('clear')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm"
                        disabled={loading || !agentId}
                    >
                        Clear Result
                    </button>
                    <button
                        onClick={() => handleAction('last')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow text-sm"
                        disabled={loading || !agentId}
                    >
                        Last Scan Time
                    </button>
                </div>
            </div>

            {(error || success) && (
                <div className={`rounded px-4 py-2 text-sm ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {error || success}
                </div>
            )}

            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Assistant Summary</h3>
                <div className="bg-gray-100 text-gray-800 rounded-lg p-4 shadow-inner min-h-[80px] whitespace-pre-line text-base">
                    {fimAssistantReply || 'No FIM result loaded.'}
                </div>
            </div>
        </div>
    );
};

export default ScanComponent; 