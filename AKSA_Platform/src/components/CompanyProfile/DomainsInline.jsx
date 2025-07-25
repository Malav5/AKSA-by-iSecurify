import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { domainServices } from "../../services/domainServices"; // adjust path if needed
import { Globe, PlusCircle } from "lucide-react";

const DomainsInline = ({ setShowDomainsInline }) => {
  const [domains, setDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const selectAllRef = useRef();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");

  const userEmail = localStorage.getItem("currentUser");

  const fetchDomains = async () => {
    try {
      const data = await domainServices.fetchDomains();
      setDomains(data || []);
    } catch (err) {
      console.error("Failed to fetch domains", err);
      toast.error("Failed to fetch domains.");
      setDomains([]);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the domain "${name}"?`
    );
    if (!confirmDelete) return;

    try {
      await domainServices.deleteDomain(id);
      toast.success("Domain deleted successfully");
      fetchDomains();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.error || "Failed to delete domain");
    }
  };

  const handleAddDomain = async () => {
    setShowAddModal(true);
    setNewDomainName("");
  };

  const handleAddDomainSubmit = async () => {
    if (!newDomainName) return;
    try {
      const payload = { name: newDomainName, userEmail };
      await domainServices.addDomain(payload);
      toast.success("Domain added successfully");
      fetchDomains();
      setShowAddModal(false);
      setNewDomainName("");
    } catch (err) {
      console.error("Add error:", err);
      toast.error(err?.response?.data?.error || "Failed to add domain");
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchDomains();
    }
  }, [userEmail]);

  const filteredDomains = domains.filter(
    (domain) =>
      domain.userEmail === userEmail &&
      domain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!selectAllRef.current) return;
    if (selectedRows.length === 0) {
      selectAllRef.current.indeterminate = false;
      selectAllRef.current.checked = false;
    } else if (selectedRows.length === filteredDomains.length) {
      selectAllRef.current.indeterminate = false;
      selectAllRef.current.checked = true;
    } else {
      selectAllRef.current.indeterminate = true;
      selectAllRef.current.checked = false;
    }
  }, [selectedRows, filteredDomains]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredDomains.map((_, idx) => idx));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (idx) => {
    setSelectedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="animate-fade-in-up">
      <ToastContainer position="top-right" />

      <div className="flex justify-between items-center mb-6">
        <button
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#700070] text-sm font-semibold shadow"
          onClick={() => setShowDomainsInline(false)}
        >
          &larr; Back to Profile
        </button>

        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold shadow flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <PlusCircle className="w-5 h-5" /> Add Domain
        </button>
      </div>

      <div className="mb-4">
        <span className="text-gray-500 text-sm">Members / My domains</span>
        <h2 className="text-xl font-bold mt-2 mb-1 text-primary flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          Listing all domains <span className="font-normal text-gray-700">{filteredDomains.length} domains</span>
        </h2>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-gray-50"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-lg shadow-xl animate-fade-in-up">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  onChange={handleSelectAll}
                  aria-label="Select all domains"
                />
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Domain</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Schedule</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Added</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Error code</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Scan</th>
            </tr>
          </thead>
          <tbody>
            {filteredDomains.map((domain, idx) => (
              <tr key={domain._id || idx} className="hover:bg-purple-50 transition-colors duration-200">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(idx)}
                    onChange={() => handleSelectRow(idx)}
                    aria-label={`Select domain ${domain.name}`}
                  />
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {domain.name}
                </td>
                <td className="px-4 py-3 flex gap-2 items-center">
                  <button
                    title="Favorite"
                    className="text-gray-400 hover:text-primary"
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                  <button
                    title="Delete"
                    className="text-red-400 hover:text-red-600"
                    onClick={() => handleDelete(domain._id, domain.name)}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a2 2 0 0 1 2-2z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                </td>
                <td className="px-4 py-3">-</td>
                <td className="px-4 py-3">
                  {new Date(domain.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Complete
                  </span>
                </td>
                <td className="px-4 py-3">-</td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal-400 transition"></div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 bg-opacity-30 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><PlusCircle className="w-5 h-5 text-primary" /> Add Domain</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Enter domain name"
              value={newDomainName}
              onChange={(e) => setNewDomainName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#700070] shadow"
                onClick={handleAddDomainSubmit}
              >
                Add
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainsInline;
