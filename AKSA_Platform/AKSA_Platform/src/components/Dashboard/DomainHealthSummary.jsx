import React, { useState, useEffect } from "react";
import { ShieldAlert, Ban, Mail, Server, Globe } from "lucide-react";
import {
  fetchDomainProblems,
  fetchDNSData,
  fetchMxRecords,
  fetchWebServerData,
  fetchBlacklistData,
} from "../DashboardServices";

const DomainHealthSummary = ({ domain, goToSection }) => {
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
  const [mailServerCounts, setMailServerCounts] = useState({
    errors: 0,
    warning: 0,
    solved: 0,
  });
  const [webServerCounts, setWebServerCounts] = useState({
    errors: 0,
    warning: 0,
    solved: 0,
  });
  const [blacklistCounts, setBlacklistCounts] = useState({
    errors: 0,
    warning: 0,
    solved: 0,
  });

  useEffect(() => {
    const loadDiagnostics = async () => {
      try {
        const diagnostics = await fetchDomainProblems(domain);
        let errors = 0,
          warning = 0,
          solved = 0;
        diagnostics?.forEach((item) => {
          if (item.level === "error") errors++;
          else if (item.level === "warning") warning++;
          else if (item.level === "pass") solved++;
        });
        setDiagnosticCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching diagnostics:", error);
      }
    };

    const loadDNSCounts = async () => {
      try {
        const dnsData = await fetchDNSData(domain);
        let errors = 0,
          warning = 0,
          solved = 0;
        dnsData?.forEach((item) => {
          if (item.level === "error") errors++;
          else if (item.level === "warning") warning++;
          else if (item.level === "passed") solved++;
        });
        setDnsCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching DNS data:", error);
      }
    };

    const loadMailServerCounts = async () => {
      try {
        const mxRecords = await fetchMxRecords(domain);
        let errors = 0,
          warning = 0,
          solved = 0;
        if (mxRecords?.length === 1 && mxRecords[0].error) {
          errors = 1;
        } else {
          mxRecords?.forEach((record) => {
            if (!record.ip || !record.hostname) errors++;
            else if (record.ttl && parseInt(record.ttl) < 300) warning++;
            else solved++;
          });
        }
        setMailServerCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching mail server data:", error);
        setMailServerCounts({ errors: 1, warning: 0, solved: 0 });
      }
    };

    const loadWebServerCounts = async () => {
      try {
        const data = await fetchWebServerData(domain);
        let errors = 0,
          warning = 0,
          solved = 0;
        data?.forEach((item) => {
          if (item.level === "error") errors++;
          else if (item.level === "warning") warning++;
          else if (item.level === "passed") solved++;
        });
        setWebServerCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching web server data:", error);
      }
    };

    const loadBlacklistCounts = async () => {
      try {
        const data = await fetchBlacklistData(domain);
        let errors = 0,
          warning = 0,
          solved = 0;
        data?.forEach((item) => {
          if (item.status === "blacklisted") errors++;
          else if (item.status === "warning") warning++;
          else solved++;
        });
        setBlacklistCounts({ errors, warning, solved });
      } catch (error) {
        console.error("Error fetching blacklist data:", error);
      }
    };

    loadDiagnostics();
    loadDNSCounts();
    loadMailServerCounts();
    loadWebServerCounts();
    loadBlacklistCounts();
  }, [domain]);

  const sections = [
    {
      label: "Problems",
      ...diagnosticCounts,
      icon: <ShieldAlert className="w-4 h-4" />,
      onClick: () => goToSection("problems"),
    },
    {
      label: "Blacklist",
      ...blacklistCounts,
      icon: <Ban className="w-4 h-4" />,
      onClick: () => goToSection("blacklist"),
    },
    {
      label: "Mail Server",
      ...mailServerCounts,
      icon: <Mail className="w-4 h-4" />,
      onClick: () => goToSection("mailserver"),
    },
    {
      label: "Web Server",
      ...webServerCounts,
      icon: <Server className="w-4 h-4" />,
      onClick: () => goToSection("webserver"),
    },
    {
      label: "DNS",
      ...dnsCounts,
      icon: <Globe className="w-4 h-4" />,
      onClick: () => goToSection("dns"),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mt-2 mb-8">Domain Health Summary</h3>
      <div className="space-y-3 text-sm">
        {sections.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between bg-[#F8FAFC] rounded-lg text-[#64748B] font-medium px-3 py-2.5 cursor-pointer hover:bg-[#e2e8f0]"
            onClick={item.onClick}
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <div className="flex gap-3 text-right">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-red-500">{item.errors}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <span className="text-yellow-500">{item.warning}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-green-500">{item.solved}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainHealthSummary;
