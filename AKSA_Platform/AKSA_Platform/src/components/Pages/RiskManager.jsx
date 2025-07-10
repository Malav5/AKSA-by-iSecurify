import { useState } from "react";
import Sidebar from "../Dashboard/Sidebar";
import RiskManagement from "../Dashboard/RiskManagement";
import RisksTable from "../RiskManager/RiskTable";
import RiskFiltersBar from "../RiskManager/RiskFilterBar";
import CreateRisk from "../RiskManager/CreateRisk";

const RisksManager = () => {
  const [filters, setFilters] = useState({});
  const [riskCount, setRiskCount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [riskData, setRiskData] = useState({
    name: "",
    description: "",
    status: "",
    impact: "",
    likelihood: "",
    owner: "",
    strategy: "",
    notes: "",
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreateRiskClick = () => {
    setRiskData({
      name: "",
      description: "",
      status: "",
      impact: "",
      likelihood: "",
      owner: "",
      strategy: "",
      notes: "",
    });
    setIsCreating(true);
  };

  const handleCloseCreateRisk = () => {
    setIsCreating(false);
  };

  const handleSubmitRisk = () => {
    console.log("Submitting Risk:", riskData);
    setIsCreating(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-gray-800">
      {/* Sidebar - Sticky */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white p-6 pb-0">
          <a href="/dashboard" className="mb-2 text-primary">
            &lt; Go back to dashboard
          </a>
          <h1 className="text-2xl font-bold mt-2 mb-6">All your risks</h1>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pt-0">
          <RiskManagement hideViewAll={true}/>

          <RiskFiltersBar
            onFilterChange={handleFilterChange}
            onCreateRisk={handleCreateRiskClick}
            riskCount={riskCount}
          />

          <RisksTable filters={filters} />
        </div>
      </div>

      {/* Modal - Risk Creation */}
      {isCreating && (
        <CreateRisk
          riskData={riskData}
          setRiskData={setRiskData}
          onClose={handleCloseCreateRisk}
          onSubmit={handleSubmitRisk}
        />
      )}
    </div>
  );
};

export default RisksManager;
