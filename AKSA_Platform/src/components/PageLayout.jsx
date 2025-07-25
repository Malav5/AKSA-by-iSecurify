import React, { useState, useEffect } from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import Header from "../components/Dashboard/Header";
import ShowMetrices from "../components/Issues/ShowMetrices";
import {
  fetchDomainProblems,
  fetchDNSData,
  fetchWebServerData,
  fetchMxRecords,
} from "../services/servicedomain";

const PageLayout = ({
  title,
  domain,
  searchQuery,
  setSearchQuery,
  children,
  onCardClick,
}) => {
  const [showMetrices, setShowMetrices] = useState(false);
  const [diagnosticCounts, setDiagnosticCounts] = useState({
    errors: 0,
    warning: 0,
    solved: 0,
  });
  const [dnsCounts, setDnsCounts] = useState({
    errors: 0,
    warning: 0,
    solved: 0,
  });
  const [webServerCounts, setWebServerCounts] = useState({
    http: { errors: 0, warning: 0, solved: 0 },
    https: { errors: 0, warning: 0, solved: 0 },
  });
  const [mailServerCounts, setMailServerCounts] = useState({
    errors: 0,
    warning: 0,
    solved: 0,
  });

  // Fetch diagnostics and DNS counts
  useEffect(() => {
    const loadDiagnostics = async () => {
      try {
        const diagnostics = await fetchDomainProblems(domain);

        if (!diagnostics || diagnostics.length === 0) {
          setDiagnosticCounts({ errors: 0, warning: 0, solved: 0 });
          return;
        }

        let errors = 0;
        let warning = 0;
        let solved = 0;

        diagnostics.forEach((item) => {
          if (item.level === "error") {
            errors++;
          } else if (item.level === "warning") {
            warning++;
          } else if (item.level === "pass") {
            solved++;
          }
        });

        setDiagnosticCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching diagnostics:", error);
      }
    };
    const loadMailServerCounts = async () => {
      try {
        const mxRecords = await fetchMxRecords(domain);

        // If error returned as array with error string
        if (mxRecords.length === 1 && mxRecords[0].error) {
          setMailServerCounts({ errors: 1, warning: 0, solved: 0 });
          return;
        }

        let errors = 0;
        let warning = 0;
        let solved = 0;

        mxRecords.forEach((record) => {
          // Example simple checks (customize based on your real data)
          if (!record.ip || !record.hostname) {
            errors++;
          } else if (record.ttl && parseInt(record.ttl) < 300) {
            warning++;
          } else {
            solved++;
          }
        });

        setMailServerCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching mail server data:", error);
        setMailServerCounts({ errors: 1, warning: 0, solved: 0 });
      }
    };

    const loadDNSCounts = async () => {
      try {
        const dnsData = await fetchDNSData(domain);
        if (!dnsData || dnsData.length === 0) {
          setDnsCounts({ errors: 0, warning: 0, solved: 0 });
          return;
        }

        let errors = 0;
        let warning = 0;
        let solved = 0;

        dnsData.forEach((item) => {
          if (item.level === "error") {
            errors++;
          } else if (item.level === "warning") {
            warning++;
          } else if (item.level === "passed") {
            solved++;
          }
        });

        setDnsCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching DNS data:", error);
      }
    };

    const loadWebServerCounts = async () => {
      try {
        const data = await fetchWebServerData(domain);

        if (!data || data.length === 0) {
          setWebServerCounts({ errors: 0, warning: 0, solved: 0 });
          return;
        }

        const counts = { errors: 0, warning: 0, solved: 0 };

        data.forEach((item) => {
          if (item.level === "error") {
            counts.errors++;
          } else if (item.level === "warning") {
            counts.warning++;
          } else if (item.level === "passed") {
            counts.solved++;
          }
        });

        setWebServerCounts(counts);
      } catch (error) {
        console.error("Error fetching web server data:", error);
      }
    };

    loadDiagnostics();
    loadDNSCounts();
    loadMailServerCounts();
    loadWebServerCounts(); // Fetch Web Server counts as well
  }, [domain]);

  // const cards = [
  //   { title: "Problems", ...diagnosticCounts },
  //   { title: "Blacklist", errors: 7, warning: 0, solved: 0 },
  //   { title: "Mail Server", errors: 0, warning: 0, solved: 5 },
  //   {
  //     title: "Web Server",
  //     ...webServerCounts,
  //   },
  //   { title: "DNS", ...dnsCounts },
  // ];

  return (
    <div className="min-h-screen bg-white flex scrollbar-hide relative">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8">
        <Header />

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm cursor-pointer"
              onClick={() =>
                onCardClick(card.title.toLowerCase().replace(/\s+/g, ""))
              }
            >
              <h3 className="text-gray-700 font-medium mb-3">{card.title}</h3>
              <hr className="text-gray-200" />
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {card.errors} Errors
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {card.warning} Warnings
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {card.solved} Solved
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div> */}

        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-600 mb-4">{domain}</p>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-2 pl-8 border border-gray-300 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute left-2 top-3 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex gap-2">
              <button
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => setShowMetrices(true)}
              >
                Show Metrices
              </button>
              <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 cursor-pointer">
                Filter
              </button>
              <button className="px-6 py-2 bg-primary text-white rounded cursor-pointer">
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white">{children}</div>

        {showMetrices && (
          <ShowMetrices onCancel={() => setShowMetrices(false)} />
        )}
      </div>
    </div>
  );
};

export default PageLayout;
