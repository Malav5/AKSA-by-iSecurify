// IssuesPage.jsx
import { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar";
import FiltersBar from "../IssuePage/FiltersBar";
import IssuesTable from "../IssuePage/IssuesTable";
import IssueManagement from "../Dashboard/IssueManagement";
import CreateIssue from "../IssuePage/CreateIssue";

export default function IssuesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [issueData, setIssueData] = useState({ name: "", description: "" });

  const handleCreateClick = () => setShowCreateForm(true);
  const handleClose = () => {
    setShowCreateForm(false);
    setIssueData({ name: "", description: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New issue created:", issueData);
    // Post to API here if needed
    handleClose();
  };

  return (
    <div className="flex overflow-hidden bg-white text-gray-800">
      {/* Sidebar - Sticky */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main content with scrollable area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white p-6 pb-0">
          <a href="/dashboard" className="mb-2 text-primary">
            &lt; Go back to dashboard
          </a>
          <h1 className="text-2xl font-bold mt-2 mb-6">All your issues</h1>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pt-0">
          {/* <IssueManagement hideViewAll={true} />

          <FiltersBar onCreateIssue={handleCreateClick} />

          <IssuesTable /> */}

          {/* Winlogbeat Events Section - Moved */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-primary mb-6">Device Monitoring</h2>
            <WinlogbeatEvents />
          </div>
        </div>
      </div>

      {/* Full-screen overlay form */}
      {showCreateForm && (
        <CreateIssue
          issueData={issueData}
          setIssueData={setIssueData}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
