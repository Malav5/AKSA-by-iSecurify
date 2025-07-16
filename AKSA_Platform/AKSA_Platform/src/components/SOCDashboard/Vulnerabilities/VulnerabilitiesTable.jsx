import React from 'react';

const VulnerabilitiesTable = ({
  currentItems,
  setSelectedVulnerability,
  severityBadgeClassMap,
  setShowChatbox,
  setMessages,
  setChatInput,
  setThreadId,
  setShownMessageIds,
  setChatboxVulnId,
  latestThreadIdRef,
  createThread,
  createMessage,
  createRun,
  getRun,
  getMessages,
  ASSISTANT_ID,
  isLoading,
  setIsLoading,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/80 mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <div className="flex justify-between items-center mt-4 mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Alert Details</h3>
      </div>
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
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No vulnerabilities found.</td>
              </tr>
            ) : (
              currentItems.map((item, index) => {
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${severityBadgeClassMap[v.vulnerability?.severity] || severityBadgeClassMap['Unknown']}`}>{v.vulnerability?.severity}</span>
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
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-primary font-bold hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-[#800080] transform transition-transform duration-200 hover:scale-110"
                        onClick={async e => {
                          e.stopPropagation();
                          setShowChatbox(false);
                          setTimeout(async () => {
                            setMessages([]);
                            setChatInput("");
                            setThreadId(null);
                            setShownMessageIds([]);
                            setShowChatbox(true);
                            setChatboxVulnId(item._source?.vulnerability?.id || null);
                            latestThreadIdRef.current = null;
                            const logJson = JSON.stringify(item, null, 2);
                            setMessages(prev => [...prev, { text: logJson, isUser: true }]);
                            setIsLoading(true);
                            try {
                              const newThreadId = await createThread();
                              setThreadId(newThreadId);
                              latestThreadIdRef.current = newThreadId;
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
              })
            )}
          </tbody>
        </table>
      </div>
      {currentItems.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm">Rows per page:</label>
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-2 py-1"
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
      )}
    </div>
  );
};

export default VulnerabilitiesTable; 