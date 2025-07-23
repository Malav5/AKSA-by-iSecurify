import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { fetchDomainData } from "../DashboardServices";
import { useNotifications } from "../../context/NotificationContext";

import { Loader2 } from "lucide-react";
const DomainRiskCard = ({ domain }) => {
  const [riskLevel, setRiskLevel] = useState("");
  const [riskDescription, setRiskDescription] = useState("");
  const [httpStatus, setHttpStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const { addNotification } = useNotifications();
  const riskColors = {
    High: "text-red-600 border-red-200 bg-red-50",
    Medium: "text-yellow-600 border-yellow-200 bg-yellow-50",
    Low: "text-green-600 border-green-200 bg-green-50",
  };

  useEffect(() => {
    if (!domain) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchDomainData(domain);
        const securityHeaders = data.http_security_headers || "";
        const status = data.http_status || "";
        setHttpStatus(status);

        const missingHeaders =
          (securityHeaders.match(/Missing Security Headers: (.+)/) ||
            [])[1]?.split(", ") || [];

        let level = "Low";
        let desc = "All essential HTTP security headers are present.";

        if (missingHeaders.length > 2) {
          level = "High";
          desc = `Multiple critical HTTP security headers are missing (${missingHeaders.join(
            ", "
          )}), increasing the risk of man-in-the-middle, MIME-type, and XSS attacks.`;
        } else if (missingHeaders.length > 0) {
          level = "Medium";
          desc = `Some important HTTP security headers are missing (${missingHeaders.join(
            ", "
          )}), which could lead to vulnerabilities.`;
        }

        setRiskLevel(level);
        setRiskDescription(desc);
      } catch (err) {
        setRiskLevel("Unknown");
        setRiskDescription("Could not retrieve HTTP security data.");
        setHttpStatus("N/A");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [domain]);

  const handleDownload = async () => {
    try {
      if (!domain) {
        alert("Domain is not available!");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:5000/api/download-report?domain=${domain}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch the report");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${domain}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      const newTab = window.open(link.href, "_blank");
      newTab.focus();
      document.body.removeChild(link);
      addNotification(`Report downloaded for ${domain}`, "📄");
    } catch (error) {
      console.error("Error downloading the report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 rounded-2xl text-center shadow">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-sm font-medium text-gray-600">
          Scanning Domain Risk...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg shadow p-4 sm:p-6 bg-white">
      <div className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Scanning results for{" "}
          <span className="text-primary font-bold">
            {domain || "Unknown Domain"}
          </span>{" "}
          domain
        </h2>
        <button
          className="flex items-center justify-center gap-2 border border-[#d288d2] text-primary hover:bg-[#f9ecf9] font-medium px-4 py-2 rounded-lg transition text-xs w-full sm:w-auto"
          onClick={handleDownload}
        >
          <FileText className="w-4 h-4" />
          Get Report
        </button>
      </div>

      <div
        className={`rounded-xl border p-4 sm:p-6 ${
          riskColors[riskLevel] || "border-gray-200"
        }`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700">
          Risk Assessment Level:{" "}
          <span
            className={`${
              riskColors[riskLevel]?.split(" ")[0] || "text-gray-800"
            }`}
          >
            {riskLevel || "N/A"}
          </span>
        </h3>
        <div className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 space-y-2">
          {riskLevel === "Low" && (
            <p>
              ✅{" "}
              <span className="font-medium">
                All essential HTTP security headers are present.
              </span>{" "}
              Your domain is well-protected from common vulnerabilities.
            </p>
          )}
          {riskLevel === "Medium" && (
            <>
              <p>
                ⚠️{" "}
                <span className="font-medium">
                  Some important security headers are missing:
                </span>
              </p>
              <ul className="list-disc list-inside pl-2 text-gray-700">
                {riskDescription
                  .match(/\((.*?)\)/)?.[1]
                  ?.split(", ")
                  .map((header, idx) => (
                    <li key={idx} className="text-yellow-700">
                      {header.trim()}
                    </li>
                  ))}
              </ul>
              <p>
                These missing headers may expose your domain to XSS,
                clickjacking, and data leakage risks.
              </p>
            </>
          )}
          {riskLevel === "High" && (
            <>
              <p>
                ❌{" "}
                <span className="font-medium text-red-600">
                  Multiple critical HTTP security headers are missing:
                </span>
              </p>
              <ul className="list-disc list-inside pl-2 text-red-600">
                {riskDescription
                  .match(/\((.*?)\)/)?.[1]
                  ?.split(", ")
                  .map((header, idx) => (
                    <li key={idx}>{header.trim()}</li>
                  ))}
              </ul>
              <p>
                This significantly increases the risk of{" "}
                <span className="font-semibold">man-in-the-middle</span>{" "}
                attacks,{" "}
                <span className="font-semibold">MIME-type sniffing</span>, and{" "}
                <span className="font-semibold">cross-site scripting</span>{" "}
                (XSS).
              </p>
            </>
          )}
        </div>

        <p className="text-sm text-gray-500">
          HTTP Status: {httpStatus || "Status unknown"}
        </p>
      </div>
    </div>
  );
};

export default DomainRiskCard;
