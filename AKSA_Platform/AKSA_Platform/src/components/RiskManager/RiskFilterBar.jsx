import { useState } from "react";

const RiskFiltersBar = ({ onFilterChange, onCreateRisk, riskCount }) => {
  const [owner, setOwner] = useState("");
  const [impact, setImpact] = useState("");
  const [likelihood, setLikelihood] = useState("");
  const [status, setStatus] = useState("");

  const owners = ["Alice", "Bob", "Charlie", "Dana"];
  const impacts = ["Low", "Medium", "High", "Severe"];
  const likelihoods = [
    "Rare",
    "Unlikely",
    "Possible",
    "Likely",
    "Almost Certain",
  ];
  const statuses = ["Identified", "Assessed", "Mitigated", "Closed"];

  const handleChange = (field, value) => {
    if (field === "owner") setOwner(value);
    if (field === "impact") setImpact(value);
    if (field === "likelihood") setLikelihood(value);
    if (field === "status") setStatus(value);

    onFilterChange?.({
      owner: field === "owner" ? value : owner,
      impact: field === "impact" ? value : impact,
      likelihood: field === "likelihood" ? value : likelihood,
      status: field === "status" ? value : status,
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
      <div className="flex flex-wrap items-center gap-4">
        {/* <div>
          <label className="mr-2 font-semibold">Owner:</label>
          <select
            value={owner}
            onChange={(e) => handleChange("owner", e.target.value)}
            className="bg-[#1e1c4f] text-white rounded px-3 py-2"
          >
            <option value="">All</option>
            {owners.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Impact:</label>
          <select
            value={impact}
            onChange={(e) => handleChange("impact", e.target.value)}
            className="bg-[#1e1c4f] text-white rounded px-3 py-2"
          >
            <option value="">All</option>
            {impacts.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Likelihood:</label>
          <select
            value={likelihood}
            onChange={(e) => handleChange("likelihood", e.target.value)}
            className="bg-[#1e1c4f] text-white rounded px-3 py-2"
          >
            <option value="">All</option>
            {likelihoods.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold">Status:</label>
          <select
            value={status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="bg-[#1e1c4f] text-white rounded px-3 py-2"
          >
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div> */}
      </div>

      <div className="flex items-center gap-4">
       
        <button
          onClick={onCreateRisk}
          className="bg-primary text-white font-semibold px-4 py-2 rounded shadow"
        >
          + Create Risk
        </button>
      </div>
    </div>
  );
};

export default RiskFiltersBar;
