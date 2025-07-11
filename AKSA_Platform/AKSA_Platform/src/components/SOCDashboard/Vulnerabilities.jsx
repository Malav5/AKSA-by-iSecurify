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
import VulnerabilityDetail from './VulnerabilityDetail';
import { fetchVulnerabilities } from '../../services/SOCservices';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getOpenAIApiKey } from '../../utils/apiKey';

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
  // OpenAI API integration
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

  // Get unique agents and severities for filter dropdowns
  const agentOptions = Array.from(new Set(vulnerabilities.map(v => v._source?.agent?.name || 'Unknown')));

  // Filter vulnerabilities based on selected filters
  const filteredVulnerabilities = vulnerabilities.filter(v => {
    const agent = v._source?.agent?.name || 'Unknown';
    const severity = v._source?.vulnerability?.severity || 'Unknown';
    return (selectedAgent === 'All' || agent === selectedAgent) &&
      (selectedSeverity === 'All' || severity === selectedSeverity);
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

  const severityColorMap = {
    'Critical': 'rgba(236, 72, 153, 0.7)', // pink
    'High': 'rgba(239, 68, 68, 0.7)',    // red
    'Medium': 'rgba(234, 179, 8, 0.7)',  // amber/yellow
    'Low': 'rgba(16, 185, 129, 0.7)',    // emerald/green
    'Unknown': 'rgba(156, 163, 175, 0.7)', // gray
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
        // Use the same color but with opacity 1 for border
        if (sev === 'Critical') return 'rgba(236, 72, 153, 1)';
        if (sev === 'High') return 'rgba(239, 68, 68, 1)';
        if (sev === 'Medium') return 'rgba(234, 179, 8, 1)';
        if (sev === 'Low') return 'rgba(16, 185, 129, 1)';
        return 'rgba(156, 163, 175, 1)';
      }),
      borderWidth: 1,
    }],
  };

  const chartColors = [
    'rgba(88, 80, 141, 0.7)',
    'rgba(188, 80, 144, 0.7)',
    'rgba(255, 99, 97, 0.7)',
    'rgba(255, 166, 0, 0.7)',
    'rgba(44, 115, 210, 0.7)',
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
      borderColor: chartColors.map(c => c.replace('0.7', '1')),
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
      borderColor: chartColors.map(c => c.replace('0.7', '1')),
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
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-50/50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4 w-full flex-grow overflow-y-auto scrollbar-hide mt-20">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8 animate-fade-in-down">Detected Vulnerabilities</h2>

          {loading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
              <span className="ml-4 text-blue-600 font-medium">Loading vulnerabilities...</span>
            </div>
          ) : sortedVulnerabilities.length === 0 ? (
            <p>No vulnerabilities found.</p>
          ) : (
            <>
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Severity Distribution</h3>
                  <Bar data={severityChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Top Packages Affected</h3>
                  <Doughnut data={packageChart} />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Top Affected Agents</h3>
                  <Pie data={agentChart} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                {/* Filters and Sort */}
                <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-200 mb-4 items-center">
                  <div>
                    <label className="mr-2 font-medium">Agent:</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={selectedAgent}
                      onChange={e => {
                        setSelectedAgent(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="All">All</option>
                      {agentOptions.map(agent => (
                        <option key={agent} value={agent}>{agent}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mr-2 font-medium">Severity:</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={selectedSeverity}
                      onChange={e => {
                        setSelectedSeverity(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="All">All</option>
                      {severityOptions.map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mr-2 font-medium">Sort:</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={sortOrder}
                      onChange={e => {
                        setSortOrder(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="default">Default</option>
                      <option value="scoreAsc">Score: Low to High</option>
                      <option value="scoreDesc">Score: High to Low</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 mb-3">
                  <h3 className="text-lg font-semibold text-gray-700">Alert Details</h3>
                </div>

                {/* Scrollable Table */}
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto scrollbar-hide">
                  <table className="min-w-full table-auto text-sm text-left">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, index) => {
                        const v = item._source;
                        return (
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-50/50 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td
                              className="px-6 py-4 whitespace-nowrap text-red-600 font-medium cursor-pointer"
                              onClick={() => setSelectedVulnerability(item)}
                            >
                              {v.vulnerability?.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${severityBadgeClassMap[v.vulnerability?.severity] || severityBadgeClassMap['Unknown']}`}>
                                {v.vulnerability?.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{v.agent?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{v.package?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{v.vulnerability?.score?.base}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={v.vulnerability?.scanner?.reference}
                                className="text-blue-600 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Link
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transform transition-transform duration-200 hover:scale-110"
                                onClick={async e => {
                                  e.stopPropagation();
                                  setShowChatbox(false); // Close if open to reset state
                                  setTimeout(async () => {
                                    setMessages([]);
                                    setChatInput("");
                                    setThreadId(null);
                                    setShownMessageIds([]);
                                    setShowChatbox(true);
                                    setChatboxVulnId(item._source?.vulnerability?.id || null); // Set vuln ID for chatbox heading
                                    latestThreadIdRef.current = null; // Reset before new thread
                                    // Create a new thread and send the log JSON for summary
                                    const logJson = JSON.stringify(item, null, 2);
                                    setMessages(prev => [...prev, { text: logJson, isUser: true }]);
                                    setIsLoading(true);
                                    try {
                                      const newThreadId = await createThread();
                                      setThreadId(newThreadId);
                                      latestThreadIdRef.current = newThreadId; // Track the latest threadId
                                      const prompt = `Summarize the following log in simple terms, and reply in a clear, official style. Use Markdown formatting (bold, lists, etc.) only when it helps clarity, not for every label or section. Avoid excessive bold, headings, or stars.\n\n${logJson}`;
                                      await createMessage(newThreadId, prompt);
                                      const runId = await createRun(newThreadId, ASSISTANT_ID);
                                      let runStatus = 'queued';
                                      while (runStatus !== 'completed' && runStatus !== 'failed') {
                                        await new Promise(res => setTimeout(res, 1500));
                                        const run = await getRun(newThreadId, runId);
                                        runStatus = run.status;
                                      }
                                      const allMsgs = await getMessages(newThreadId);
                                      const newAssistantMsgs = allMsgs
                                        .filter(m => m.role === 'assistant' && !shownMessageIds.includes(m.id))
                                        .sort((a, b) => a.created_at - b.created_at);
                                      if (latestThreadIdRef.current === newThreadId && newAssistantMsgs.length > 0) {
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
                                  }, 50);
                                }}
                                title="Info"
                              >
                                i
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination & Rows */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm">Rows per page:</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-200 hover:scale-105"
                    >
                      Prev
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-700">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform duration-200 hover:scale-105"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Absolutely positioned, resizable chatbox */}
        {showChatbox && (
          <div
            className="fixed top-16 right-0 h-[calc(100vh-4rem)] bg-white shadow-2xl border-l-2 border-gray-300 z-50 overflow-auto"
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
                width: 4, // thinner handle
                height: '100%',
                cursor: 'ew-resize',
                zIndex: 100,
                background: 'rgba(0,0,0,0.05)', // subtle background for visibility
              }}
              onMouseDown={startDragging}
            />
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <span className="font-semibold text-lg">
                  Chat{chatboxVulnId ? ` (ID: ${chatboxVulnId})` : ''}
                </span>
                <button
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                  onClick={() => setShowChatbox(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {/* Message area: flex-1, scrollable */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-white scrollbar-left"
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
                      className={`px-4 py-2 rounded-2xl shadow max-w-[70%] break-words ${msg.isUser ? 'bg-[#f8eef9] text-black animate-fade-in-right' : 'bg-gray-200 text-black animate-fade-in-left'}`}
                      style={{
                        borderTopLeftRadius: msg.isUser ? 20 : 0,
                        borderTopRightRadius: msg.isUser ? 0 : 20,
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
                    <div className="px-4 py-2 rounded-2xl shadow max-w-[70%] break-words bg-gray-200 text-black animate-fade-in-left">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              {/* Input area: always visible at the bottom */}
              <div className="p-4 border-t border-gray-200 flex flex-col gap-2 bg-white">
                {showChatbox && !threadId && (
                  <div className="text-gray-500 text-center py-2">Connecting to assistant...</div>
                )}
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 resize-none"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    onClick={handleSend}
                    disabled={isLoading || !threadId}
                  >
                    Send
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