import React, { useState, useEffect } from "react";
import { BadgeCheck, Filter, Search, MoreHorizontal } from "lucide-react";
import RiskDetail from "./RiskDetail";
import Pagination from "../Pagination";
import {fetchVulnerabilities} from "../../services/SOCservices";

const levelOptions = ["Critical", "High", "Medium", "Low"];
const treatmentOptions = ["Mitigate", "Accept", "Transfer", "Avoid"];
const ITEMS_PER_PAGE = 5;

const getImpactColor = () =>
  "rounded-md border border-gray-300 bg-white text-black text-xs font-medium px-2 py-1";
const getLikelihoodColor = () =>
  "rounded-md border border-gray-300 bg-white text-black text-xs font-medium px-2 py-1";

export default function RisksTable() {
  const [risks, setRisks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchVulnerabilities();
  
        const mappedRisks = data.map((vuln, index) => {
          const source = vuln._source;
  
          return {
            id: vuln._id || `RSK-${index + 1}`,
            name: `CVE Risk: ${source.vulnerability?.id || 'Unknown Risk'}`,
            impact: source.vulnerability?.severity || "Medium",
            likelihood: "Medium", // This can be customized based on your logic
            initialScore: source.vulnerability?.score?.base || 10,
            treatment: "Mitigate",
            control: source.vulnerability?.description || "N/A",
            owner: source.agent?.name || "Security Team",
            lastAction: new Date(source.vulnerability?.detected_at || Date.now()).toLocaleDateString(),
            status: source.vulnerability?.under_evaluation ? "Under Evaluation" : "To Do"
          };
        });
  
        setRisks(mappedRisks);
      } catch (error) {
        console.error("Error loading vulnerabilities:", error);
      }
    };
  
    fetchData();
  }, []);
  

  const handleSelectChange = (id, field, value) => {
    const updatedRisks = risks.map((risk) =>
      risk.id === id ? { ...risk, [field]: value } : risk
    );
    setRisks(updatedRisks);
  };

  const filteredRisks = risks.filter(
    (risk) =>
      risk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRisks.length / ITEMS_PER_PAGE);
  const paginatedRisks = filteredRisks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-full overflow-hidden">
      {/* Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="text-sm uppercase bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-5">Risk ID</th>
              <th className="px-4 py-5">Risk Name</th>
              <th className="px-4 py-5">Impact</th>
              <th className="px-4 py-5">Likelihood</th>
              <th className="px-4 py-5">Risk Score</th>
              <th className="px-4 py-5">Treatment</th>
              <th className="px-4 py-5">Control</th>
              <th className="px-4 py-5">Owner</th>
              <th className="px-4 py-5">Last Action</th>
              <th className="px-4 py-5 sr-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRisks.map((risk) => (
              <tr
                key={risk.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td
                  className="px-4 py-3 font-medium text-primary flex items-center gap-2 cursor-pointer"
                  onClick={() => setSelectedRisk(risk)}
                >
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {risk.id}
                </td>
                <td
                  className="px-4 py-3 font-medium cursor-pointer"
                  onClick={() => setSelectedRisk(risk)}
                >
                  {risk.name}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={risk.impact}
                    onChange={(e) =>
                      handleSelectChange(risk.id, "impact", e.target.value)
                    }
                    className={getImpactColor()}
                  >
                    {levelOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={risk.likelihood}
                    onChange={(e) =>
                      handleSelectChange(risk.id, "likelihood", e.target.value)
                    }
                    className={getLikelihoodColor()}
                  >
                    {levelOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium border border-gray-300 text-gray-800 bg-white">
                    {risk.initialScore}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={risk.treatment}
                    onChange={(e) =>
                      handleSelectChange(risk.id, "treatment", e.target.value)
                    }
                    className="rounded-md border border-gray-300 bg-white text-gray-800 text-xs font-medium px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {treatmentOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td
                  className="px-4 py-3 text-gray-600 max-w-xs truncate"
                  title={risk.control}
                >
                  {risk.control}
                </td>
                <td className="px-4 py-3 text-gray-600">{risk.owner}</td>
                <td className="px-4 py-3 text-gray-600">{risk.lastAction}</td>
                <td className="px-4 py-3">
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRisk(risk);
                    }}
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredRisks.length === 0 && (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                  No risks found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {filteredRisks.length > 0 && (
        <div className="flex justify-end mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <RiskDetail risk={selectedRisk} onClose={() => setSelectedRisk(null)} />
      )}
    </div>
  );
}
