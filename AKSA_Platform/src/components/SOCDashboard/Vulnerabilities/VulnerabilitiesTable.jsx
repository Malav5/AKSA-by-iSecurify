import React, { useRef, useState, useEffect } from 'react';
import { Listbox } from '@headlessui/react';

const pageSizes = [10, 20, 50];

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
  totalPages,
  vulnThreads,
  setVulnThreads,
  initializeChatbox,
  currentChatboxThread,
  setCurrentChatboxThread
}) => {
  const listboxButtonRef = useRef(null);
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    const handlePosition = () => {
      if (!listboxButtonRef.current) return;
      const rect = listboxButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDropUp(spaceBelow < 250 && spaceAbove > 250);
    };
    handlePosition();
    window.addEventListener('resize', handlePosition);
    window.addEventListener('scroll', handlePosition, true);
    return () => {
      window.removeEventListener('resize', handlePosition);
      window.removeEventListener('scroll', handlePosition, true);
    };
  }, []);

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
                            setShownMessageIds([]);
                            setShowChatbox(true);
                            const vulnId = item._source?.vulnerability?.id || null;
                            setChatboxVulnId(vulnId);
                            
                            // Initialize chatbox with dedicated thread
                            const threadIdToUse = await initializeChatbox(vulnId);
                            
                            if (!threadIdToUse) {
                              console.error('Failed to initialize chatbox thread');
                              setMessages(prev => [...prev, { text: 'Error: Could not initialize chat session.', isUser: false }]);
                              setIsLoading(false);
                              return;
                            }
                            
                            const logJson = JSON.stringify(item, null, 2);
                            setMessages(prev => [...prev, { text: logJson, isUser: true }]);
                            setIsLoading(true);
                            try {
                              const prompt = `Summarize the following log in simple terms, and reply in a clear, official style. Use Markdown formatting (bold, lists, etc.) only when it helps clarity, not for every label or section. Avoid excessive bold, headings, or stars.\n\n${logJson}`;
                              await createMessage(threadIdToUse, prompt);
                              const runId = await createRun(threadIdToUse, ASSISTANT_ID);
                              let runStatus = 'queued';
                              while (runStatus !== 'completed' && runStatus !== 'failed') {
                                await new Promise(res => setTimeout(res, 1500));
                                const run = await getRun(threadIdToUse, runId);
                                runStatus = run.status;
                              }
                              const allMsgs = await getMessages(threadIdToUse);
                              const newAssistantMsgs = allMsgs
                                .filter(m => m.role === 'assistant')
                                .sort((a, b) => a.created_at - b.created_at)
                                .slice(-1); // Only the latest
                              if (newAssistantMsgs.length > 0) {
                                setMessages(prev => {
                                  const updated = [
                                    ...prev,
                                    ...newAssistantMsgs.map(m => {
                                      let reply = '';
                                      if (Array.isArray(m.content) && m.content.length > 0 && m.content[0].type === 'text' && m.content[0].text && typeof m.content[0].text.value === 'string') {
                                        reply = m.content[0].text.value;
                                      } else if (typeof m.content === 'string') {
                                        reply = m.content;
                                      } else {
                                        reply = 'Error: Could not parse assistant response.';
                                      }
                                      return { text: reply, isUser: false };
                                    })
                                  ];
                                  return updated;
                                });
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
            <Listbox value={itemsPerPage} onChange={value => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
              <div className="relative w-24">
                <Listbox.Button ref={listboxButtonRef} className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-1 pl-3 pr-8 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                  {itemsPerPage}
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </Listbox.Button>
                <Listbox.Options className={`absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base focus:outline-none sm:text-sm ${dropUp ? 'bottom-full mb-1' : 'mt-1'}`}>
                  {pageSizes.map((size) => (
                    <Listbox.Option
                      key={size}
                      value={size}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{size}</span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
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