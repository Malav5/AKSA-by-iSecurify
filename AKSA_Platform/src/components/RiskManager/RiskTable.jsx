import React, { useState } from "react";
import { BadgeCheck, Filter, Search } from "lucide-react";
import Pagination from "../Pagination";
import DropdownSelect from "../ui/DropdownSelect";

const levelOptions = ["Critical", "High", "Medium", "Low"];
const treatmentOptions = ["Mitigate", "Accept", "Transfer", "Avoid"];

const staticRisks = [
  {
    id: "R18",
    name: "Hackers, malware utilise open ports or services to gain access to data or sensitive systems.",
    impact: "High",
    likelihood: "Low",
    initialScore: "Medium",
    treatment: "Mitigate",
    control: "",
    residualImpact: "Low",
    residualLikelihood: "Low",
    residualScore: "Low",
    owner: "SOC",
    lastAction: "09 Feb, 2024",
  },
  {
    id: "R17",
    name: "Hackers, malware utilise unmonitored ports or services to gain access to data or sensitive systems.",
    impact: "",
    likelihood: "",
    initialScore: "-",
    treatment: "",
    control: "",
    residualImpact: "",
    residualLikelihood: "",
    residualScore: "-",
    owner: "SOC",
    lastAction: "09 Feb, 2024",
  },
  {
    id: "R16",
    name: "Hackers gain access or data is encrypted as a result of a failure to detect ransomware or malware on systems.",
    impact: "",
    likelihood: "",
    initialScore: "-",
    treatment: "",
    control: "",
    residualImpact: "",
    residualLikelihood: "",
    residualScore: "-",
    owner: "SOC",
    lastAction: "09 Feb, 2024",
  },
  {
    id: "R15",
    name: "Hackers gain access or data is encrypted as a result of malware or ransomware executing on systems.",
    impact: "",
    likelihood: "",
    initialScore: "-",
    treatment: "",
    control: "",
    residualImpact: "",
    residualLikelihood: "",
    residualScore: "-",
    owner: "SOC",
    lastAction: "09 Feb, 2024",
  },
  {
    id: "R14",
    name: "Malicious insiders, Hackers or malware gain access to data or systems via a malicious email attachment.",
    impact: "",
    likelihood: "",
    initialScore: "-",
    treatment: "",
    control: "",
    residualImpact: "",
    residualLikelihood: "",
    residualScore: "-",
    owner: "SOC",
    lastAction: "09 Feb, 2024",
  },
];

export default function RisksTable() {
  const [risks, setRisks] = useState(staticRisks);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const totalPages = Math.ceil(filteredRisks.length / rowsPerPage);
  const paginatedRisks = filteredRisks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 max-w-full overflow-hidden">
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
              <th className="px-4 py-5">Risk Number</th>
              <th className="px-4 py-5">Risk Name</th>
              <th className="px-4 py-5">Impact</th>
              <th className="px-4 py-5">Likelihood</th>
              <th className="px-4 py-5">Initial Risk Score</th>
              <th className="px-4 py-5">Risk Treatment</th>
              <th className="px-4 py-5">Control Description</th>
              <th className="px-4 py-5">Residual Impact</th>
              <th className="px-4 py-5">Residual Likelihood</th>
              <th className="px-4 py-5">Residual Score</th>
              <th className="px-4 py-5">Owner</th>
              <th className="px-4 py-5">Last Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRisks.map((risk) => (
              <tr key={risk.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  {risk.id}
                </td>
                <td className="px-4 py-3 font-medium">{risk.name}</td>
                
                <td className="px-4 py-3">
                  <DropdownSelect
                    options={levelOptions}
                    value={risk.impact || ""}
                    onChange={(val) =>
                      handleSelectChange(risk.id, "impact", val)
                    }
                    placeholder="Select impact"
                  />
                </td>

                <td className="px-4 py-3">
                  <DropdownSelect
                    options={levelOptions}
                    value={risk.likelihood || ""}
                    onChange={(val) =>
                      handleSelectChange(risk.id, "likelihood", val)
                    }
                    placeholder="Select likelihood"
                  />
                </td>

                <td className="px-4 py-3">{risk.initialScore}</td>

                <td className="px-4 py-3">
                  <DropdownSelect
                    options={treatmentOptions}
                    value={risk.treatment || ""}
                    onChange={(val) =>
                      handleSelectChange(risk.id, "treatment", val)
                    }
                    placeholder="Select treatment"
                  />
                </td>

                <td className="px-4 py-3">
                  <input
                    type="text"
                    placeholder="Comment here"
                    value={risk.control}
                    onChange={(e) =>
                      handleSelectChange(risk.id, "control", e.target.value)
                    }
                    className="w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                  />
                </td>

                <td className="px-4 py-3">
                  <DropdownSelect
                    options={levelOptions}
                    value={risk.residualImpact || ""}
                    onChange={(val) =>
                      handleSelectChange(risk.id, "residualImpact", val)
                    }
                    placeholder="Select residual impact"
                  />
                </td>

                <td className="px-4 py-3">
                  <DropdownSelect
                    options={levelOptions}
                    value={risk.residualLikelihood || ""}
                    onChange={(val) =>
                      handleSelectChange(risk.id, "residualLikelihood", val)
                    }
                    placeholder="Select residual likelihood"
                  />
                </td>

                <td className="px-4 py-3">{risk.residualScore}</td>
                <td className="px-4 py-3">{risk.owner}</td>
                <td className="px-4 py-3">{risk.lastAction}</td>
              </tr>
            ))}
            {filteredRisks.length === 0 && (
              <tr>
                <td colSpan="12" className="px-4 py-8 text-center text-gray-500">
                  No risks found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => {
          setRowsPerPage(val);
          setCurrentPage(1);
        }}
        totalItems={filteredRisks.length}
      />
    </div>
  );
}