import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Send, Filter, X} from 'lucide-react';
import VulnerabilityDetail from './VulnerabilityDetail';
import { fetchVulnerabilities, fetchAssignedAgents } from '../../services/SOCservices';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getOpenAIApiKey } from '../../utils/apiKey';
import VulnerabilitiesChart from './Vulnerabilities/VulnerabilitiesChart';
import VulnerabilitiesTable from './Vulnerabilities/VulnerabilitiesTable';
import CustomListbox from './CustomListbox';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showChatbox, setShowChatbox] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [pendingAlertJson, setPendingAlertJson] = useState(null);
  const chatBubbleStyle = { backgroundColor: '#f8eef9' };
  // Manual chatbox resizing state and handlers
  const [chatboxWidth, setChatboxWidth] = useState(384); // default 384px
  const minChatboxWidth = 320;
  const maxChatboxWidth = 600;
  const isDraggingRef = React.useRef(false);
  // OpenAI API integratio/n
  const OPENAI_API_KEY = getOpenAIApiKey();
  const ASSISTANT_ID = 'asst_8IyFzjmdoFxXzohWeqlWvifh'; // Provided for local testing only
  const OPENAI_BETA_HEADER = { 'OpenAI-Beta': 'assistants=v2' };
  const BASE_URL = 'https://api.openai.com/v1';

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      ...OPENAI_BETA_HEADER,
    },
  });

  // Track shown message IDs to avoid duplicate assistant replies
  const [shownMessageIds, setShownMessageIds] = useState([]);

  // Ref for chat container to enable auto-scroll
  const chatContainerRef = React.useRef(null);

  // Ref to track the latest threadId for chatbox
  const latestThreadIdRef = React.useRef(null);

  // Filter state
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const severityOrder = ['Low', 'Medium', 'High', 'Critical', 'Unknown'];
  let severityOptions = Array.from(new Set(vulnerabilities.map(v => v._source?.vulnerability?.severity || 'Unknown')));
  severityOptions = severityOptions.sort((a, b) => {
    const idxA = severityOrder.indexOf(a);
    const idxB = severityOrder.indexOf(b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'scoreAsc', or 'scoreDesc'
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');
  const [assignedAgents, setAssignedAgents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchAgentsForFilter = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      setUserRole(role);
      if (role === 'admin') {
        // Admin: fetch all agents
        const res = await axios.get('/api/wazuh/agents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allAgents = res.data.data.affected_items || [];
        setAssignedAgents(allAgents);
      } else {
        // Regular user: fetch only assigned agents
        const userEmail = localStorage.getItem('soc_email');
        if (!userEmail) {
          setAssignedAgents([]);
          return;
        }
        const assignedAgentsArr = await fetchAssignedAgents(userEmail, token);
        setAssignedAgents(assignedAgentsArr);
      }
    };
    fetchAgentsForFilter();
  }, []);

  const severityBadgeClassMap = {
    'Critical': 'bg-red-100 text-red-800 animate-pulse',
    'High': 'bg-orange-100 text-orange-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-blue-100 text-blue-800',
    'Unknown': 'bg-gray-100 text-gray-800',
  };

  async function createThread() {
    const res = await api.post('/threads', {});
    return res.data.id;
  }
  async function createMessage(threadId, content) {
    const res = await api.post(`/threads/${threadId}/messages`, {
      role: 'user',
      content,
    });
    return res.data.id;
  }
  async function createRun(threadId, assistantId) {
    const res = await api.post(`/threads/${threadId}/runs`, {
      assistant_id: assistantId,
    });
    return res.data.id;
  }
  async function getRun(threadId, runId) {
    const res = await api.get(`/threads/${threadId}/runs/${runId}`);
    return res.data;
  }
  async function getMessages(threadId) {
    const res = await api.get(`/threads/${threadId}/messages`);
    return res.data.data;
  }

  // Assistants v2 thread state
  const [threadId, setThreadId] = useState(null);

  // Error boundary for chatbox
  const [chatboxError, setChatboxError] = useState(null);
  // Ensure isLoading is defined
  const [isLoading, setIsLoading] = useState(false);

  const [chatboxVulnId, setChatboxVulnId] = useState(null);

  useEffect(() => {
    const getVulnerabilities = async () => {
      try {
        const data = await fetchVulnerabilities();
        setVulnerabilities(data);
      } catch (error) {
        console.error('Error loading vulnerabilities:', error);
      } finally {
        setLoading(false);
      }
    };

    getVulnerabilities();
  }, []);

  // Add alert JSON to chat when pendingAlertJson is set
  React.useEffect(() => {
    if (pendingAlertJson) {
      setMessages(prev => [
        ...prev,
        JSON.stringify(pendingAlertJson, null, 2)
      ]);
      setPendingAlertJson(null);
    }
  }, [pendingAlertJson]);

  // Get unique agents for filter dropdown (from assignedAgents, fallback to all vulnerabilities if empty)
  const agentOptions = assignedAgents.length > 0
    ? assignedAgents.map(agent => agent.agentName || agent.name)
    : Array.from(new Set(vulnerabilities.map(v => v._source?.agent?.name || 'Unknown')));

  // Filter vulnerabilities based on selected filters and user role
  const filteredVulnerabilities = vulnerabilities.filter(v => {
    const agent = v._source?.agent?.name || 'Unknown';
    const severity = v._source?.vulnerability?.severity || 'Unknown';
    if (userRole === 'admin') {
      return (selectedAgent === 'All' || agent === selectedAgent) &&
        (selectedSeverity === 'All' || severity === selectedSeverity);
    } else {
      if (selectedAgent === 'All') {
        const assignedAgentNames = assignedAgents.map(a => a.agentName || a.name);
        return assignedAgentNames.includes(agent) &&
          (selectedSeverity === 'All' || severity === selectedSeverity);
      } else {
        return agent === selectedAgent &&
          (selectedSeverity === 'All' || severity === selectedSeverity);
      }
    }
  });

  // Sort by score (low to high or high to low) if selected
  const sortedVulnerabilities =
    sortOrder === 'scoreAsc'
      ? [...filteredVulnerabilities].sort((a, b) => {
        const aScore = Number(a._source?.vulnerability?.score?.base) || 0;
        const bScore = Number(b._source?.vulnerability?.score?.base) || 0;
        return aScore - bScore;
      })
      : sortOrder === 'scoreDesc'
        ? [...filteredVulnerabilities].sort((a, b) => {
          const aScore = Number(a._source?.vulnerability?.score?.base) || 0;
          const bScore = Number(b._source?.vulnerability?.score?.base) || 0;
          return bScore - aScore;
        })
        : filteredVulnerabilities;

  const totalPages = Math.ceil(sortedVulnerabilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedVulnerabilities.slice(startIndex, startIndex + itemsPerPage);

  // LIGHTER COLORS
  const severityColorMap = {
    'Critical': 'rgba(236, 72, 153, 0.7)', // #ec4899, pink-500
    'High': 'rgba(239, 68, 68, 0.7)',      // #ef4444, red-500
    'Medium': 'rgba(234, 179, 8, 0.7)',    // #eab308, yellow-500
    'Low': 'rgba(16, 185, 129, 0.7)',      // #10b981, emerald-500
    'Unknown': 'rgba(156, 163, 175, 0.3)', // gray-400
  };

  const severityCounts = sortedVulnerabilities.reduce((acc, item) => {
    const severity = item._source?.vulnerability?.severity || 'Unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
  const severityChart = {
    labels: Object.keys(severityCounts),
    datasets: [{
      label: 'Vulnerabilities by Severity',
      data: Object.values(severityCounts),
      backgroundColor: Object.keys(severityCounts).map(sev => severityColorMap[sev] || severityColorMap['Unknown']),
      borderColor: Object.keys(severityCounts).map(sev => {
        if (sev === 'Critical') return 'rgba(236, 72, 153, 1)';
        if (sev === 'High') return 'rgba(239, 68, 68, 1)';
        if (sev === 'Medium') return 'rgba(234, 179, 8, 1)';
        if (sev === 'Low') return 'rgba(16, 185, 129, 1)';
        return 'rgba(156, 163, 175, 0.7)';
      }),
      borderWidth: 1,
    }],
  };

  const chartColors = [
    'rgba(236, 72, 153, 0.7)', // Critical
    'rgba(239, 68, 68, 0.7)',  // High
    'rgba(234, 179, 8, 0.7)',  // Medium
    'rgba(16, 185, 129, 0.7)', // Low
    'rgba(156, 163, 175, 0.3)',// Unknown/Gray
  ];

  const packageCounts = {};
  sortedVulnerabilities.forEach((item) => {
    const pkg = item._source?.package?.name || 'Unknown';
    packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
  });
  const topPackages = Object.entries(packageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const packageChart = {
    labels: topPackages.map(([name]) => name),
    datasets: [{
      data: topPackages.map(([_, count]) => count),
      backgroundColor: chartColors,
      borderColor: [
        'rgba(236, 72, 153, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(156, 163, 175, 0.7)',
      ],
      borderWidth: 1,
    }],
  };

  const agentCounts = {};
  sortedVulnerabilities.forEach((item) => {
    const agent = item._source?.agent?.name || 'Unknown';
    agentCounts[agent] = (agentCounts[agent] || 0) + 1;
  });
  const topAgents = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const agentChart = {
    labels: topAgents.map(([name]) => name),
    datasets: [{
      data: topAgents.map(([_, count]) => count),
      backgroundColor: chartColors,
      borderColor: [
        'rgba(236, 72, 153, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(156, 163, 175, 0.7)',
      ],
      borderWidth: 1,
    }],
  };

  const handleSend = async () => {
    if (!chatInput.trim() || !threadId) return;

    // Check if the message is JSON
    let msgToSend = chatInput;
    let isJson = false;
    try {
      JSON.parse(chatInput);
      msgToSend = `Summarize the following log in simple terms, and reply in a clear, official style. Use Markdown formatting (bold, lists, etc.) only when it helps clarity, not for every label or section. Avoid excessive bold, headings, or stars.\n\n${chatInput}`;
      isJson = true;
    } catch (e) {
      // Not JSON, send as-is
    }

    setMessages(prev => [...prev, { text: chatInput, isUser: true }]);
    setChatInput('');
    setIsLoading(true);

    try {
      await createMessage(threadId, msgToSend);
      const runId = await createRun(threadId, ASSISTANT_ID);
      // Poll for run completion
      let runStatus = 'queued';
      while (runStatus !== 'completed' && runStatus !== 'failed') {
        await new Promise(res => setTimeout(res, 1500));
        const run = await getRun(threadId, runId);
        runStatus = run.status;
      }
      // Get all messages and append only new assistant replies
      const allMsgs = await getMessages(threadId);
      const newAssistantMsgs = allMsgs
        .filter(m => m.role === 'assistant' && !shownMessageIds.includes(m.id))
        .sort((a, b) => a.created_at - b.created_at);
      if (newAssistantMsgs.length > 0) {
        setMessages(prev => [
          ...prev,
          ...newAssistantMsgs.map(m => ({ text: m.content[0].text.value, isUser: false }))
        ]);
        setShownMessageIds(prev => [
          ...prev,
          ...newAssistantMsgs.map(m => m.id)
        ]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Error: Could not get response.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setEditingText(messages[idx].text);
  };

  const handleSaveEdit = (idx) => {
    const newMessages = [...messages];
    newMessages[idx] = { ...messages[idx], text: editingText };
    setMessages(newMessages);
    setEditingIndex(null);
    setEditingText("");
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const newWidth = Math.min(
        Math.max(window.innerWidth - e.clientX, minChatboxWidth),
        maxChatboxWidth
      );
      setChatboxWidth(newWidth);
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDragging = (e) => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'ew-resize';
    e.preventDefault();
  };

  // On chatbox open, create a thread if needed
  useEffect(() => {
    if (!showChatbox || threadId) return;
    createThread().then(setThreadId);
  }, [showChatbox, threadId]);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Helper to format assistant replies with subtitle and key points
  function formatAssistantReply(text) {
    // Try to split into summary and key points
    // Look for lines starting with '-', '*', or numbers for key points
    const lines = text.split('\n');
    let summary = '';
    let keyPoints = [];
    let inKeyPoints = false;
    for (let line of lines) {
      const trimmed = line.trim();
      if (/^(-|\*|\d+\.)\s+/.test(trimmed)) {
        keyPoints.push(trimmed.replace(/^(-|\*|\d+\.)\s+/, ''));
        inKeyPoints = true;
      } else if (inKeyPoints && trimmed === '') {
        // End of key points
        inKeyPoints = false;
      } else if (!inKeyPoints && trimmed !== '') {
        summary += (summary ? ' ' : '') + trimmed;
      }
    }
    // If no key points detected, try to split by sentences
    if (keyPoints.length === 0 && summary.length > 0) {
      const sentences = summary.split(/(?<=[.!?])\s+/);
      summary = sentences[0];
      keyPoints = sentences.slice(1).filter(Boolean);
    }
    return { summary, keyPoints };
  }

  // Helper to format subtitles: '**Subtitle:**' -> '<b>Subtitle:</b>'
  function formatSubtitles(text) {
    return text.replace(/^(\s*)\*\*([^\n*]+?):\*\*/gm, '$1<b>$2:</b>');
  }

  try {
    const sortOptions = [
      { value: 'default', label: 'Default' },
      { value: 'scoreAsc', label: 'Low to High' },
      { value: 'scoreDesc', label: 'High to Low' },
    ];
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6 mx-40 pt-24 scrollbar-hide">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in-down gap-4">
            <h2 className="text-3xl font-bold mt-4 text-transparent bg-clip-text text-primary">Detected Vulnerabilities</h2>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold w-max transition-colors
                ${showFilters
                  ? 'bg-secondary text-primary'
                  : 'bg-gray-100 text-gray-700'}
              `}
              onClick={() => setShowFilters(f => !f)}
            >
              {showFilters ? (
                <>
                   <X size={18} />
                  Hide Filters
                </>
              ) : (
                <>
                  <Filter size={18} />
                  Show Filters
                </>
              )}
            </button>
          </div>

          {/* Filters and Sort: Toggleable */}
          {showFilters && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 mb-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col md:flex-row flex-wrap gap-4 pb-4 border-b border-gray-200 mb-4 items-stretch md:items-center">
                <CustomListbox
                  label={<span><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h6" /></svg>Agent</span>}
                  options={["All", ...agentOptions]}
                  value={selectedAgent}
                  onChange={val => { setSelectedAgent(val); setCurrentPage(1); }}
                />
                <CustomListbox
                  label={<span><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>Severity</span>}
                  options={["All", ...severityOptions]}
                  value={selectedSeverity}
                  onChange={val => { setSelectedSeverity(val); setCurrentPage(1); }}
                />
                <CustomListbox
                  label={<span><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" /></svg>Sort</span>}
                  options={sortOptions.map(o => o.label)}
                  value={sortOptions.find(o => o.value === sortOrder)?.label || 'Default'}
                  onChange={label => {
                    const selected = sortOptions.find(o => o.label === label);
                    setSortOrder(selected ? selected.value : 'default');
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          )}

          {/* Charts and Filters: Always visible */}
          <VulnerabilitiesChart
            severityChart={severityChart}
            packageChart={packageChart}
            agentChart={agentChart}
          />
          <VulnerabilitiesTable
            currentItems={currentItems}
            setSelectedVulnerability={setSelectedVulnerability}
            severityBadgeClassMap={severityBadgeClassMap}
            setShowChatbox={setShowChatbox}
            setMessages={setMessages}
            setChatInput={setChatInput}
            setThreadId={setThreadId}
            setShownMessageIds={setShownMessageIds}
            setChatboxVulnId={setChatboxVulnId}
            latestThreadIdRef={latestThreadIdRef}
            createThread={createThread}
            createMessage={createMessage}
            createRun={createRun}
            getRun={getRun}
            getMessages={getMessages}
            ASSISTANT_ID={ASSISTANT_ID}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />

        </div>

        {/* Absolutely positioned, resizable chatbox */}
        {showChatbox && (
          <div
            className="fixed top-16 right-0 h-[calc(100vh-4rem)] bg-white shadow-2xl z-50 overflow-auto rounded-l-3xl animate-fade-in-right"
            style={{
              width: chatboxWidth,
              minWidth: minChatboxWidth,
              maxWidth: maxChatboxWidth,
              display: 'block',
              pointerEvents: 'auto',
              transition: isDraggingRef.current ? 'none' : 'width 0.1s',
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 4,
                height: '100%',
                cursor: 'ew-resize',
                zIndex: 100,
                background: 'rgba(0,0,0,0.05)',
              }}
              onMouseDown={startDragging}
            />
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 rounded-t-3xl bg-secondary shadow text-primary">
                <span className="font-semibold text-lg tracking-wide flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2M12 15v-6m0 0l-3 3m3-3l3 3" /></svg>
                  Chat{chatboxVulnId ? ` (ID: ${chatboxVulnId})` : ''}
                </span>
                <button
                  className="text-primary text-3xl font-bold focus:outline-none transition"
                  onClick={() => setShowChatbox(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {/* Message area: flex-1, scrollable */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 bg-transparent scrollbar-hide"
              >
                {messages.length === 0 && (
                  <div className="text-gray-400 text-center">No messages yet.</div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end mb-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-5 py-3 rounded-2xl shadow-lg max-w-[70%] break-words transition-all duration-200 ${msg.isUser ? 'bg-primary text-white' : 'bg-secondary text-primary'}`}
                      style={{
                        borderTopLeftRadius: msg.isUser ? 20 : 20,
                        borderTopRightRadius: msg.isUser ? 20 : 20,
                        textAlign: msg.isUser ? 'right' : 'left',
                        direction: 'ltr',
                      }}
                    >
                      {msg.isUser ? (
                        msg.text
                      ) : (
                        <>
                          <div className="font-semibold text-blue-700 mb-1">Assistant's Response</div>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                              {formatSubtitles(msg.text)}
                            </ReactMarkdown>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-end mb-2 justify-start">
                    <div className="px-5 py-3 rounded-2xl shadow-lg max-w-[70%] break-words bg-secondary to-white text-primary animate-fade-in-left">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
      
              {/* Input area: always visible at the bottom */}
              <div className="p-4 bg-white rounded-b-3xl flex flex-col gap-2">
                {showChatbox && !threadId && (
                  <div className="text-gray-500 text-center py-2">Connecting to assistant...</div>
                )}
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 rounded-xl px-4 py-2 focus:outline-none focus:ring focus:ring-[#800080]  resize-none shadow-sm bg-secondary"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={e => {
                      setChatInput(e.target.value);
                      // Auto-resize logic
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                      // Shift+Enter: allow new line (default behavior)
                    }}
                    rows={1}
                    style={{ minHeight: 40, maxHeight: 200, overflowY: 'auto' }}
                    disabled={isLoading || !threadId}
                  />
                  <button
                    className="bg-primary text-white px-3 py-2 rounded-2xl font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-60"
                    onClick={handleSend}
                    disabled={isLoading || !threadId}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vulnerability Detail Popup */}
        {selectedVulnerability && (
          <VulnerabilityDetail
            vulnerability={selectedVulnerability}
            onClose={() => setSelectedVulnerability(null)}  
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering Vulnerabilities component:', error);
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-red-600 font-medium">An error occurred. Please try again later.</p>
      </div>
    );
  }
};

export default Vulnerabilities;